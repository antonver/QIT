# 🔐 Отладка авторизации AeonMessenger

## Проблема
Ошибка 401 "Недействительные данные авторизации"

## Основная причина
Backend на Heroku использует тестовый токен или неправильную конфигурацию

## Быстрая диагностика
```javascript
// В консоли браузера выполните:
await window.telegramUtils.diagnoseServerAuth();
```

## Пошаговая диагностика

### 1. Проверка Telegram WebApp
```javascript
window.telegramUtils.debugTelegramWebApp();
```

### 2. Проверка данных авторизации
```javascript
window.telegramUtils.testAuthData();
```

### 3. Диагностика сервера
```javascript
await window.telegramUtils.diagnoseServerAuth();
```

## Интерпретация результатов

### Если diagnoseServerAuth() возвращает:

- **`server_no_token`**: На сервере не установлен токен бота
  - **Решение**: Администратор должен установить переменную `TELEGRAM_BOT_TOKEN` на Heroku
  
- **`validation_failed`**: Токен установлен, но валидация не проходит
  - **Причина**: Неправильный токен или проблема с подписью
  - **Решение**: Проверить правильность токена в [@BotFather](https://t.me/BotFather)
  
- **`validation_success`**: Валидация прошла успешно
  - **Причина**: Проблема в другом месте
  - **Решение**: Перезагрузить приложение или обратиться к разработчику

## Решения для администратора

### Настройка на Heroku
1. Зайдите в настройки приложения на Heroku
2. Добавьте переменную окружения:
   ```
   TELEGRAM_BOT_TOKEN=ваш_реальный_токен_бота
   ```
3. Перезапустите приложение

### Получение токена бота
1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Создайте нового бота командой `/newbot`
3. Получите токен (формат: `123456789:AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPP`)
4. Настройте Mini App командой `/newapp`

## Решения для пользователей

### Если вы не администратор:
1. **Убедитесь, что приложение открыто из Telegram**
2. **Попробуйте перезапустить приложение**
3. **Обратитесь к администратору** с результатами диагностики

## Для разработчиков
- Используйте HTTPS для локальной разработки
- Настройте Mini App в @BotFather
- Проверьте токен бота на сервере

## Отладка в консоли
```javascript
// Проверка Telegram WebApp
window.telegramUtils.debugTelegramWebApp();

// Тест данных авторизации
window.telegramUtils.testAuthData();
```

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