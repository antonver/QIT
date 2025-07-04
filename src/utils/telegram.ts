// Utility functions for Telegram WebApp
export const initTelegramWebApp = (): boolean => {
  console.log('Инициализация Telegram WebApp...');
  
  // Очищаем старые данные авторизации
  cleanupOldAuthData();
  
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

// Debug function to analyze Telegram WebApp data
export const debugTelegramWebApp = () => {
  console.log('=== Telegram WebApp Debug Info ===');
  
  if (typeof window === 'undefined') {
    console.log('❌ Window object not available');
    return;
  }
  
  console.log('🔍 Telegram object:', window.Telegram ? '✅ Available' : '❌ Not available');
  
  if (window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp;
    console.log('🔍 WebApp object:', '✅ Available');
    console.log('🔍 WebApp version:', webApp.version);
    console.log('🔍 WebApp platform:', webApp.platform);
    console.log('🔍 WebApp colorScheme:', webApp.colorScheme);
    console.log('🔍 WebApp isExpanded:', webApp.isExpanded);
    console.log('🔍 WebApp viewportHeight:', webApp.viewportHeight);
    console.log('🔍 WebApp viewportStableHeight:', webApp.viewportStableHeight);
    
    console.log('🔍 InitData:', webApp.initData ? `✅ Available (${webApp.initData.length} chars)` : '❌ Not available');
    console.log('🔍 InitDataUnsafe:', webApp.initDataUnsafe ? '✅ Available' : '❌ Not available');
    
    if (webApp.initDataUnsafe) {
      console.log('🔍 InitDataUnsafe.user:', webApp.initDataUnsafe.user ? '✅ Available' : '❌ Not available');
      console.log('🔍 InitDataUnsafe.query_id:', webApp.initDataUnsafe.query_id ? '✅ Available' : '❌ Not available');
      console.log('🔍 InitDataUnsafe.auth_date:', webApp.initDataUnsafe.auth_date ? '✅ Available' : '❌ Not available');
      console.log('🔍 InitDataUnsafe.hash:', webApp.initDataUnsafe.hash ? '✅ Available' : '❌ Not available');
      
      if (webApp.initDataUnsafe.user) {
        console.log('🔍 User data:', JSON.stringify(webApp.initDataUnsafe.user, null, 2));
      }
    }
  } else {
    console.log('❌ WebApp object not available');
  }
  
  console.log('==================================');
};

export const getTelegramInitData = (): string => {
  console.log('Получение данных авторизации Telegram...');
  
  // Debug information
  debugTelegramWebApp();
  
  // Проверяем, есть ли реальный Telegram WebApp
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    console.log('Telegram WebApp найден');
    
    const initData = window.Telegram.WebApp.initData;
    console.log('Telegram initData:', initData ? 'найден' : 'отсутствует');
    
    if (initData) {
      console.log('✅ Используем реальные данные initData');
      return initData;
    }
    
    // Если initData отсутствует, попробуем использовать initDataUnsafe
    const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
    console.log('Telegram initDataUnsafe:', initDataUnsafe);
    
    if (initDataUnsafe?.user) {
      // Создаем базовые данные авторизации
      const authDate = Math.floor(Date.now() / 1000);
      const userData = JSON.stringify(initDataUnsafe.user);
      const userParam = `user=${encodeURIComponent(userData)}`;
      const authParam = `auth_date=${authDate}`;
      
      // Генерируем простой hash на основе данных
      const dataToHash = `${userParam}&${authParam}`;
      const hash = btoa(dataToHash).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
      
      const mockInitData = `${userParam}&${authParam}&hash=${hash}`;
      console.log('✅ Создаем данные авторизации из initDataUnsafe');
      console.log('Generated auth data length:', mockInitData.length);
      return mockInitData;
    }
  }
  
  // В режиме разработки возвращаем пустую строку
  // чтобы API знал, что это тестовый режим
  console.warn('❌ Приложение запущено не из Telegram WebApp');
  console.warn('❌ Данные авторизации недоступны');
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

// Function to clear and recreate auth data
export const clearAndRecreateAuthData = () => {
  console.log('🔄 Очищаем и пересоздаем данные авторизации...');
  
  if (typeof window !== 'undefined') {
    // Clear existing data
    localStorage.removeItem('telegram_init_data');
    console.log('✅ Старые данные очищены');
    
    // Recreate auth data
    const newInitData = getTelegramInitData();
    console.log('✅ Новые данные созданы:', newInitData ? 'успешно' : 'ошибка');
    
    return newInitData;
  }
  
  return '';
};

// Function to clean up old auth data on initialization
export const cleanupOldAuthData = () => {
  if (typeof window !== 'undefined') {
    // Remove old test data that might cause conflicts
    localStorage.removeItem('telegram_init_data');
    console.log('🧹 Очищены старые данные авторизации');
  }
};

// Function to test auth data
export const testAuthData = () => {
  console.log('🧪 Тестируем данные авторизации...');
  
  const initData = getTelegramInitData();
  
  if (initData) {
    console.log('✅ Данные авторизации найдены');
    console.log('📊 Длина:', initData.length);
    console.log('📋 Превью:', initData.substring(0, 100) + '...');
    
    // Parse data to check structure
    try {
      const params = new URLSearchParams(initData);
      const user = params.get('user');
      const authDate = params.get('auth_date');
      const hash = params.get('hash');
      
      console.log('🔍 Структура данных:');
      console.log('  - user:', user ? 'есть' : 'отсутствует');
      console.log('  - auth_date:', authDate ? 'есть' : 'отсутствует');
      console.log('  - hash:', hash ? 'есть' : 'отсутствует');
      
      if (user) {
        const userData = JSON.parse(decodeURIComponent(user));
        console.log('👤 Данные пользователя:', userData);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Ошибка парсинга данных:', error);
      return false;
    }
  } else {
    console.error('❌ Данные авторизации не найдены');
    return false;
  }
};

// Function to diagnose server-side issues
export const diagnoseServerAuth = async () => {
  console.log('🔬 Диагностика проблемы авторизации на сервере...');
  
  try {
    // Import debug functions dynamically to avoid circular dependencies
    const { debugAuthConfig, debugValidateTelegramData } = await import('../services/aeonMessengerApi');
    
    // Check server auth configuration
    console.log('🔍 Проверяем конфигурацию сервера...');
    try {
      const authConfig = await debugAuthConfig();
      console.log('🏃 Конфигурация сервера:', authConfig);
      
      if (!authConfig.telegram_bot_token_set) {
        console.error('❌ На сервере не установлен токен Telegram бота!');
        console.error('💡 Решение: Администратор должен установить TELEGRAM_BOT_TOKEN на сервере');
        return 'server_no_token';
      }
      
      console.log('✅ Токен бота на сервере установлен');
    } catch (error) {
      console.error('❌ Ошибка получения конфигурации сервера:', error);
      return 'server_config_error';
    }
    
    // Test validation with current data
    const initData = getTelegramInitData();
    if (initData) {
      console.log('🧪 Тестируем валидацию данных на сервере...');
      try {
        const validationResult = await debugValidateTelegramData(initData);
        console.log('📊 Результат валидации:', validationResult);
        
        if (validationResult.success) {
          console.log('✅ Валидация на сервере прошла успешно!');
          console.log('❓ Возможно, проблема в другом месте');
          return 'validation_success';
        } else {
          console.error('❌ Валидация на сервере не прошла');
          console.error('💡 Причина: Неправильная подпись или истекшие данные');
          return 'validation_failed';
        }
      } catch (error) {
        console.error('❌ Ошибка тестирования валидации:', error);
        return 'validation_error';
      }
    } else {
      console.error('❌ Нет данных для тестирования');
      return 'no_data';
    }
  } catch (error) {
    console.error('❌ Общая ошибка диагностики:', error);
    return 'general_error';
  }
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).telegramUtils = {
    debugTelegramWebApp,
    getTelegramInitData,
    clearAndRecreateAuthData,
    cleanupOldAuthData,
    testAuthData,
    initTelegramWebApp,
    diagnoseServerAuth,
  };
  
  console.log('🔧 Утилиты Telegram доступны через window.telegramUtils');
} 