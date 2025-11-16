import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Cliente, Entregador } from '@/types';
import { useClientsData } from '@/hooks/useClientsData';
import { useEntregadoresData } from '@/hooks/useEntregadoresData';
import { useSettingsData } from '@/hooks/useSettingsData';

interface AuthContextType {
  user: User | null;
  clientData: Cliente | null;
  entregadorData: Entregador | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [clientData, setClientData] = useState<Cliente | null>(null);
  const [entregadorData, setEntregadorData] = useState<Entregador | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { clients } = useClientsData();
  const { entregadores } = useEntregadoresData();
  const { users: systemUsers } = useSettingsData();

  useEffect(() => {
    const loggedInUserJson = localStorage.getItem('app_auth_user');
    if (loggedInUserJson) {
        const loggedInUser: User = JSON.parse(loggedInUserJson);
        setUser(loggedInUser);
        if (loggedInUser.role === 'cliente') {
            const currentClientData = clients.find(c => c.email === loggedInUser.email);
            setClientData(currentClientData || null);
        } else if (loggedInUser.role === 'entregador') {
            const currentDriverData = entregadores.find(e => e.email === loggedInUser.email);
            setEntregadorData(currentDriverData || null);
        }
    }
    setLoading(false);
  }, [clients, entregadores]);

  const login = async (email: string, password: string): Promise<User> => {
    const userAccount = systemUsers.find(u => u.email === email);
    
    if (!userAccount || userAccount.password !== password) {
      throw new Error("Credenciais inválidas");
    }
    
    setUser(userAccount);
    localStorage.setItem('app_auth_user', JSON.stringify(userAccount));
    
    if (userAccount.role === 'cliente') {
      const currentClientData = clients.find(c => c.email === userAccount.email);
      if (!currentClientData) throw new Error("Perfil de cliente não encontrado.");
      setClientData(currentClientData);
      setEntregadorData(null);
    } else if (userAccount.role === 'entregador') {
      const currentDriverData = entregadores.find(e => e.email === userAccount.email);
      if (!currentDriverData) throw new Error("Perfil de entregador não encontrado.");
      setEntregadorData(currentDriverData);
      setClientData(null);
    } else {
      setClientData(null);
      setEntregadorData(null);
    }

    return userAccount;
  };

  const logout = () => {
    setUser(null);
    setClientData(null);
    setEntregadorData(null);
    localStorage.removeItem('app_auth_user');
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const updatedUser = { ...currentUser, ...updatedData };
      localStorage.setItem('app_auth_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const value = {
    user,
    clientData,
    entregadorData,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
