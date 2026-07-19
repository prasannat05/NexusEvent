import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { registerUser, getMe } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                try {
                    const res = await getMe();
                    setUserProfile(res.data);
                } catch {
                    // User not yet registered in MongoDB, register them
                    try {
                        const regRes = await registerUser({ displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0] });
                        setUserProfile(regRes.data.user);
                    } catch {
                        setUserProfile(null);
                    }
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signup = async (email, password, displayName) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });
        // Register in MongoDB as student
        const res = await registerUser({ displayName });
        setUserProfile(res.data.user);
        return cred;
    };

    const login = async (email, password) => {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        try {
            const res = await getMe();
            setUserProfile(res.data);
        } catch {
            // Auto-register if not in DB yet
            try {
                const regRes = await registerUser({ displayName: cred.user.displayName || email.split('@')[0] });
                setUserProfile(regRes.data.user);
            } catch {
                setUserProfile(null);
            }
        }
        return cred;
    };

    const logout = async () => {
        await signOut(auth);
        setUserProfile(null);
    };

    const refreshProfile = async () => {
        try {
            const res = await getMe();
            setUserProfile(res.data);
        } catch {
            // ignore
        }
    };

    const value = {
        user,
        userProfile,
        loading,
        signup,
        login,
        logout,
        refreshProfile,
        role: userProfile?.role || 'student'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
