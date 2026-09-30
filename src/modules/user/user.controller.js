import Router from 'express';
import { authentication, authorization, validation } from '../../middleware/index.js';
import { successResponse } from '../../common/utils/index.js';
import { RoleUserEnum } from '../../common/enums/index.js';
import { allUsers, updateUser, profile } from './user.service.js';
import { userDataSchemaToUpdate } from './user.validation.js';
const router = Router()

router.get("/", authentication(), async (req, res, next) => {
    const data = await profile(req.user)
    successResponse({ res, data })
})

router.patch("/", validation(userDataSchemaToUpdate), authentication(), async (req, res, next) => {
    const data = await updateUser(req.payload, req.validated.body)
    successResponse({ res, message: "Updated successfully.", data })
})

router.get("/all", authentication(), authorization(RoleUserEnum.ADMIN), async (req, res, next) => {
    const data = await allUsers()
    successResponse({ res, data })
})

export default router