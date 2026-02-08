import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Configuration du client Supabase avec options pour améliorer la compatibilité CORS
export const supabase = createSupabaseClient(supabaseUrl, publicAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Configuration pour améliorer la compatibilité CORS
    flowType: 'pkce', // Utilise PKCE pour une meilleure sécurité et compatibilité
  },
  global: {
    headers: {
      'X-Client-Info': 'kitchin-web',
    },
  },
});

export function createClient() {
  return supabase;
}
