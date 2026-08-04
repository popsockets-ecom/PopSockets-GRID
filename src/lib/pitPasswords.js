import { createClient } from '@supabase/supabase-js';

const PIT_URL = 'https://xjvwwwfpauazdzibclmc.supabase.co';
const PIT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqdnd3d2ZwYXVhemR6aWJjbG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTk2MzAsImV4cCI6MjA4NDc3NTYzMH0.p9JH6Yo-Vo7Pc-8TI9bvAjCSSHrP6skXLIOmfu6mFik';

const pit = createClient(PIT_URL, PIT_KEY);
const APP_NAME = 'GRID';

// ── Login (verified SERVER-SIDE, 2026-08-04) ─────────────────────────────────
//
// This module used to call get_app_passwords, which returned every PIT password
// in plaintext, and the app compared the typed one in the browser. That RPC is
// SECURITY DEFINER and was granted to anon, and the anon key above ships in the
// bundle - so anyone could read all 100 credentials across 18 apps. The
// hardcoded FALLBACK array published a second copy of GRID's two.
//
// pit_login does the comparison in the database and returns only a role.
// Never reintroduce a function that returns password values to the browser.

/**
 * @returns {Promise<{success: boolean, identity?: {role: string, label: string}, error?: string}>}
 */
export async function verifyPitLogin(password) {
  try {
    const { data, error } = await pit.rpc('pit_login', {
      p_app_name: APP_NAME, p_email: null, p_password: password,
    });
    if (error) {
      console.warn('[pitPasswords] pit_login error:', error.message);
      return { success: false, error: error.message };
    }
    return data || { success: false, error: 'no response' };
  } catch (err) {
    console.warn('[pitPasswords] pit_login threw:', err);
    return { success: false, error: err.message || 'unknown error' };
  }
}
