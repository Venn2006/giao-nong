import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uoqwsfltlbdqwwmwunzp.supabase.co'
const supabaseAnonKey = 'sb_publishable_kDxrE8g9h8Cz7fCrYDClhQ_1w52Y2Ef'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)