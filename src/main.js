import express from 'express';
import cors from 'cors';
import { PORT } from './config/config.js';
import { globalErrorHandling } from './middleware/index.js';
import { bootStrap } from './database/connection.database.js';
import { authController, userController } from './modules/index.js';

const app = express()
await bootStrap(app, PORT)
app.use(cors(), express.json())

app.use("/auth", authController)
app.use("/user", userController)

app.use(globalErrorHandling)
app.all("/*anyThing", (req, res) => res.status(404).json({ message: "Invalid app routing." }))