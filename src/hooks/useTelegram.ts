import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentUser, setUserLoading, setUserError } from '../store/aeonChatSlice';
import { getCurrentUser } from '../services/api';
import type { TelegramWebAppUser } from '../types/telegram';
import type { AeonCurrentUser } from '../types/api';

export const useTelegram = () => {
  const dispatch = useDispatch();
  const [telegramUser, setTelegramUser] = useState<TelegramWebAppUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Проверяем, что мы в Telegram WebApp
        if (window.Telegram?.WebApp) {
          const webApp = window.Telegram.WebApp;
          
          // Инициализируем Telegram WebApp
          webApp.ready();
          webApp.expand();
          
          // Получаем данные пользователя
          const user = webApp.initDataUnsafe.user;
          if (user) {
            setTelegramUser(user);
            
            // Загружаем или создаем пользователя на бэкенде
            dispatch(setUserLoading(true));
            try {
              const currentUser = await getCurrentUser();
              // Нормализуем данные пользователя
              const normalizedUser: AeonCurrentUser = {
                ...currentUser,
                subordinates: Array.isArray(currentUser.subordinates) ? currentUser.subordinates : [],
                managers: Array.isArray(currentUser.managers) ? currentUser.managers : [],
              };
              dispatch(setCurrentUser(normalizedUser));
            } catch (error) {
              console.error('Ошибка при загрузке пользователя:', error);
              dispatch(setUserError('Ошибка при загрузке данных пользователя'));
            } finally {
              dispatch(setUserLoading(false));
            }
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Ошибка при инициализации Telegram:', error);
        dispatch(setUserError('Ошибка при инициализации Telegram'));
        setIsInitialized(true);
      }
    };

    initTelegram();
  }, [dispatch]);

  const getTelegramUser = (): TelegramWebAppUser | null => {
    return telegramUser;
  };

  const isTelegramWebApp = (): boolean => {
    return !!window.Telegram?.WebApp;
  };

  const getInitData = (): string => {
    return window.Telegram?.WebApp?.initData || '';
  };

  return {
    telegramUser,
    isInitialized,
    getTelegramUser,
    isTelegramWebApp,
    getInitData,
  };
}; 