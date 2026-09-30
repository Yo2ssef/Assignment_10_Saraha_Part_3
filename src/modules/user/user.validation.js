import z from 'zod';
import { generalValidationFields } from '../../common/validation.js';
const { userName, phone, dateOfBirth, gender, jwt } = generalValidationFields;
export const tokenSchema = (lang) => {
    return z.object({
        authorization: jwt(lang)
    })
}

export const userDataSchemaToUpdate = (lang) => {
    return z.object({
        body: z.strictObject({
            userName: userName(lang).optional(),
            phone: phone(lang).optional(),
            dateOfBirth: dateOfBirth(lang).optional(),
            gender: gender(lang).optional()
        })
    })
}