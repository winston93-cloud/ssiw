import { createClient } from '@supabase/supabase-js'

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL! + '/rest/v1'
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!

export const insforge = createClient(insforgeUrl, insforgeAnonKey)
