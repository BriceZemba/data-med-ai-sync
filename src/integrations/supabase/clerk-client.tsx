import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://kwrokfbropptrbzvpwct.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cm9rZmJyb3BwdHJienZwd2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNzMwNjksImV4cCI6MjA2ODk0OTA2OX0.kKtz3lJiuW1PgS42sm6Sl0TalzaCTxmsfF2KCWdSykY';

export const createSupabaseClient = (clerkToken: string) =>
  createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${clerkToken}` } },
  });