import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yezfvmrhcmstejsjfrpl.supabase.co'
const supabaseAnonKey = 'sb_publishable_VJ9_537-00lGeZfnJu_Bbw_Ax9Z9g9d'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
