import React, { useEffect, useRef } from 'react';

interface ModalDialogProps {
  /** Nombre accesible del diálogo (lo lee el lector de pantalla). */
  label: string;
  onClose: () => void;
  /** Clases de disposición del panel dentro de la pantalla (p. ej. "justify-end" o "items-center justify-center p-4"). */
  className?: string;
  children: React.ReactNode;
}

/**
 * Diálogo modal con el elemento nativo <dialog> (showModal): la página de fondo queda inerte, el foco se queda
 * dentro, Esc cierra y el foco vuelve al botón que lo abrió. Un clic fuera del panel también lo cierra.
 * El componente se monta solo mientras está abierto.
 */
export const ModalDialog: React.FC<ModalDialogProps> = ({ label, onClose, className = '', children }) => {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // Un evento "close" tardío de una apertura anterior (React StrictMode monta dos veces en desarrollo) se ignora.
    const handleClose = () => { if (!dialog.open) closeRef.current(); };
    dialog.addEventListener('close', handleClose);
    if (!dialog.open) dialog.showModal();
    return () => {
      dialog.removeEventListener('close', handleClose);
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      // Un clic sobre el propio <dialog> (fuera del panel) es un "light dismiss".
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className={`fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 open:flex ${className}`}
    >
      {children}
    </dialog>
  );
};
