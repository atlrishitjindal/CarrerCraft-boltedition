import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Helper to get env var with legacy/Vite fallback
const getEnv = (key: string, viteKey: string) => {
  return process.env[key] || process.env[viteKey] || '';
};

const supabaseUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_SERVICE_ROLE_KEY'); // Fallback purely theoretical as Vite usually doesn't expose service key
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables in server/config/database.ts');
  console.error('URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('Service Key:', supabaseServiceKey ? 'Set' : 'Missing');
  // We don't throw immediately to allow app to start, but DB ops will fail
}

// Admin client with Service Role Key (Bypass RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Standard client with Anon Key (Respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});
