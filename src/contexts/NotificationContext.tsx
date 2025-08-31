import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useSolicitacoesData } from '@/hooks/useSolicitacoesData';

interface NotificationContextType {
  solicitacoesCount: number;
  clearSolicitacoesNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

const NOTIFICATION_STORAGE_KEY = 'app_seen_notifications_count';

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { solicitacoes } = useSolicitacoesData();
  
  // State to track the total number of pending solicitations when the user last checked
  const [lastSeenPendingCount, setLastSeenPendingCount] = useState<number>(() => {
    return parseInt(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '0', 10);
  });

  // State to track the previous total to detect an increase (for the sound)
  const [previousTotalPending, setPreviousTotalPending] = useState<number>(0);

  // Memoize the current total number of pending solicitations
  const totalPending = useMemo(() => {
    return solicitacoes.filter(s => s.status === 'pendente').length;
  }, [solicitacoes]);

  // Effect to play sound only when the number of pending solicitations increases
  useEffect(() => {
    if (totalPending > previousTotalPending) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(error => console.error("Error playing notification sound:", error));
    }
    // Update the previous total for the next comparison
    setPreviousTotalPending(totalPending);
  }, [totalPending, previousTotalPending]);

  // Initialize the previous count on mount to avoid sound on first load
  useEffect(() => {
    setPreviousTotalPending(totalPending);
  }, []);


  // Function to clear notifications by updating the "seen" count
  const clearSolicitacoesNotifications = useCallback(() => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, String(totalPending));
    setLastSeenPendingCount(totalPending);
  }, [totalPending]);

  // The badge count is the difference between the current total and the last seen total
  const solicitacoesCount = Math.max(0, totalPending - lastSeenPendingCount);

  const value = {
    solicitacoesCount,
    clearSolicitacoesNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
