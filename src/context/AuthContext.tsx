import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as fbSignOut, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { STAFF_ROLES, UserProfile, UserRole } from '../types';

/** Same address as the bootstrap admin in firestore.rules: it can always sign in as admin and assign other roles. */
const BOOTSTRAP_ADMIN_EMAIL = 'info@freshpickfruits.com';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isStaff: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

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
          const isBootstrap = current.email === BOOTSTRAP_ADMIN_EMAIL && current.emailVerified;
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
          setProfile(snap.exists() ? ({ ...(snap.data() as UserProfile), uid: current.uid }) : null);
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

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string }).code;
      // Some phone browsers block popups: fall back to a full-page redirect.
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      throw err;
    }
  };

  const role = profile?.role ?? null;
  const value: AuthState = {
    user,
    profile,
    role,
    isStaff: role !== null && (STAFF_ROLES as UserRole[]).includes(role),
    loading,
    signInWithGoogle,
    signOut: () => fbSignOut(auth)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
