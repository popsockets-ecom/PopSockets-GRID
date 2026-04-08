import React from 'react';

export function NavItem({ item, isActive = false, onNavigate, onClose }) {
  const { id, label, icon: Icon, emoji, iconColor, suffix } = item;

  const baseStyles = `
    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors
    ${isActive ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
  `;

  const iconClass = isActive ? 'w-5 h-5' : `w-5 h-5 ${iconColor || ''}`;

  const renderIcon = () => {
    if (emoji) return <span className="w-5 h-5 flex items-center justify-center text-base">{emoji}</span>;
    if (Icon) return <Icon className={iconClass} />;
    return null;
  };

  const handleClick = () => {
    if (onNavigate) onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <button onClick={handleClick} className={baseStyles}>
      {renderIcon()}
      <span className="flex-1">{label}</span>
      {suffix && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-slate-700/50 text-slate-500'}`}>{suffix}</span>}
    </button>
  );
}

export default NavItem;
