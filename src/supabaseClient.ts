import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials
// You can find them in your Supabase project settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
