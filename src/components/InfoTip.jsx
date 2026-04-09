import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

export function InfoTip({ text, label }) {
  const iconRef = useRef(null);
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

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
        <Info className="w-3 h-3 text-slate-500 cursor-help hover:text-purple-400 transition-colors" />
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
            <div style={{ height: 3, background: 'linear-gradient(90deg, #9333ea, #7e22ce)' }} />
            <div className="px-4 py-3">
              {label && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">{label}</span>
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
