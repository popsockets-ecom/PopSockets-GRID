import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn.js';

export function Spinner({ size = 'md', color = 'purple', className = '' }) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  const colorClasses = { purple: 'text-purple-500', white: 'text-white', slate: 'text-slate-400' };

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], colorClasses[color], className)} />
  );
}

export default Spinner;
