import { useCallback } from 'react';
import { useAppDispatch } from '../app/hooks';
import {
  addNotification,
  type NotificationType,
} from '../features/notifications/notificationSlice';

interface ShowNotificationOptions {
  message: string;
  type?: NotificationType;
  duration?: number;
}

export const useNotification = () => {
  const dispatch = useAppDispatch();

  const showNotification = useCallback(
    ({ message, type = 'info', duration = 3000 }: ShowNotificationOptions) => {
      dispatch(addNotification({ message, type, duration }));
    },
    [dispatch]
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showNotification({ message, type: 'success', duration });
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showNotification({ message, type: 'error', duration });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showNotification({ message, type: 'warning', duration });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showNotification({ message, type: 'info', duration });
    },
    [showNotification]
  );

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
