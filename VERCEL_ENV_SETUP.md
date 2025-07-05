# Настройка переменных окружения для Vercel

## Проблема с ошибкой 405 в Aeon Chat

Ошибка 405 "Method Not Allowed" возникала потому, что API роуты не были правильно настроены для Vercel.

## Исправления

1. **Создан файл `/api/chat.js`** - API роут для обработки POST запросов к `/api/chat`
2. **Создан файл `/api/health.js`** - API роут для проверки состояния сервера
3. **Исправлен `vercel.json`** - добавлено исключение для API роутов в правилах перенаправления

## Настройка переменных окружения в Vercel

Для работы Aeon Chat необходимо настроить следующие переменные окружения:

1. Зайдите в [панель управления Vercel](https://vercel.com/dashboard)
2. Выберите ваш проект
3. Перейдите в Settings → Environment Variables
4. Добавьте следующие переменные:

### Обязательные переменные:

- **OPENAI_API_KEY** - ваш ключ OpenAI API
  - Получить можно на [platform.openai.com](https://platform.openai.com/api-keys)
  - Формат: `sk-...`

### Проверка настройки

После развертывания проверьте:

1. **Health check**: `https://ваш-домен.vercel.app/api/health`
   - Должен вернуть JSON с полем `openai_configured: true`

2. **Chat API**: `https://ваш-домен.vercel.app/api/chat`
   - При POST запросе должен обрабатывать сообщения

## Структура проекта

```
api/
├── chat.js     # Обработка чата с OpenAI
└── health.js   # Проверка состояния сервера
```

## Troubleshooting

- **405 Error**: Проверьте что в `vercel.json` правильно настроены rewrites
- **500 Error**: Проверьте что `OPENAI_API_KEY` добавлен в переменные окружения
- **No response**: Проверьте лимиты и баланс OpenAI аккаунта 