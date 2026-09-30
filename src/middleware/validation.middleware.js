import { languageEnum } from '../common/enums/index.js';
import { BadRequestException } from '../common/executions/error.exception.js';
export const validation = (schema) => {
    return async (req, res, next) => {
        const lang = req.headers["accept-language"] ?? languageEnum.EN
        const validateData = schema(lang).safeDecode({
            body: req.body,
            params: req.params,
            query: req.query,
            headers: req.headers
        })
        if (!validateData.success) throw BadRequestException("Validation Error.", validateData.error.issues)
        req.validated = validateData.data
        next()
    }
} 