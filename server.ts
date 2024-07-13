import express, { Express } from "express";
import cors from 'cors'
import router from "./router/routes";
import dotenv from 'dotenv'
import { authMiddleware } from "./startup/middleware";

dotenv.config();

const app: Express = express();

const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json())

authMiddleware(app)
router(app);

app.listen(port, () => {
    console.log(`Started server on port ${port}`);
});