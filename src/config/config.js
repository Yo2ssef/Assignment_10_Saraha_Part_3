import { resolve } from 'node:path';
import { config } from 'dotenv';
export const NODE_ENV = process.env.NODE_ENV ?? "development";
config({ path: resolve(`.env.${NODE_ENV}`) })

export const PORT = parseInt(process.env.PORT ?? 9000)
export const DB_URI = process.env.DB_URI
export const REDIS_URI = process.env.REDIS_URI

export const ENC_KEY = process.env.ENC_KEY
export const IV_LENGTH = parseInt(process.env.IV_LENGTH)

export const USER_ACCESS_TOKEN_SIGNATURE = process.env.USER_ACCESS_TOKEN_SIGNATURE
export const USER_REFRESH_TOKEN_SIGNATURE = process.env.USER_REFRESH_TOKEN_SIGNATURE

export const ADMIN_ACCESS_TOKEN_SIGNATURE = process.env.ADMIN_ACCESS_TOKEN_SIGNATURE
export const ADMIN_REFRESH_TOKEN_SIGNATURE = process.env.ADMIN_REFRESH_TOKEN_SIGNATURE

export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
export const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN)

export const WEB_CLIENT_ID = process.env.WEB_CLIENT_ID

