import { createClient } from '@supabase/supabase-js';

// Hardcoded values for now
const supabaseUrl = 'https://kitaxfuukuasjykarxrn.supabase.co';
const supabaseAnonKey = 'sb_publishable_oy9Rp_Ekfjxtw7uIGabmww_gXs6m73b';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
