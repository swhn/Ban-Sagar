import { motion } from 'motion/react';

export function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        className="absolute -top-1/2 -left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.08] blur-[100px]"
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute -top-1/4 -right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/[0.06] blur-[100px]"
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 50, -30, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-pink-500/[0.04] blur-[100px]"
        animate={{
          x: [0, 30, -50, 0],
          y: [0, -30, 40, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
