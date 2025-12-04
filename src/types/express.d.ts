import { User } from '@supabase/supabase-js';
import 'express';

declare module 'express' {
    export interface Request {
        user?: User;
    }
}
