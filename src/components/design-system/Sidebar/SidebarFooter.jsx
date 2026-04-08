import React from 'react';
import { LogOut } from 'lucide-react';

export function SidebarFooter({ onLogout, footerContent, showLogout = true, showCopyright = true }) {
  return (
    <div className="p-3 border-t border-slate-700">
      <div className="space-y-2">
        {footerContent}
        {showLogout && onLogout && (
          <button
            onClick={onLogout}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-red-900/80 hover:to-slate-700 px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 border border-slate-600 hover:border-red-800/50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        )}
      </div>
      {showCopyright && (
        <p className="text-xs text-slate-500 text-center mt-3">© 2026 PopSockets</p>
      )}
    </div>
  );
}

export default SidebarFooter;
