import { createClient, User } from '@supabase/supabase-js';
import { Application, NextFunction, Request, Response } from 'express';
import * as dotenv from 'dotenv'
dotenv.config()

export const authMiddleware = (app: Application) => {
    app.all('*', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const supabaseUri = process.env.SUPABASE_URL
            const serviceRoleKey = process.env.SERVICE_ROLE_KEY

            if (!supabaseUri || !serviceRoleKey)
                return res.status(400).json({ message: 'No vars found' });

            const supabase = createClient(supabaseUri, serviceRoleKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            });

            const access_token = req.headers['authorization'];
            if (!access_token) return res.status(400).json({ message: 'No access token found', req });


            const { error, data } = await supabase.auth.getUser(access_token);
            const user: User | null = data.user;
            if (error && !user) {
                console.error(`Not authenticated: ${error.message}`);
                return res.status(401).json({ message: error.message });
            }
            
            req.body.user = user;

            next();

        } catch (err: any) {
            console.error(`Authentication error: ${err.message}`);
            return res.status(500).json({ message: 'Internal server error' });
        }

    })
};