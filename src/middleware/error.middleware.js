import { NODE_ENV } from '../config/config.js';
export const globalErrorHandling = (error, req, res, next) => {
    const errorName = error?.name?.toLowerCase() || ""
    if (errorName.includes("jsonwebtokenerror") || errorName.includes("tokenexpirederror")) {
        error.cause ??= { status: 401 }
    }
    if (errorName.includes("validation") || errorName.includes("sequelize")) {
        error.cause ??= { status: 400 }
    }
    const isProd = NODE_ENV === "production"
    const defaultMessage = "Something went wrong server error."
    const status = error?.cause?.status ?? 500
    const extra = error?.cause?.extra
    const messageExtra = extra ? extra[0]?.message : undefined
    const message = isProd && status === 500
        ? defaultMessage
        : (messageExtra || error?.message || defaultMessage)
    return res.status(status).json({
        status,
        message,
        extra: isProd ? undefined : extra,
        error: isProd ? undefined : error,
        stack: isProd ? undefined : error?.stack
    })
}