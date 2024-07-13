import { User } from '@supabase/supabase-js'; // Adjust the import based on your user type location

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
    interface ProcessEnv {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      OPENAI_API_KEY: string;
      SERVICE_ROLE_KEY: string;
      PORT?: string;
    }
  }
}
