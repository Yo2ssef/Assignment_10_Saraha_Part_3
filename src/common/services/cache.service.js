import { client } from '../../database/connection.redis.js';

export const set = async ({ key, value, ttl = undefined } = {}) => {
    if (typeof value == "object") value = JSON.stringify(value)
    return await client.set(key, value, { EX: ttl })
}
export const get = async ({ key } = {}) => {
    let value = await client.get(key)
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}
export const exist = async ({ key } = {}) => {
    return await client.exists(key)
}
export const update = async ({ key, value, ttl = undefined } = {}) => {
    if (!await exist({ key })) return false
    return await set({ key, value, ttl })
}
export const del = async ({ key } = {}) => {
    return await client.del(key)
}
export const keys = async ({ prefix } = {}) => {
    return await client.keys(`${prefix}*`)
}
export const ttl = async ({ key } = {}) => {
    return client.ttl(key)
}