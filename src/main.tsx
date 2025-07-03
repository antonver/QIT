import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
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
    <App />
  </StrictMode>,
)
