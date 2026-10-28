import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          dir="ltr"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
        >
          <motion.div
            className={`modal modal-${size}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 28, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <div className="modal-head">
              <h3>{title}</h3>
              <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-foot">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
