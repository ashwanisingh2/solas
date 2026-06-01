"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function MotionShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}
