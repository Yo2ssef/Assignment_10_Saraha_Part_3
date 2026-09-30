import z from 'zod';
import { GenderUserEnum, languageEnum } from '../common/enums/index.js';

export const generalValidationFields = {
    email: (lang) => z.email({
        error: lang == languageEnum.EN ?
            "Invalid email address format. Example: name@example.com" :
            "صيغة البريد الإلكتروني غير صحيحة. مثال: name@example.com"
    }).regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),

    password: (lang) => z.string({
        error: lang == languageEnum.EN ?
            "Must be 8–20 characters, contain at least one uppercase letter, and include a special character (@$#!&*%)." :
            "يجب أن تكون من 8 إلى 20 خانة، تحتوي على حرف كبير واحد على الأقل، ورمز خاص (@$#!&*%)."
    }).regex(/^(?=.*[A-Z])(?=.*[@$#!&*%])[a-zA-Z0-9@$#!&*%]{8,20}$/),

    userName: (lang) => z.string({
        error: lang == languageEnum.EN ?
            "Must consist of two words only, separated by a space, with the first letter capitalized." :
            "يجب أن يتكون الاسم من كلمتين فقط و يجب أن يكونا مفصولة بمسافة و اول حرف كبير."
    }).regex(/^[A-Z][a-zA-Z]*\s[a-zA-Z]+$/).min(3).max(20),

    phone: (lang) => z.e164({
        error: lang == languageEnum.EN ?
            "Phone number must be in E.164 format (e.g., +201234567890)." :
            "يجب أن يكون رقم الهاتف في صيغة E.164 (مثلاً: +201234567890)."
    }),

    dateOfBirth: (lang) => z.coerce.date({
        error: lang == languageEnum.EN ?
            "Date of birth must be in YYYY-MM-DD format (e.g., 2000-05-15)." :
            "يجب أن يكون تاريخ الميلاد بصيغة YYYY-MM-DD (مثال: 2000-05-15)."
    }),

    gender: (lang) => z.enum(GenderUserEnum, {
        error: lang == languageEnum.EN ?
            "Invalid gender selection." :
            "اختيار الجنس غير صحيح."
    }),

    jwt: (lang) => z.jwt({
        error: lang == languageEnum.EN ?
            "Invalid JWT token format." :
            "صيغة رمز JWT غير صحيحة."
    })
}