import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useToastCtx } from "../context/ToastContext";

const STYLES = {
  success: { bg: "bg-[#1F3D2B]", text: "text-[#F5F1E8]", border: "border-[#D98F00]", Icon: CheckCircle2 },
  error:   { bg: "bg-[#B8431A]", text: "text-[#F5F1E8]", border: "border-[#1F3D2B]", Icon: AlertTriangle },
  info:    { bg: "bg-[#D98F00]", text: "text-[#1F3D2B]", border: "border-[#1F3D2B]", Icon: Info },
};

export default function ToastContainer() {
  const ctx = useToastCtx();
  if (!ctx) return null;
  const { toasts, dismiss } = ctx;

  return (
    <div className="fixed top-20 sm:top-auto sm:bottom-4 left-4 sm:left-auto right-4 sm:right-4 z-[9999] flex flex-col sm:flex-col-reverse gap-2 max-w-[340px] mx-auto w-auto pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const s = STYLES[t.type] || STYLES.info;
          const Icon = s.Icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`pointer-events-auto flex items-center gap-3 border-[3px] ${s.border} ${s.bg} ${s.text} px-4 py-3 shadow-[4px_4px_0_0_#1F3D2B]`}
            >
              <Icon size={18} strokeWidth={3} className="flex-shrink-0" />
              <span className="flex-1 text-xs font-black uppercase tracking-[0.12em] leading-tight">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
