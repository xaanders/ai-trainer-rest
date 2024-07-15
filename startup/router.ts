import express, { Request, Response } from 'express';
import schemaGeneratorController from '../controllers/schemaGeneratorController';

const router = express.Router();

router.route('/api/workout-generate')
    .post(schemaGeneratorController().post);

router.route('/api')
    .get((req: Request, res: Response) => {
        res.json({ message: "hello world" }); // Send specific properties in response
    });

export default router;