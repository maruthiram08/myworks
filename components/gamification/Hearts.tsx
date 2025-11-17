'use client';

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeartsProps {
  current: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function Hearts({ current, max = 5, size = 'md' }: HeartsProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, index) => {
        const isFilled = index < current;
        return (
          <motion.div
            key={index}
            initial={{ scale: 1 }}
            animate={isFilled ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`${sizes[size]} ${
                isFilled ? 'fill-red-500 text-red-500' : 'text-gray-300'
              } transition-colors`}
            />
          </motion.div>
        );
      })}
      <span className="ml-1 text-sm font-semibold text-gray-700">{current}</span>
    </div>
  );
}
