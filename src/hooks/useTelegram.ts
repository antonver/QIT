import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentUser, setUserLoading, setUserError } from '../store/aeonChatSlice';
import { getCurrentUser } from '../services/aeonMessengerApi';
import { initTelegramWebApp, getTelegramUser as getTelegramUserUtil } from '../utils/telegram';
import type { TelegramWebAppUser } from '../types/telegram';
import type { AeonCurrentUser } from '../types/api';

// Функция для нормализации данных пользователя
const normalizeUser = (user: any): AeonCurrentUser => {
  console.log('🔍 Normalizing user data:', user);
  const normalized = {
    ...user,
    subordinates: Array.isArray(user.subordinates) ? user.subordinates : [],
    managers: Array.isArray(user.managers) ? user.managers : [],
  };
  console.log('✅ Normalized user data:', normalized);
  return normalized;
};

export const useTelegram = () => {
  const dispatch = useDispatch();
  const [telegramUser, setTelegramUser] = useState<TelegramWebAppUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initTelegram = async () => {
      try {
        console.log('🔍 Инициализация Telegram WebApp...');
        
        // Проверяем доступность Telegram WebApp
        const isAvailable = initTelegramWebApp();
        if (!isAvailable) {
          console.warn('❌ Приложение должно быть открыто из Telegram WebApp');
          dispatch(setUserError('Приложение должно быть открыто из Telegram для корректной работы'));
          setIsInitialized(true);
          return;
        }

        // Проверяем, что мы в Telegram WebApp
        if (!window.Telegram?.WebApp) {
          console.warn('❌ Приложение должно быть открыто из Telegram WebApp');
          dispatch(setUserError('Приложение должно быть открыто из Telegram для корректной работы'));
          setIsInitialized(true);
          return;
        }

        // Получаем данные пользователя из Telegram WebApp
        const telegramUserData = getTelegramUserUtil();
        if (!telegramUserData) {
          console.error('❌ Не удалось получить данные пользователя из Telegram WebApp');
          dispatch(setUserError('Не удалось получить данные пользователя из Telegram'));
          setIsInitialized(true);
          return;
        }

        console.log('✅ Получены данные пользователя из Telegram:', telegramUserData);
        setTelegramUser(telegramUserData);

        // Загружаем или создаем пользователя на бэкенде
        dispatch(setUserLoading(true));
        try {
          const currentUser = await getCurrentUser();
          
          // Нормализуем данные пользователя
          const normalizedUser = normalizeUser(currentUser);
          dispatch(setCurrentUser(normalizedUser));
          
          console.log('✅ Пользователь успешно загружен:', normalizedUser);
          dispatch(setUserError(''));
        } catch (error: any) {
          console.error('❌ Ошибка при загрузке пользователя:', error);
          
          // Проверяем, является ли это ошибкой авторизации
          if (error.response?.status === 401 || error.isAuthError) {
            dispatch(setUserError('Приложение должно быть открыто из Telegram для корректной работы'));
          } else if (error.isTimeoutError || error.code === 'ECONNABORTED') {
            dispatch(setUserError('⏱️ Сервер запускается, попробуйте обновить страницу через минуту'));
          } else if (error.isServiceError || error.response?.status === 503) {
            dispatch(setUserError('🔧 Сервер временно недоступен, попробуйте через несколько минут'));
          } else {
            dispatch(setUserError('Ошибка при загрузке данных пользователя'));
          }
        } finally {
          dispatch(setUserLoading(false));
          setIsInitialized(true);
        }
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