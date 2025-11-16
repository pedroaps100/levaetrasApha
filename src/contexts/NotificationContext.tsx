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
const audio = new Audio('/notification.mp3'); // Create a single audio instance

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { solicitacoes } = useSolicitacoesData();
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  
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

  // Effect to unlock audio on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      // This is a common pattern to unlock audio playback in browsers.
      // We attempt to play and immediately pause. This "unlocks" the audio context.
      audio.play().catch(() => {});
      audio.pause();
      audio.currentTime = 0;
      
      setIsAudioUnlocked(true);
      // Clean up listeners once audio is unlocked.
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    if (!isAudioUnlocked) {
      window.addEventListener('click', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
    }

    return () => {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };
  }, [isAudioUnlocked]);

  // Effect to play sound only when the number of pending solicitations increases
  useEffect(() => {
    if (isAudioUnlocked && totalPending > previousTotalPending) {
      audio.play().catch(error => console.error("Error playing notification sound:", error));
    }
    // Update the previous total for the next comparison
    setPreviousTotalPending(totalPending);
  }, [totalPending, previousTotalPending, isAudioUnlocked]);

  // Initialize the previous count on mount to avoid sound on first load
  useEffect(() => {
    setPreviousTotalPending(totalPending);
  }, [totalPending]);


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
