import express, { Request, Response } from 'express';
import schemaGeneratorController from '../controllers/schemaGeneratorController';

const schemaGeneratorRouter = express.Router();

schemaGeneratorRouter.route('/workout-generate')
    .post(schemaGeneratorController().post);

schemaGeneratorRouter.route('/')
    .get((req: Request, res: Response) => {
        // Example: Send specific properties of req object
        const requestData = {
            method: req.method,
            url: req.url,
            headers: req.headers,
            // Add more properties as needed, but avoid including req itself
        };
        
        console.log(JSON.stringify({ requestData })); // Log specific properties, not req itself
        res.json({ requestData }); // Send specific properties in response
    });

export default schemaGeneratorRouter;