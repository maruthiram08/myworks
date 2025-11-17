'use client';

import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '@/lib/utils';

interface XPDisplayProps {
  xp: number;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function XPDisplay({ xp, animate = false, size = 'md' }: XPDisplayProps) {
  const sizes = {
    sm: { icon: 'w-4 h-4', text: 'text-sm' },
    md: { icon: 'w-5 h-5', text: 'text-base' },
    lg: { icon: 'w-6 h-6', text: 'text-lg' },
  };

  return (
    <motion.div
      className="flex items-center gap-1.5"
      initial={animate ? { scale: 0 } : {}}
      animate={animate ? { scale: [0, 1.2, 1] } : {}}
      transition={{ duration: 0.4 }}
    >
      <Star className={`${sizes[size].icon} fill-accent-400 text-accent-400`} />
      <span className={`${sizes[size].text} font-bold text-accent-600`}>
        {formatNumber(xp)} XP
      </span>
    </motion.div>
  );
}

interface XPGainProps {
  amount: number;
  show: boolean;
}

export function XPGain({ amount, show }: XPGainProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -50, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-accent-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
            <Star className="w-5 h-5 fill-white" />
            +{amount} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
