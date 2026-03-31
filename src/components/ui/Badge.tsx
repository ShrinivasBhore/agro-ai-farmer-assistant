import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface BadgeProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
}

export const Badge = ({ className = '', variant = 'default', children, ...props }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variants = {
    default: 'bg-primary/10 text-primary border-transparent',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-transparent',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-transparent',
    outline: 'text-foreground border border-border',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
