import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle as fbSignIn,
  signOutUser,
  testFirestoreConnection,
  syncUserProfile,
} from '../lib/firebase';
import { UserRole } from '../types/agri';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: 'extension_worker',
  setUserRole: () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('extension_worker');

  useEffect(() => {
    // Test Firestore connection once on boot (CRITICAL CONSTRAINT)
    testFirestoreConnection();

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      if (currentUser) {
        // Sync profile to Firestore
        await syncUserProfile(currentUser, userRole);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const loggedInUser = await fbSignIn(userRole);
      if (loggedInUser) {
        setUser(loggedInUser);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userRole,
        setUserRole,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
