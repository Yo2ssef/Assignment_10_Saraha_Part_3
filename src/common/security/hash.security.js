import bcrypt from 'bcrypt';
export const hash = async (plainText, rounds = 12, minor = "b") => {
    if (!plainText) return undefined
    const salt = (await bcrypt.genSalt(rounds, minor)).toString()
    const hashText = await bcrypt.hash(plainText, salt)
    return hashText
}

export const compareHash = async (plainText, hashValue) => {
    if (!plainText || !hashValue) return undefined
    const result = await bcrypt.compare(plainText, hashValue)
    return result
}