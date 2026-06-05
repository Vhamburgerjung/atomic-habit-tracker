import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars — fill in .env.local');
}

// AsyncStorage uses `window` which doesn't exist during Expo web SSR (Node.js render pass).
// This adapter falls back to a no-op on the server so the module loads safely.
const ssrSafeStorage =
  typeof window === 'undefined'
    ? {
        getItem: async (_key: string) => null,
        setItem: async (_key: string, _value: string) => {},
        removeItem: async (_key: string) => {},
      }
    : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ssrSafeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
