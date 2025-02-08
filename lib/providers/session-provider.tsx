"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
}

interface SessionContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
    logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing session in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const handleSetUser = (newUser: User | null) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('user');
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        router.push('/');
    };

    return (
        <SessionContext.Provider value={{
            user,
            setUser: handleSetUser,
            isLoading,
            logout: handleLogout
        }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
} 