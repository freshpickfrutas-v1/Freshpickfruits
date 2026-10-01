import React, { useEffect, useRef, useState } from 'react';
import { LogIn, LogOut, UserRound, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/** Header account button: "Ingresar" when signed out, a small menu (account, team panel, sign out) when signed in. */
export const AccountMenu: React.FC = () => {
  const { user, isStaff, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (loading) return <div className="hidden sm:block w-10 h-10" aria-hidden />;

  if (!user) {
    return (
      <a
        href="/panel"
        id="header-login-btn"
        title="Ingresar o crear cuenta"
        aria-label="Ingresar o crear cuenta"
        className="hidden sm:inline-flex items-center gap-1.5 px-2.5 2xl:px-3.5 py-2.5 rounded-xl border border-[#2F183C] text-[#2F183C] text-xs sm:text-sm font-semibold hover:bg-[#F5ECF9] transition-colors whitespace-nowrap"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden 2xl:inline">Ingresar</span>
      </a>
    );
  }

  const initial = (user.displayName || user.email || '?').trim().charAt(0).toUpperCase();
  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Mi cuenta"
        aria-expanded={open}
        className="w-10 h-10 rounded-full bg-[#2F183C] text-[#DDA83A] font-bold flex items-center justify-center border-2 border-[#DDA83A]/70"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white border border-[#EADBEE] rounded-xl shadow-xl py-2 z-50 text-sm">
          <p className="px-4 pb-2 text-xs text-stone-500 truncate border-b border-[#EADBEE]">{user.email}</p>
          <a href="/panel" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#F5ECF9] text-[#2F183C] font-semibold"><UserRound className="w-4 h-4" /> Mi cuenta y pedidos</a>
          {isStaff && (
            <a href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#F5ECF9] text-[#2F183C] font-semibold"><LayoutDashboard className="w-4 h-4" /> Panel del equipo</a>
          )}
          <button onClick={() => { setOpen(false); signOut(); }} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-[#F5ECF9] text-stone-700 font-semibold"><LogOut className="w-4 h-4" /> Cerrar sesión</button>
        </div>
      )}
    </div>
  );
};

