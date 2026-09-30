import crypto from 'node:crypto';
import { ENC_KEY, IV_LENGTH } from '../../config/config.js';
export const encrypt = async (plainText) => {
    if (!plainText) return undefined
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv("aes-256-cbc", ENC_KEY, iv)
    let cipherText = cipher.update(plainText, "utf-8", "hex").toString()
    cipherText += cipher.final("hex")
    return `${iv.toString("hex")}::${cipherText}`
}

export const decrypt = async (cipherText) => {
    if (!cipherText) return undefined
    const [iv, encryptedText] = cipherText.split("::")
    const binaryIv = Buffer.from(iv, "hex")
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENC_KEY, binaryIv)
    let plainText = decipher.update(encryptedText, "hex", "utf8")
    plainText += decipher.final("utf-8")
    return plainText
}