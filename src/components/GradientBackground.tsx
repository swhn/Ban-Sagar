import { motion } from 'motion/react';

export function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/15 blur-[120px]"
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/12 blur-[120px]"
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 80, -40, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-pink-500/8 blur-[120px]"
        animate={{
          x: [0, 40, -80, 0],
          y: [0, -40, 60, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
