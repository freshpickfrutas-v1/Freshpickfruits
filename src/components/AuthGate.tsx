import React, { useState } from 'react';
import { Leaf, Loader2, LogIn, LogOut, ShieldAlert, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../types';

interface AuthGateProps {
  /** Only team members (any staff role) can see the content. */
  staffOnly?: boolean;
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center px-4 bg-stone-100/92 font-sans">
    <div className="w-full max-w-sm bg-white rounded-2xl border border-[#EADBEE] shadow-lg p-7 text-center">
      <div className="w-12 h-12 mx-auto rounded-xl bg-[#2F183C] text-[#DDA83A] border border-[#7B4382] flex items-center justify-center mb-4">
        <Leaf className="w-6 h-6" />
      </div>
      {children}
    </div>
  </div>
);

/** Shows the Google sign-in when there is no session, and blocks users without a team role. */
export const AuthGate: React.FC<AuthGateProps> = ({ staffOnly = false, title, children }) => {
  const { user, profile, role, isStaff, loading, signInWithGoogle, signOut } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <Card>
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-[#7B4382]" />
        <p className="text-sm text-stone-500 mt-3">Verificando tu sesión…</p>
      </Card>
    );
  }

  if (!user) {
    const handle = async () => {
      setBusy(true);
      setError('');
      try {
        await signInWithGoogle();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
      } finally {
        setBusy(false);
      }
    };
    return (
      <Card>
        <h1 className="text-xl font-black text-[#2F183C] font-display">{title}</h1>
        <p className="text-sm text-stone-600 mt-1 mb-5">
          {staffOnly ? 'Acceso exclusivo para el equipo de Fresh Pick.' : 'Entra para ver el estado de tus pedidos y tus datos de entrega.'}
        </p>
        <button
          onClick={handle}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2F183C] text-white text-sm font-bold disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4 text-[#DDA83A]" />}
          Continuar con Google
        </button>
        {error && (
          <p className="mt-4 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl px-3 py-2 flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}
        <a href="/" className="block mt-5 text-xs text-stone-500 hover:text-[#7B4382]">← Volver a la tienda</a>
      </Card>
    );
  }

  // Signed in, but the profile (and its role) is still being read.
  if (!profile) {
    return (
      <Card>
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-[#7B4382]" />
        <p className="text-sm text-stone-500 mt-3">Cargando tu perfil…</p>
      </Card>
    );
  }

  if (staffOnly && !isStaff) {
    return (
      <Card>
        <ShieldAlert className="w-7 h-7 mx-auto text-amber-600 mb-2" />
        <h1 className="text-lg font-black text-[#2F183C] font-display">Sin acceso</h1>
        <p className="text-sm text-stone-600 mt-1">
          {user.email} no tiene un rol del equipo{role ? ` (tu rol es: ${ROLE_LABELS[role]})` : ''}. Pide al administrador que te asigne uno.
        </p>
        <button onClick={() => signOut()} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7B4382]">
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
        <a href="/" className="block mt-3 text-xs text-stone-500 hover:text-[#7B4382]">← Volver a la tienda</a>
      </Card>
    );
  }

  return <>{children}</>;
};
