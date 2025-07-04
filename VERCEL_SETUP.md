# 🚀 Настройка Vercel для AeonMessenger

## Обновление переменных окружения

После развертывания нового backend на Heroku, нужно обновить переменные окружения на Vercel.

### Новый Backend URL
```
https://aeon-backend-2892-d50dfbe26b14.herokuapp.com
```

### Настройка в Vercel Dashboard

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект AeonMessenger
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте или обновите переменную:

```
Name: VITE_CHAT_URL
Value: https://aeon-backend-2892-d50dfbe26b14.herokuapp.com
Environment: Production, Preview, Development
```

### Настройка через Vercel CLI

```bash
# Установите Vercel CLI если ещё не установлен
npm install -g vercel

# Логин в Vercel
vercel login

# Настройка переменных
vercel env add VITE_CHAT_URL
# Введите: https://aeon-backend-2892-d50dfbe26b14.herokuapp.com
# Выберите: Production, Preview, Development

# Обновление проекта
vercel --prod
```

### Локальная разработка

Создайте файл `.env.local` в корне проекта:

```env
# .env.local
VITE_CHAT_URL=https://aeon-backend-2892-d50dfbe26b14.herokuapp.com
```

### Проверка конфигурации

После обновления переменных:

1. **Redeploy проект** на Vercel
2. **Откройте приложение** в Telegram
3. **Проверьте консоль браузера** - должно быть:
   ```
   === Aeon Messenger API Configuration ===
   VITE_CHAT_URL: https://aeon-backend-2892-d50dfbe26b14.herokuapp.com
   Base URL: https://aeon-backend-2892-d50dfbe26b14.herokuapp.com
   Environment: production
   =========================================
   ```

4. **Используйте диагностику**: Кнопка "🔬 Диагностика проблемы" должна показать:
   - ✅ `telegram_bot_token_set: true`
   - ✅ `validation_success` (если запущено из Telegram)

### Ожидаемый результат

- ❌ Ошибки 401 "Недействительные данные авторизации" исчезнут
- ✅ Приложение будет работать с новым backend
- ✅ Авторизация через Telegram будет работать корректно

### Если проблемы остаются

1. Проверьте логи Vercel: `vercel logs`
2. Проверьте консоль браузера на наличие ошибок
3. Используйте диагностику в приложении
4. Проверьте статус backend: `https://aeon-backend-2892-d50dfbe26b14.herokuapp.com/api/v1/health` 