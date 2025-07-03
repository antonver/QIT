# 🔐 Отладка авторизации AeonMessenger

## Проблема
Ошибка 401 "Недействительные данные авторизации"

## Основная причина
Приложение запущено не из Telegram WebApp

## Решение
1. Откройте Telegram (мобильное приложение или веб-версию)
2. Найдите бота AeonMessenger
3. Нажмите "Запустить" или "Open App"
4. Приложение откроется с правильной авторизацией

## Отладка в консоли
```javascript
// Проверка Telegram WebApp
window.telegramUtils.debugTelegramWebApp();

// Тест данных авторизации
window.telegramUtils.testAuthData();
```

## Для разработчиков
- Используйте HTTPS для локальной разработки
- Настройте Mini App в @BotFather
- Проверьте токен бота на сервере

## Причины ошибки

### 1. Отсутствуют данные initData
**Причина:** Telegram не предоставляет данные для авторизации.

**Проверка:**
```javascript
// Откройте консоль разработчика (F12) и выполните:
window.telegramUtils.debugTelegramWebApp();
```

**Что должно быть:**
- ✅ Telegram object: Available
- ✅ WebApp object: Available
- ✅ InitData: Available
- ✅ InitDataUnsafe.user: Available

### 2. Неправильная конфигурация Telegram Bot
**Причина:** Бот не настроен для работы с Mini Apps.

**Проверка:**
- Убедитесь, что бот создан через [@BotFather](https://t.me/BotFather)
- Настроен URL для Mini App
- Домен добавлен в список разрешенных

## Отладка в консоли разработчика

### Базовая диагностика
```javascript
// Проверка доступности Telegram WebApp
console.log('Telegram WebApp:', window.Telegram?.WebApp ? 'Available' : 'Not Available');

// Проверка данных авторизации
window.telegramUtils.testAuthData();

// Подробная информация о WebApp
window.telegramUtils.debugTelegramWebApp();
```

### Дополнительные команды
```javascript
// Получить текущие данные авторизации
const initData = window.telegramUtils.getTelegramInitData();
console.log('Init Data:', initData);

// Информация о пользователе
console.log('User:', window.Telegram?.WebApp?.initDataUnsafe?.user);

// Очистить и пересоздать данные
window.telegramUtils.clearAndRecreateAuthData();
```

## Типичные сценарии

### Сценарий 1: Разработка локально
**Проблема:** Приложение открыто через `localhost` или `file://`
**Решение:** Для разработки используйте туннелирование (ngrok, localtunnel) или развертывание на HTTPS

### Сценарий 2: Тестирование в браузере
**Проблема:** Приложение открыто напрямую в браузере
**Решение:** Используйте Telegram Web или мобильное приложение Telegram

### Сценарий 3: Неправильный URL
**Проблема:** URL не соответствует настроенному в боте
**Решение:** Проверьте настройки Mini App в [@BotFather](https://t.me/BotFather)

## Шаги для решения проблемы

### Шаг 1: Проверка среды выполнения
```javascript
// Выполните в консоли браузера
console.log('Current URL:', window.location.href);
console.log('User Agent:', navigator.userAgent);
console.log('Telegram WebApp:', window.Telegram?.WebApp ? 'Available' : 'Not Available');
```

### Шаг 2: Проверка данных авторизации
```javascript
// Выполните в консоли браузера
window.telegramUtils.debugTelegramWebApp();
```

### Шаг 3: Проверка сетевых запросов
1. Откройте вкладку "Network" в DevTools
2. Обновите страницу
3. Найдите запросы к API (обычно `/api/v1/chats/` или `/api/v1/me`)
4. Проверьте заголовки запроса - должен быть `x-telegram-init-data`

### Шаг 4: Анализ ошибки сервера
Если заголовок `x-telegram-init-data` присутствует, но сервер возвращает 401:
- Проверьте валидность данных на сервере
- Убедитесь, что сервер правильно валидирует подпись Telegram
- Проверьте, что токен бота совпадает с используемым для валидации

## Настройка для разработки

### Для разработчиков
1. Создайте Telegram Bot через [@BotFather](https://t.me/BotFather)
2. Настройте Mini App URL (должен быть HTTPS)
3. Добавьте домен в список разрешенных
4. Получите токен бота и настройте сервер

### Переменные окружения
```env
VITE_CHAT_URL=https://your-api-server.com
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

## Полезные ссылки

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/BotFather)

## Контакты для поддержки

Если проблема не решена, обратитесь к разработчикам с:
1. Скриншотом ошибки
2. Логами из консоли браузера
3. Информацией о том, как вы пытались запустить приложение
4. Результатами выполнения команд отладки выше 