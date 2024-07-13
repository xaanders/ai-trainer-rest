
import { Application } from 'express';
import schemaGeneratorRouter from './schemaGenerator';

const router =  (app: Application) => {
    app.use('/api', schemaGeneratorRouter);
};

export default router