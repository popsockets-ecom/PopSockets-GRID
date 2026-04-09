/**
 * PopSockets Design System - LoginPage Component
 *
 * Reusable password login page for all PopSockets apps.
 * Provides consistent styling across PRISM, PATH, PAIR, BEAM, etc.
 *
 * Design:
 * - Solid slate-900 background
 * - Solid slate-800 card with border
 * - "PopSockets [NAME]" with app name in purple
 * - Tagline showing full acronym meaning
 * - Lock icon in password field
 * - Solid purple-600 button
 *
 * Props:
 * - appName: Name of the app (e.g., "PAIR", "PATH", "PRISM")
 * - tagline: App tagline/description (full acronym meaning)
 * - logoSrc: Path to logo image
 * - onSubmit: Function called with password when form is submitted
 * - error: Error message to display
 * - buttonText: Text for submit button (default: "Sign In")
 * - footerText: Footer message (default: none)
 */

import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export function LoginPage({
  appName = 'Dashboard',
  tagline = 'Enter password to continue',
  logoSrc = '/logo.png',
  onSubmit,
  error,
  buttonText = 'Sign In',
  footerText
}) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(password);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            {logoSrc && (
              <div className="flex justify-center mb-4">
                <img
                  src={logoSrc}
                  alt={`${appName} Logo`}
                  className="h-20"
                />
              </div>
            )}
            <h1 className="text-2xl font-bold text-white">
              PopSockets <span className="text-purple-400">{appName}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">{tagline}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 active:scale-[0.98]"
            >
              {buttonText}
            </button>
          </form>

          {/* Footer */}
          {footerText && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                {footerText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
