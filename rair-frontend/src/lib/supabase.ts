import { createClient } from '@supabase/supabase-js';

// Supabase client — created once and reused everywhere.
// VITE_ prefix makes env vars available in the browser bundle.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);
