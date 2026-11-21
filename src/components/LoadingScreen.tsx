import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function LoadingScreen({ onComplete }: { onComplete: () => void; key?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 260);
          return 100;
        }
        return Math.min(100, prev + Math.floor(Math.random() * 18) + 12);
      });
    }, 90);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-zinc-950"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col items-center w-64">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 text-4xl font-bold tracking-tight text-zinc-950 font-display"
        >
          PROHOR<span className="text-blue-600">.</span>
        </motion.div>

        <div className="w-full h-[2px] overflow-hidden rounded-full bg-zinc-200">
          <motion.div
            className="h-full w-full origin-left bg-zinc-950"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <motion.div
          className="mt-3 flex items-center justify-between w-full text-xs font-mono tabular-nums text-zinc-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <span>Shakibul Islam Prohor</span>
          <span>{progress}%</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
