import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRES_IN, ADMIN_ACCESS_TOKEN_SIGNATURE, ADMIN_REFRESH_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRES_IN, USER_ACCESS_TOKEN_SIGNATURE, USER_REFRESH_TOKEN_SIGNATURE } from '../../config/config.js';
import { RoleUserEnum, TokenTypeEnum } from '../enums/index.js'
import { findById } from '../repository/index.js';
import { UserModel } from '../../database/models/index.js';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../executions/error.exception.js';
import { randomUUID } from 'node:crypto';
import { exist, set } from '../services/index.js'
export const issuerLink = ({ protocol, host } = {}) => {
    return `${protocol}://${host}`
}

export const userBaseRevokeTokenKey = ({ userId } = {}) => {
    return `User::${userId.toString()}::RevokeToken`
}

export const userRevokeTokenKey = ({ userId, jti } = {}) => {
    return `${userBaseRevokeTokenKey({ userId })}::${jti}`
}

const getTokenSignatures = async ({ role = RoleUserEnum.USER } = {}) => {
    let signatures;
    switch (role) {
        case RoleUserEnum.ADMIN:
            signatures = {
                accessSignature: ADMIN_ACCESS_TOKEN_SIGNATURE,
                refreshSignatures: ADMIN_REFRESH_TOKEN_SIGNATURE
            }
            break;
        default:
        case RoleUserEnum.USER:
            signatures = {
                accessSignature: USER_ACCESS_TOKEN_SIGNATURE,
                refreshSignatures: USER_REFRESH_TOKEN_SIGNATURE
            }
            break;
    }
    return signatures
}

const getTokenType = async ({ tokenType = TokenTypeEnum.ACCESS, role = RoleUserEnum.USER } = {}) => {
    const { accessSignature, refreshSignatures } = await getTokenSignatures({ role })
    return tokenType == TokenTypeEnum.ACCESS ? accessSignature : refreshSignatures
}

export const createToken = async ({
    payload = {},
    secret = USER_ACCESS_TOKEN_SIGNATURE,
    options = {}
} = {}) => {
    return jwt.sign(payload, secret, options)
}

export const verifyToken = async ({
    token = {},
    secret = USER_ACCESS_TOKEN_SIGNATURE
} = {}) => {
    return jwt.verify(token, secret)
}

export const createLoginCredentials = async ({ user = {}, issuer = {}, options = {} } = {}) => {
    const { accessSignature, refreshSignatures } = await getTokenSignatures({ role: user.role })
    const jwtid = randomUUID()
    const accessToken = await createToken({
        payload: { sub: user._id },
        secret: accessSignature,
        options: {
            ...options,
            audience: [user.role],
            jwtid,
            issuer,
            expiresIn: ACCESS_TOKEN_EXPIRES_IN
        }
    })
    const refreshToken = await createToken({
        payload: { sub: user._id },
        secret: refreshSignatures,
        options: {
            ...options,
            audience: [user.role],
            issuer,
            jwtid,
            expiresIn: REFRESH_TOKEN_EXPIRES_IN
        }
    })
    return { accessToken, refreshToken }
}

export const decodeToken = async ({ authorization = {}, tokenType = TokenTypeEnum.ACCESS } = {}) => {
    const decoded = jwt.decode(authorization)
    if (!decoded?.aud?.length) throw BadRequestException("Missing token.")

    const payload = await verifyToken({
        token: authorization,
        secret: await getTokenType({ tokenType, role: decoded.aud[0] })
    })
    if (!payload?.sub) throw BadRequestException("Missing token.")

    if (await exist({
        key: userRevokeTokenKey({
            userId: payload.sub,
            jti: payload.jti
        })
    })) {
        throw UnauthorizedException("Token has been revoked, please login again.")
    }

    const user = await findById({
        model: UserModel,
        id: payload?.sub,
        select: "-password -provider"
    })
    if (!user) throw NotFoundException("User not found.")

    if (user?.ChangeCredentialsTime?.getTime() > payload?.iat * 1000) {
        throw UnauthorizedException("Token has been revoked, please login again.")
    }
    return { user, payload }
}

export const createRevokeToken = async ({ payload }) => {
    const consumedTime = (Math.ceil(Date.now() / 1000) - payload.iat)
    const refreshExpiresIn = payload.iat - REFRESH_TOKEN_EXPIRES_IN
    const ttl = refreshExpiresIn - consumedTime
    const userId = payload.sub
    const jti = payload.jti
    await set({
        key: userRevokeTokenKey({ userId, jti }),
        value: jti,
        ttl
    })
    return { message: "Token revoked successfully." }
}