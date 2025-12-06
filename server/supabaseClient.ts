import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceRole) {
    console.error("Supabase environment variables missing");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRole);
