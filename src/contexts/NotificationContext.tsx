import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSolicitacoesData } from '@/hooks/useSolicitacoesData';
import { Solicitacao } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface NotificationContextType {
  solicitacoesCount: number;
  clearSolicitacoesNotifications: () => void;
  requestPermission: () => void;
  permissionStatus: NotificationPermission;
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
const audio = new Audio('/notification.mp3');

// Custom hook to get the previous value of a prop/state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { solicitacoes } = useSolicitacoesData();
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  const [lastSeenPendingCount, setLastSeenPendingCount] = useState<number>(() => {
    return parseInt(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '0', 10);
  });

  const previousSolicitacoes = usePrevious(solicitacoes);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error("Este navegador não suporta notificações.");
      return;
    }
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    if (permission === 'granted') {
      toast.success("Notificações ativadas!");
    } else if (permission === 'denied') {
      toast.warning("Notificações bloqueadas. Altere nas configurações do seu navegador.");
    }
  }, []);

  const playSoundAndShowNotification = useCallback((title: string, options?: NotificationOptions) => {
    // Play sound
    if (isAudioUnlocked) {
      audio.play().catch(error => console.error("Error playing sound:", error));
    }
    
    // Show notification
    if (permissionStatus === 'granted') {
      new Notification(title, {
        body: options?.body,
        icon: '/logo.png', // Assuming you have a logo in public folder
        ...options,
      });
    }
  }, [isAudioUnlocked, permissionStatus]);


  // Effect for notification triggers
  useEffect(() => {
    if (!previousSolicitacoes || !user) return;

    // 1. Admin: New pending solicitation
    if (user.role === 'admin') {
      const newPending = solicitacoes.filter(
        s => s.status === 'pendente' && !previousSolicitacoes.find(ps => ps.id === s.id)
      );
      if (newPending.length > 0) {
        playSoundAndShowNotification('Nova Solicitação Pendente!', {
          body: `${newPending[0].clienteNome} enviou uma nova solicitação.`
        });
      }
    }

    // 2. Driver: New assignment
    if (user.role === 'entregador') {
      solicitacoes.forEach(currentSolicitacao => {
        const prevSolicitacao = previousSolicitacoes.find(ps => ps.id === currentSolicitacao.id);
        if (
          prevSolicitacao &&
          currentSolicitacao.entregadorId === user.id &&
          prevSolicitacao.entregadorId !== user.id
        ) {
          playSoundAndShowNotification('Nova Entrega Atribuída!', {
            body: `A solicitação #${currentSolicitacao.codigo} foi atribuída a você.`
          });
        }
      });
    }

  }, [solicitacoes, previousSolicitacoes, user, playSoundAndShowNotification]);


  // Audio unlock logic
  useEffect(() => {
    const unlockAudio = () => {
      audio.play().catch(() => {});
      audio.pause();
      audio.currentTime = 0;
      setIsAudioUnlocked(true);
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


  // Badge count logic
  const totalPending = useMemo(() => {
    return solicitacoes.filter(s => s.status === 'pendente').length;
  }, [solicitacoes]);

  const clearSolicitacoesNotifications = useCallback(() => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, String(totalPending));
    setLastSeenPendingCount(totalPending);
  }, [totalPending]);

  const solicitacoesCount = Math.max(0, totalPending - lastSeenPendingCount);

  const value = {
    solicitacoesCount,
    clearSolicitacoesNotifications,
    requestPermission,
    permissionStatus,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
