import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../utils/constants.js';

export function useMobileDetect(breakpoint = BREAKPOINTS.lg) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

export default useMobileDetect;
