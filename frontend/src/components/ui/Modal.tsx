import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-lg rounded-xl border border-line bg-canvas-raised p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-ink">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-canvas-overlay hover:text-ink transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  );
}