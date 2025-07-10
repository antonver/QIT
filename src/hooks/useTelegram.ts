import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentUser, setUserLoading, setUserError } from '../store/aeonChatSlice';
import { getCurrentUser } from '../services/aeonMessengerApi';
import type { TelegramWebAppUser } from '../types/telegram';
import type { AeonCurrentUser } from '../types/api';

export const useTelegram = () => {
  const dispatch = useDispatch();
  const [telegramUser, setTelegramUser] = useState<TelegramWebAppUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initTelegram = async () => {
      try {
        console.log('🔍 Инициализация Telegram WebApp...');
        
        // Проверяем, что мы в Telegram WebApp
        if (window.Telegram?.WebApp) {
          const webApp = window.Telegram.WebApp;
          
          // Инициализируем Telegram WebApp
          webApp.ready();
          webApp.expand();
          
          console.log('✅ Telegram WebApp инициализирован');
          
          // Получаем данные пользователя
          const user = webApp.initDataUnsafe.user;
          if (user) {
            console.log('✅ Получены данные пользователя из Telegram:', user);
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
              console.log('✅ Пользователь успешно загружен:', normalizedUser);
            } catch (error) {
              console.error('❌ Ошибка при загрузке пользователя:', error);
              dispatch(setUserError('Ошибка при загрузке данных пользователя'));
            } finally {
              dispatch(setUserLoading(false));
            }
          } else {
            console.warn('❌ Данные пользователя не найдены в Telegram WebApp');
            dispatch(setUserError('Не удалось получить данные пользователя из Telegram'));
          }
        } else {
          console.warn('❌ Приложение не запущено в Telegram WebApp');
          dispatch(setUserError('Приложение должно быть открыто из Telegram для корректной работы'));
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Ошибка при инициализации Telegram:', error);
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
    const isTelegram = !!window.Telegram?.WebApp;
    if (isTelegram) {
      console.log('✅ Приложение запущено в Telegram WebApp');
    } else {
      console.warn('❌ Приложение не запущено в Telegram WebApp');
    }
    return isTelegram;
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