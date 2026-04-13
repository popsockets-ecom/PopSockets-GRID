import { createClient } from '@supabase/supabase-js';

const PIT_URL = 'https://xjvwwwfpauazdzibclmc.supabase.co';
const PIT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqdnd3d2ZwYXVhemR6aWJjbG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk2MzAsImV4cCI6MjA4NDc3NTYzMH0.p9JH6Yo-Vo7Pc-8TI9bvAjCSSHrP6skXLIOmfu6mFik';

const pit = createClient(PIT_URL, PIT_KEY);
const APP_NAME = 'GRID';

const FALLBACK = [
  { password: 'BEBOLD', role: 'user',  label: 'User' },
  { password: 'ADMIN',  role: 'admin', label: 'Admin' },
];

export function getFallbackPitPasswords() {
  return FALLBACK;
}

export async function fetchPitPasswords() {
  try {
    const { data, error } = await pit.rpc('get_app_passwords', { p_app_name: APP_NAME });
    if (error || !Array.isArray(data) || data.length === 0) {
      if (error) console.warn('[pitPasswords] RPC error, using fallback:', error.message);
      return FALLBACK;
    }
    return data;
  } catch (err) {
    console.warn('[pitPasswords] RPC threw, using fallback:', err);
    return FALLBACK;
  }
}
