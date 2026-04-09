import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

const COLOR_MAP = {
  purple: { gradient: 'linear-gradient(90deg, #9333ea, #7e22ce)', text: 'text-purple-400', hover: 'hover:text-purple-400' },
  green:  { gradient: 'linear-gradient(90deg, #22c55e, #16a34a)', text: 'text-green-400',  hover: 'hover:text-green-400' },
  cyan:   { gradient: 'linear-gradient(90deg, #06b6d4, #0891b2)', text: 'text-cyan-400',   hover: 'hover:text-cyan-400' },
  orange: { gradient: 'linear-gradient(90deg, #f97316, #ea580c)', text: 'text-orange-400', hover: 'hover:text-orange-400' },
  amber:  { gradient: 'linear-gradient(90deg, #f59e0b, #d97706)', text: 'text-amber-400',  hover: 'hover:text-amber-400' },
};

export function InfoTip({ text, label, color = 'purple', light = false }) {
  const iconRef = useRef(null);
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const scheme = COLOR_MAP[color] || COLOR_MAP.purple;

  const handleEnter = useCallback(() => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const left = Math.max(12, Math.min(rect.left + rect.width / 2 - 150, window.innerWidth - 312));
      setPos({ top: rect.bottom + 10, left });
    }
    setShow(true);
  }, []);

  return (
    <>
      <span
        ref={iconRef}
        className="inline-flex ml-1 align-middle"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
      >
        <Info className={`w-3 h-3 cursor-help transition-colors ${light ? 'text-purple-200/60 hover:text-white' : `text-slate-500 ${scheme.hover}`}`} />
      </span>
      {show && createPortal(
        <div
          className="pointer-events-none"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 99999,
            width: 300,
          }}
        >
          <div
            className="rounded-xl border border-slate-700 shadow-2xl overflow-hidden"
            style={{ backgroundColor: '#0f172a' }}
          >
            <div style={{ height: 3, background: scheme.gradient }} />
            <div className="px-4 py-3">
              {label && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Info className={`w-3.5 h-3.5 ${scheme.text}`} />
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${scheme.text}`}>{label}</span>
                </div>
              )}
              <p className="text-sm text-slate-200 leading-relaxed whitespace-normal font-normal m-0">
                {text}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default InfoTip;
