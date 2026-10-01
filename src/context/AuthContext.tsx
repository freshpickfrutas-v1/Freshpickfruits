import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as fbSignOut, User, AuthProvider as FirebaseProvider } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, appleProvider, facebookProvider } from '../lib/firebase';
import { STAFF_ROLES, UserProfile, UserRole } from '../types';
import { navigate } from '../lib/router';

/** Same addresses as the bootstrap admins in firestore.rules: they can always sign in as admin and assign other roles. */
const BOOTSTRAP_ADMIN_EMAILS = ['info@freshpickfruits.com', 'freshpickfrutas@gmail.com'];

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isStaff: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

// Set when the person presses a sign-in button, so team members are sent to /admin once their role is known.
const LOGIN_INTENT_KEY = 'fp_login_intent';
const intentIsFresh = () => {
  try { return Date.now() - Number(sessionStorage.getItem(LOGIN_INTENT_KEY) ?? 0) < 2 * 60 * 1000; } catch { return false; }
};
const clearIntent = () => { try { sessionStorage.removeItem(LOGIN_INTENT_KEY); } catch { /* ignore */ } };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, async current => {
      unsubProfile?.();
      unsubProfile = null;
      setUser(current);
      if (!current) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const ref = doc(db, 'users', current.uid);
      try {
        const existing = await getDoc(ref);
        if (!existing.exists()) {
          const isBootstrap = BOOTSTRAP_ADMIN_EMAILS.includes(current.email ?? '') && current.emailVerified;
          await setDoc(ref, {
            email: current.email ?? '',
            displayName: current.displayName ?? '',
            role: isBootstrap ? 'admin' : 'customer',
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('No se pudo preparar el perfil:', err);
      }
      // Live profile: a role change made by the admin shows up without signing in again.
      unsubProfile = onSnapshot(
        ref,
        snap => {
          const data = snap.exists() ? (snap.data() as UserProfile) : null;
          // A bootstrap admin whose profile was created earlier as a customer is promoted (firestore.rules allow it).
          if (data && data.role !== 'admin' && BOOTSTRAP_ADMIN_EMAILS.includes(current.email ?? '') && current.emailVerified) {
            updateDoc(ref, { role: 'admin' }).catch(err => console.warn('No se pudo promover al administrador:', err));
          }
          setProfile(data ? { ...data, uid: current.uid } : null);
          if (data && (STAFF_ROLES as UserRole[]).includes(data.role) && intentIsFresh() && window.location.pathname === '/panel') {
            clearIntent();
            navigate('/admin');
          }
          setLoading(false);
        },
        () => setLoading(false)
      );
    });
    return () => {
      unsubAuth();
      unsubProfile?.();
    };
  }, []);

  const signInWith = async (provider: FirebaseProvider) => {
    try { sessionStorage.setItem(LOGIN_INTENT_KEY, String(Date.now())); } catch { /* ignore */ }
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      const code = (err as { code?: string }).code;
      // Some phone browsers block popups: fall back to a full-page redirect.
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, provider);
        return;
      }
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      if (code === 'auth/account-exists-with-different-credential') {
        throw new Error('Ya existe una cuenta con ese correo creada con otro método (por ejemplo Google). Entra con ese método.');
      }
      const friendly: Record<string, string> = {
        'auth/operation-not-allowed': 'Este método de acceso aún no está activado en Firebase.',
        'auth/unauthorized-domain': 'Este sitio no está autorizado en Firebase para iniciar sesión.',
        'auth/network-request-failed': 'No hay conexión. Revisa tu internet e intenta de nuevo.',
        'auth/web-storage-unsupported': 'Tu navegador bloquea el almacenamiento necesario. Actívalo o prueba otro navegador.',
        'auth/internal-error': 'Firebase no pudo completar el acceso. Si usas Apple o Facebook, revisa su configuración en Firebase.',
        'auth/invalid-credential': 'El proveedor rechazó las credenciales. Revisa la configuración del método en Firebase.',
      };
      throw new Error(code ? `${friendly[code] ?? 'No se pudo iniciar sesión.'} (${code})` : (err instanceof Error ? err.message : 'No se pudo iniciar sesión.'));
    }
  };
  const signInWithGoogle = () => signInWith(googleProvider);
  const signInWithApple = () => signInWith(appleProvider);
  const signInWithFacebook = () => signInWith(facebookProvider);

  const role = profile?.role ?? null;
  const value: AuthState = {
    user,
    profile,
    role,
    isStaff: role !== null && (STAFF_ROLES as UserRole[]).includes(role),
    loading,
    signInWithGoogle,
    signInWithApple,
    signInWithFacebook,
    signOut: () => { clearIntent(); return fbSignOut(auth); }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
