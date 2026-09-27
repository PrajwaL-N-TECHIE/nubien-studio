import { createClient } from '@supabase/supabase-js';

// 1. Dedicated Supabase Project for Buiz Studio & Buiz Arena
export const BUIZ_SUPABASE_URL = (
  import.meta.env.VITE_BUIZ_SUPABASE_URL || 'https://paigrnspffprttxtprev.supabase.co'
).trim();

export const BUIZ_SUPABASE_ANON_KEY = (
  import.meta.env.VITE_BUIZ_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhaWdybnNwZmZwcnR0eHRwcmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0ODExMjUsImV4cCI6MjEwNjA1NzEyNX0.jbBQhysqY9L6-ChYmuvUIFFnGTN2-Fco7OVli11b5Bs'
).trim();

export const isBuizSupabaseConfigured = Boolean(
  BUIZ_SUPABASE_URL &&
  BUIZ_SUPABASE_ANON_KEY &&
  BUIZ_SUPABASE_URL.startsWith('https://') &&
  !BUIZ_SUPABASE_URL.includes('placeholder')
);

export const buizSupabase = createClient(BUIZ_SUPABASE_URL, BUIZ_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// 2. Supabase Project for B-Forms
export const BFORMS_SUPABASE_URL = (
  import.meta.env.VITE_SUPABASE_URL || 'https://uwygbhokcixvalkmvvck.supabase.co'
).trim();

export const BFORMS_SUPABASE_ANON_KEY = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3eWdiaG9rY2l4dmFsa212dmNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0ODQ0NzcsImV4cCI6MjEwNjA2MDQ3N30.SUiHez2vk50xlBzpNIB1305wY1PNhE0v0uKa83xDJ2g'
).trim();

export const isBFormsSupabaseConfigured = Boolean(
  BFORMS_SUPABASE_URL &&
  BFORMS_SUPABASE_ANON_KEY &&
  BFORMS_SUPABASE_URL.startsWith('https://') &&
  !BFORMS_SUPABASE_URL.includes('placeholder')
);

export const bformsSupabase = createClient(BFORMS_SUPABASE_URL, BFORMS_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Default export mappings for backward compatibility
export const supabase = buizSupabase;
export const isSupabaseConfigured = isBuizSupabaseConfigured;
