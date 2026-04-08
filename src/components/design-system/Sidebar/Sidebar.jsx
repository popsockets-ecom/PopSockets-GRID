import React from 'react';
import { Menu } from 'lucide-react';
import { useMobileDetect } from '../../../hooks/useMobileDetect.js';
import { SidebarHeader } from './SidebarHeader.jsx';
import { SidebarNav } from './SidebarNav.jsx';
import { SidebarFooter } from './SidebarFooter.jsx';

export function Sidebar({
  appName, tagline, logoSrc, logoComponent,
  navigationItems = [], activeItem, onNavigate,
  onLogout, footerContent, headerExtra,
  isOpen = false, onClose, onOpen,
  showLogout = true, showCopyright = true
}) {
  const isMobile = useMobileDetect();

  return (
    <>
      {isMobile && onOpen && (
        <button onClick={onOpen} className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800 p-2 rounded-lg text-slate-300 hover:text-white transition-colors" aria-label="Open menu">
          <Menu className="w-6 h-6" />
        </button>
      )}
      {isMobile && isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />
      )}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 min-w-64 max-w-64
        bg-slate-800 border-r border-slate-700
        flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        lg:translate-x-0
      `}>
        <SidebarHeader appName={appName} tagline={tagline} logoSrc={logoSrc} logoComponent={logoComponent} isMobile={isMobile} onClose={onClose} />
        {headerExtra && <div className="px-3 pb-2">{headerExtra}</div>}
        <SidebarNav navigationItems={navigationItems} activeItem={activeItem} onNavigate={onNavigate} onClose={isMobile ? onClose : undefined} />
        <SidebarFooter onLogout={onLogout} footerContent={footerContent} showLogout={showLogout} showCopyright={showCopyright} />
      </aside>
    </>
  );
}

export default Sidebar;
