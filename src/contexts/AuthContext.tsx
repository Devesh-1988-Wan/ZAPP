import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Define a more detailed user profile context
interface UserProfile extends User {
  roles: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  // Other methods remain the same...
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndRoles = async (sessionUser: User | null): Promise<UserProfile | null> => {
      if (!sessionUser) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', sessionUser.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        return { ...sessionUser, roles: [] };
      }

      return { ...sessionUser, roles: data.map(r => r.role) || [] };
    };

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const profile = await fetchUserAndRoles(session?.user ?? null);
        setUser(profile);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = await fetchUserAndRoles(session?.user ?? null);
      setUser(profile);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    loading,
    // ... other functions (signIn, signOut, etc.)
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};