import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export function LoginPage({
  appName = 'Dashboard',
  tagline = 'Enter password to continue',
  logoSrc,
  logoComponent,
  onSubmit,
  error,
  isLoading = false,
  buttonText = 'Access Dashboard',
  footerText = 'Protected data • Authorized access only'
}) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(password);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            {(logoSrc || logoComponent) && (
              <div className="flex justify-center mb-4">
                {logoComponent ? logoComponent : (
                  <img src={logoSrc} alt={`${appName} Logo`} className="h-16" />
                )}
              </div>
            )}
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to {appName}</h1>
            <p className="text-slate-400">{tagline}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : buttonText}
            </button>
          </form>

          {footerText && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">{footerText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
