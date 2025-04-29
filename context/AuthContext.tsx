import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface EnrichedUser extends User {
  displayName: string | null;
  role: string | null;
  email: string | null;
  [key: string]: any;
}

interface AuthContextType {
  user: EnrichedUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<EnrichedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Update user info in Firestore on login
        const userRef = doc(db, 'users', firebaseUser.uid);
        // Optionally update Firestore with latest email/displayName
        await setDoc(userRef, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
        }, { merge: true });
        // Fetch Firestore user data
        const userSnap = await getDoc(userRef);
        const firestoreData = userSnap.exists() ? userSnap.data() : {};
        setUser({
          ...firebaseUser,
          ...firestoreData,
          displayName: firestoreData.displayName ?? firebaseUser.displayName ?? null,
          email: firestoreData.email ?? firebaseUser.email ?? null,
          role: firestoreData.role ?? null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
