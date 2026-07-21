import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function LoadingScreen({ onComplete }: { onComplete: () => void; key?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030014]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-5xl font-bold tracking-tighter text-white font-display"
        >
          PROHOR<span className="text-purple-500">.</span>
        </motion.div>
        
        <div className="w-64 h-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        
        <motion.div 
          className="mt-4 text-sm font-medium text-white/50 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {progress}%
        </motion.div>
      </div>
    </motion.div>
  );
}
