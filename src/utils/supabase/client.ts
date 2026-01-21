import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Valeurs par défaut pour le mode démo si les clés ne sont pas définies
const defaultProjectId = 'demo';
const defaultAnonKey = 'demo-key';

const supabaseUrl = `https://${projectId || defaultProjectId}.supabase.co`;

// Gérer le cas où les clés ne sont pas définies (mode démo)
let supabaseInstance;
try {
  supabaseInstance = createSupabaseClient(
    supabaseUrl, 
    publicAnonKey || defaultAnonKey
  );
} catch (error) {
  console.warn('Supabase initialization error (mode démo):', error);
  // Créer un client factice pour le mode démo
  supabaseInstance = createSupabaseClient(
    'https://demo.supabase.co',
    'demo-key'
  );
}

export const supabase = supabaseInstance;

export function createClient() {
  return supabase;
}
