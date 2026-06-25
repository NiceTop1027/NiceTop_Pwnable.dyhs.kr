"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function AdminAlert({
  message,
  variant = "info",
}: {
  message: string;
  variant?: "info" | "success" | "error";
}) {
  if (!message) return null;

  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className={`admin-alert admin-alert-${variant}`}
        role="status"
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <p>{message}</p>
      </motion.div>
    </AnimatePresence>
  );
}