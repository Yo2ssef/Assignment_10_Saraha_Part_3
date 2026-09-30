import Router from 'express';
import { successResponse } from '../../common/utils/index.js';
import { signUp, login, signUpAndLoginWithGmail, logOut, rotateToken } from './auth.service.js';
import { authentication, validation } from '../../middleware/index.js';
import { loginSchema, logOutSchema, signUpSchema } from './auth.validation.js';
import { issuerLink } from '../../common/security/index.js';
import { TokenTypeEnum } from '../../common/enums/index.js';
const router = Router()

router.post("/signup-login-with-gmail", async (req, res, next) => {
    const issuer = issuerLink({ protocol: req.protocol, host: req.host })
    const { status, data } = await signUpAndLoginWithGmail(req.body, issuer)
    successResponse({ res, status, message: "Successfully logged in.", data })
})

router.post("/signup", validation(signUpSchema), async (req, res, next) => {
    const data = await signUp(req.validated.body)
    successResponse({ res, status: 201, message: "Successfully signed up." })
})

router.post("/login", validation(loginSchema), async (req, res, next) => {
    const issuer = issuerLink({ protocol: req.protocol, host: req.host })
    const data = await login(req.validated.body, issuer)
    successResponse({ res, message: "Successfully logged in.", data })
})

router.post("/rotate-token", authentication(TokenTypeEnum.REFRESH), async (req, res, next) => {
    const issuer = issuerLink({ protocol: req.protocol, host: req.host })
    const data = await rotateToken(req.user, req.payload, issuer)
    successResponse({ res, status: 201, data })
})

router.post("/logout", validation(logOutSchema), authentication(), async (req, res, next) => {
    const { user, message } = await logOut(req.user, req.payload, req.validated.body)
    successResponse({ res, message })
})

export default router