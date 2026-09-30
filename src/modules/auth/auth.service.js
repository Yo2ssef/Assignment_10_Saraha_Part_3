import { UserModel } from '../../database/models/index.js';
import { createOne, findOne } from '../../common/repository/index.js';
import { ConflictException, NotFoundException, UnauthorizedException } from '../../common/executions/error.exception.js';
import { compareHash, createLoginCredentials, createRevokeToken, encrypt, hash, userBaseRevokeTokenKey } from '../../common/security/index.js';
import { OAuth2Client } from 'google-auth-library';
import { ACCESS_TOKEN_EXPIRES_IN, WEB_CLIENT_ID } from '../../config/config.js';
import { logOutEnum, ProviderUserEnum } from '../../common/enums/index.js';
import { del, keys } from '../../common/services/index.js';

const client = new OAuth2Client();
async function verifyGmail(idToken) {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload.email_verified) throw BadRequestException("Email not verified.")
        return payload
    } catch (error) {
        throw UnauthorizedException("Invalid or expired google token.", error)
    }
}

export const signUpAndLoginWithGmail = async ({ idToken }, issuer) => {
    const { name, email, picture } = await verifyGmail(idToken)
    const existsAccount = await findOne({
        model: UserModel,
        filter: { email }
    })

    if (existsAccount) {
        if (existsAccount.provider !== ProviderUserEnum.GOOGLE) {
            throw ConflictException("Invalid account provider.")
        }
        return { status: 200, data: await createLoginCredentials({ user: existsAccount, issuer }) }
    }

    const user = await createOne({
        model: UserModel,
        data: {
            email,
            userName: name,
            provider: ProviderUserEnum.GOOGLE,
            confirmEmail: new Date(),
            image: picture
        }
    })
    return { status: 201, data: await createLoginCredentials({ user, issuer }) }
}

export const signUp = async ({ userName, email, password, gender, dataOfBirth, phone }) => {
    const duplicatedEmail = await findOne({
        model: UserModel,
        filter: { email }
    })
    if (duplicatedEmail) throw ConflictException("Email already exists.")

    const data = await createOne({
        model: UserModel,
        data: {
            userName,
            email,
            password: await hash(password),
            gender,
            dataOfBirth,
            phone: await encrypt(phone)
        }
    })
    return data
}

export const login = async ({ email, password }, issuer) => {
    const user = await findOne({
        model: UserModel,
        filter: { email },
    })
    if (!user) throw NotFoundException("Invalid email or password.")

    const match = await compareHash(password, user.password)
    if (!match) throw NotFoundException("Invalid email or password.")

    const { accessToken, refreshToken } = await createLoginCredentials({ user, issuer })
    return { accessToken, refreshToken }
}

export const rotateToken = async (user, payload, issuer) => {
    const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000
    const currentTime = Date.now() + (5 * 60000)
    if (currentTime < accessExpiresIn) throw ConflictException("Sorry we cannot create new login credentials while current access token still within valid time range")
    const data = await createLoginCredentials({ user, issuer })
    await createRevokeToken({ payload })
    return data
}

export const logOut = async (user, payload, { action }) => {
    let message;
    switch (action) {
        case logOutEnum.ALL:
            user.ChangeCredentialsTime = Date.now()
            user.save()
            const sessionsUser = await keys({
                prefix: userBaseRevokeTokenKey({ userId: payload.sub })
            })
            if (sessionsUser.length) await del({ key: sessionsUser })
            message = "Logged out from all sessions successfully."
            break;
        default:
            await createRevokeToken({ payload })
            message = "Logged out from current session successfully."
            break;
    }
    return { user, message }
}