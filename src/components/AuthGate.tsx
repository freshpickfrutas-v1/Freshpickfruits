import React, { useState } from 'react';
import { Leaf, Loader2, LogIn, LogOut, ShieldAlert, AlertCircle, Facebook } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../types';
import { useT } from '../lib/i18n';

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
  const t = useT();
  const { user, profile, role, isStaff, loading, signInWithGoogle, signInWithFacebook, signOut } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <Card>
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-[#7B4382]" />
        <p className="text-sm text-stone-500 mt-3">{t('Verificando tu sesión…', 'Checking your session…')}</p>
      </Card>
    );
  }

  if (!user) {
    const handle = async (method: () => Promise<void>) => {
      setBusy(true);
      setError('');
      try {
        await method();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('No se pudo iniciar sesión.', 'We could not sign you in.'));
      } finally {
        setBusy(false);
      }
    };
    return (
      <Card>
        <h1 className="text-xl font-black text-[#2F183C] font-display">{title}</h1>
        <p className="text-sm text-stone-600 mt-1 mb-5">
          {staffOnly ? t('Acceso exclusivo para el equipo de Fresh Pick.', 'Access is limited to the Fresh Pick team.') : t('Entra para ver el estado de tus pedidos y tus datos de entrega.', 'Sign in to see the status of your orders and your delivery details.')}
        </p>
        <div className="space-y-2.5">
          <button
            onClick={() => handle(signInWithGoogle)}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2F183C] text-white text-sm font-bold disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4 text-[#DDA83A]" />}
            {t('Continuar con Google', 'Continue with Google')}
          </button>
          <button
            onClick={() => handle(signInWithFacebook)}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1877F2] text-white text-sm font-bold disabled:opacity-60"
          >
            <Facebook className="w-4 h-4 fill-white" />
            {t('Continuar con Facebook', 'Continue with Facebook')}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl px-3 py-2 flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}
        <a href="/" className="block mt-5 text-xs text-stone-500 hover:text-[#7B4382]">{t('← Volver a la tienda', '← Back to the store')}</a>
      </Card>
    );
  }

  // Signed in, but the profile (and its role) is still being read.
  if (!profile) {
    return (
      <Card>
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-[#7B4382]" />
        <p className="text-sm text-stone-500 mt-3">{t('Cargando tu perfil…', 'Loading your profile…')}</p>
      </Card>
    );
  }

  if (staffOnly && !isStaff) {
    return (
      <Card>
        <ShieldAlert className="w-7 h-7 mx-auto text-amber-600 mb-2" />
        <h1 className="text-lg font-black text-[#2F183C] font-display">{t('Sin acceso', 'No access')}</h1>
        <p className="text-sm text-stone-600 mt-1">
          {t(`${user.email} no tiene un rol del equipo${role ? ` (tu rol es: ${ROLE_LABELS[role]})` : ''}. Pide al administrador que te asigne uno.`, `${user.email} does not have a team role${role ? ` (your role is: ${ROLE_LABELS[role]})` : ''}. Ask the administrator to assign you one.`)}
        </p>
        <button onClick={() => signOut()} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7B4382]">
          <LogOut className="w-4 h-4" /> {t('Cerrar sesión', 'Sign out')}
        </button>
        <a href="/" className="block mt-3 text-xs text-stone-500 hover:text-[#7B4382]">{t('← Volver a la tienda', '← Back to the store')}</a>
      </Card>
    );
  }

  return <>{children}</>;
};
