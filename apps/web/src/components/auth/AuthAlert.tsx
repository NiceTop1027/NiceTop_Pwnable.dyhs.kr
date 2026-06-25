"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

export function AuthAlert({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className="auth-alert"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <p>{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}