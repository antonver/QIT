// Utility functions for Telegram WebApp
export const initTelegramWebApp = (): boolean => {
  console.log('Инициализация Telegram WebApp...');
  
  // Проверяем доступность Telegram WebApp
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    try {
      const webApp = window.Telegram.WebApp;
      
      // Инициализируем WebApp
      webApp.ready();
      
      // Настраиваем внешний вид
      webApp.expand();
      webApp.setHeaderColor('#232b3b');
      webApp.setBackgroundColor('#232b3b');
      
      // Включаем подтверждение закрытия
      webApp.enableClosingConfirmation();
      
      console.log('Telegram WebApp успешно инициализирован');
      console.log('WebApp version:', webApp.version);
      console.log('WebApp platform:', webApp.platform);
      console.log('WebApp theme:', webApp.colorScheme);
      
      return true;
    } catch (error) {
      console.error('Ошибка инициализации Telegram WebApp:', error);
      return false;
    }
  }
  
  console.log('Telegram WebApp не найден');
  return false;
};

export const getTelegramUser = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  return null;
};

export const getTelegramInitData = (): string => {
  console.log('Получение данных авторизации Telegram...');
  
  // Проверяем, есть ли реальный Telegram WebApp
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    console.log('Telegram WebApp найден');
    
    const initData = window.Telegram.WebApp.initData;
    console.log('Telegram initData:', initData ? 'найден' : 'отсутствует');
    
    if (initData) {
      return initData;
    }
    
    // Если initData отсутствует, попробуем использовать initDataUnsafe
    const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
    console.log('Telegram initDataUnsafe:', initDataUnsafe);
    
    if (initDataUnsafe?.user) {
      // Создаем базовые данные авторизации
      const mockInitData = `user=${encodeURIComponent(JSON.stringify(initDataUnsafe.user))}&auth_date=${Math.floor(Date.now() / 1000)}&hash=test`;
      console.log('Создаем данные авторизации из initDataUnsafe');
      return mockInitData;
    }
  }
  
  // Проверяем, есть ли тестовые данные в localStorage (для разработки)
  if (typeof window !== 'undefined') {
    const savedInitData = localStorage.getItem('telegram_init_data');
    if (savedInitData) {
      console.log('Найдены сохраненные данные авторизации');
      return savedInitData;
    }
    
    // Создаем тестовые данные для разработки
    const testInitData = `user=${encodeURIComponent(JSON.stringify({
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      language_code: 'ru'
    }))}&auth_date=${Math.floor(Date.now() / 1000)}&hash=test`;
    
    localStorage.setItem('telegram_init_data', testInitData);
    console.log('Созданы тестовые данные авторизации для разработки');
    return testInitData;
  }
  
  // Авторизационных данных нет
  console.warn('Данные авторизации не найдены');
  return '';
};

export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp);
};

export const showTelegramAlert = (message: string, callback?: () => void) => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.showAlert(message, callback);
  } else {
    alert(message);
    callback?.();
  }
};

export const showTelegramConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.showConfirm(message, callback);
  } else {
    const confirmed = confirm(message);
    callback?.(confirmed);
  }
};

export const closeTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.close();
  }
}; 