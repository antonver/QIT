# 🛠️ Настройка Backend для AeonMessenger

## Проблема с авторизацией 401
Backend успешно склонирован в папку `backend/`. Теперь нужно настроить его для работы с фронтендом.

## Анализ проблемы

### Что происходит:
1. **Фронтенд отправляет данные**: Заголовок `x-telegram-init-data` с корректными данными Telegram
2. **Backend получает данные**: Сервер видит заголовок и пытается валидировать
3. **Валидация не проходит**: Ошибка 401 "Недействительные данные авторизации"

### Причина:
В файле `backend/app/auth/telegram.py` на строке 20 есть проверка:
```python
if not settings.telegram_bot_token or (settings.telegram_bot_token == "test_token"):
    logger.error("Токен Telegram бота не установлен или использует значение по умолчанию!")
    return None
```

**Проблема**: Используется тестовый токен `test_token` вместо реального токена бота.

## Решение

### 1. Создайте файл `.env` в папке `backend/`
```env
# Database settings
DATABASE_URL=sqlite:///./aeon_messenger.db

# Telegram settings - ЗАМЕНИТЕ НА РЕАЛЬНЫЙ ТОКЕН!
TELEGRAM_BOT_TOKEN=YOUR_REAL_BOT_TOKEN_HERE
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret

# JWT settings
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis settings (опционально)
REDIS_URL=redis://localhost:6379

# File upload settings
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800

# CORS settings
CORS_ORIGINS=*

# App settings
APP_NAME=Aeon Messenger
DEBUG=true
HOST=0.0.0.0
PORT=8000
```

### 2. Получите токен бота Telegram
1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Создайте нового бота командой `/newbot`
3. Дайте ему имя (например, "AeonMessenger")
4. Получите токен бота (выглядит как `123456789:AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRRss`)
5. Замените `YOUR_REAL_BOT_TOKEN_HERE` на реальный токен

### 3. Настройте Mini App
1. В [@BotFather](https://t.me/BotFather) выберите вашего бота
2. Используйте команду `/newapp`
3. Укажите URL вашего фронтенда (например, `https://your-app.vercel.app`)
4. Загрузите иконку и описание

### 4. Установите зависимости и запустите backend
```bash
# Перейдите в папку backend
cd backend

# Установите зависимости
pip install -r requirements.txt

# Запустите сервер
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Альтернативное решение для тестирования

### Если нужно быстро протестировать без реального бота:

Измените файл `backend/app/auth/telegram.py`, строка 20:
```python
# БЫЛО:
if not settings.telegram_bot_token or (settings.telegram_bot_token == "test_token"):
    logger.error("Токен Telegram бота не установлен или использует значение по умолчанию!")
    return None

# СТАЛО (для тестирования):
if not settings.telegram_bot_token:
    logger.error("Токен Telegram бота не установлен!")
    return None
    
# Разрешаем test_token для разработки
if settings.telegram_bot_token == "test_token":
    logger.warning("Используется тестовый токен! Только для разработки!")
    # Для тестового токена всегда возвращаем валидные данные
    return {
        'user': {'id': 391667619, 'first_name': 'Test', 'username': 'testuser'},
        'auth_date': int(time.time()),
        'query_id': 'test_query',
        'start_param': None
    }
```

## Проверка работы

### 1. Проверьте настройки backend
```bash
curl http://localhost:8000/api/v1/debug/auth
```

### 2. Проверьте валидацию данных
```bash
curl -X POST http://localhost:8000/api/v1/debug/validate-telegram-data \
  -H "Content-Type: application/json" \
  -d '"user=%7B%22id%22%3A391667619%2C%22first_name%22%3A%22Test%22%7D&auth_date=1234567890&hash=test"'
```

### 3. Проверьте авторизацию
```bash
curl http://localhost:8000/api/v1/me \
  -H "x-telegram-init-data: user=%7B%22id%22%3A391667619%2C%22first_name%22%3A%22Test%22%7D&auth_date=1234567890&hash=test"
```

## Ожидаемый результат

После правильной настройки:
- ✅ Backend запускается на порту 8000
- ✅ Эндпоинт `/api/v1/me` возвращает данные пользователя
- ✅ Эндпоинт `/api/v1/chats/` возвращает список чатов
- ✅ Фронтенд получает данные вместо ошибки 401

## Структура проекта

```
your-project/
├── backend/              # Backend (FastAPI)
│   ├── app/
│   │   ├── auth/         # Авторизация
│   │   ├── api/          # API роуты
│   │   └── models/       # Модели БД
│   ├── requirements.txt  # Зависимости
│   └── .env             # Настройки (создайте сами)
├── src/                 # Frontend (React)
└── package.json         # Зависимости фронтенда
```

## Следующие шаги

1. **Создайте `.env` файл** в папке `backend/` с реальным токеном бота
2. **Запустите backend**: `cd backend && uvicorn app.main:app --reload`
3. **Обновите фронтенд**: измените URL API на `http://localhost:8000`
4. **Протестируйте**: откройте приложение в Telegram

Если нужна помощь с настройкой - скажите, на каком этапе возникли сложности! 