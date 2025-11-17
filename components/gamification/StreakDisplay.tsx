'use client';

import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface StreakDisplayProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function StreakDisplay({ streak, size = 'md', animated = true }: StreakDisplayProps) {
  const sizes = {
    sm: { icon: 'w-4 h-4', text: 'text-sm' },
    md: { icon: 'w-5 h-5', text: 'text-base' },
    lg: { icon: 'w-6 h-6', text: 'text-lg' },
  };

  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        animate={animated && streak > 0 ? {
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        <Flame
          className={`${sizes[size].icon} ${
            streak > 0 ? 'text-orange-500 fill-orange-500 flame-pulse' : 'text-gray-300'
          }`}
        />
      </motion.div>
      <span className={`${sizes[size].text} font-bold ${streak > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
        {streak} day{streak !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
