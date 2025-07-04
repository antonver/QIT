import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/index'
import './index.css'
import './styles/smooth.css'
import App from './App.tsx'

// Обработка ошибки TelegramGameProxy
if (typeof window !== 'undefined') {
  // Подавляем ошибку TelegramGameProxy, если она возникает
  window.addEventListener('error', (event) => {
    if (event.message.includes('TelegramGameProxy')) {
      event.preventDefault();
      console.warn('TelegramGameProxy error suppressed - this is expected in mini apps');
    }
  });

  // Инициализируем Telegram WebApp если доступен
  // Ждем небольшой timeout, чтобы убедиться что скрипт загрузился
  setTimeout(() => {
    if (window.Telegram?.WebApp) {
      console.log('Инициализация Telegram WebApp...');
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#232b3b');
      window.Telegram.WebApp.setBackgroundColor('#232b3b');
      window.Telegram.WebApp.enableClosingConfirmation();
      console.log('Telegram WebApp инициализирован');
    } else {
      console.log('Telegram WebApp не найден');
    }
  }, 100);
}

// Добавляем условное подключение Eruda для отладки в Telegram Mini App
if (typeof window !== 'undefined' && window.location.search.includes('debug')) {
  // Динамически импортируем Eruda, чтобы не включать его в основной бандл
  import('eruda').then((module) => {
    // У некоторых сборок eruda экспортируется как default
    const eruda = (module as any).default ?? module;
    eruda.init && eruda.init();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
