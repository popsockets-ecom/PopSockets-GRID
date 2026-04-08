import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { NavItem } from './NavItem.jsx';

export function SidebarNav({ navigationItems = [], activeItem, onNavigate, onClose }) {
  return (
    <nav className="flex-1 p-4 overflow-y-auto">
      <ul className="space-y-1">
        {navigationItems.map(item => {
          if (item.isGradient) {
            const isActive = item.id === activeItem;
            return (
              <li key={item.id} className="mb-4">
                <button
                  onClick={() => { if (onNavigate) onNavigate(item.id); if (onClose) onClose(); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {item.emoji && <span className="text-base">{item.emoji}</span>}
                  {item.label}
                </button>
              </li>
            );
          }
          if (item.isCollapsible) {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={item.onToggle}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700/30 transition-colors"
                >
                  {Icon && <Icon className="w-5 h-5 text-white flex-shrink-0" />}
                  <span className="text-sm font-semibold text-white flex-1 text-left">{item.label}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${item.isExpanded ? 'rotate-90' : ''}`} />
                </button>
              </li>
            );
          }
          if (item.isSection) {
            return (
              <div key={item.id} className="px-4 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-3 first:mt-0">
                {item.label}
              </div>
            );
          }
          if (item.customRender) {
            return <li key={item.id}>{item.customRender}</li>;
          }
          if (item.isAction) {
            return (
              <li key={item.id}>
                <button
                  onClick={item.onAction}
                  className="w-full flex items-center gap-2 px-4 py-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors rounded-lg hover:bg-slate-700/30"
                >
                  {item.label}
                </button>
              </li>
            );
          }
          return (
            <li key={item.id}>
              <NavItem
                item={item}
                isActive={item.id === activeItem}
                onNavigate={onNavigate}
                onClose={onClose}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default SidebarNav;
