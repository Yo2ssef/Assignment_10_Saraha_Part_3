import mongoose from 'mongoose';
import { DB_URI } from '../config/config.js';
import { UserModel } from './models/index.js';
import { connectRedis } from './connection.redis.js';
export const bootStrap = async (app, port) => {
    try {
        mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 30000 })
        console.log(`Database connected successfully....`);
        await connectRedis()
        await UserModel.syncIndexes()
        app.listen(port, () => console.log(`Server is running http://localhost:${port}....`))
    } catch (error) {
        console.log(`Fail to connect on database.... Error::${error}`);
        process.exit(1)
    }
}