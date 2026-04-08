import React from 'react';
import { X } from 'lucide-react';

export function SidebarHeader({ appName, tagline, logoSrc, logoComponent, isMobile = false, onClose }) {
  return (
    <div className="px-6 py-4 border-b border-slate-600/50 bg-gradient-to-r from-slate-800 via-purple-800 to-blue-800 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        {logoComponent ? (
          <div className="flex-shrink-0">{logoComponent}</div>
        ) : logoSrc ? (
          <img src={logoSrc} alt={`${appName} Logo`} className="w-8 h-8 rounded-md flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">{appName?.charAt(0) || 'P'}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-white whitespace-nowrap">PopSockets {appName}</h1>
          {tagline && <p className="text-xs text-slate-200 leading-tight">{tagline}</p>}
        </div>
        {isMobile && onClose && (
          <button onClick={onClose} className="p-2 text-slate-200 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors lg:hidden" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SidebarHeader;
