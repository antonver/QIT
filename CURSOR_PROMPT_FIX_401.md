# Промпт для Cursor: Исправление ошибки 401 в Backend

## Проблема
Frontend AeonMessenger отправляет корректные данные Telegram в заголовке `x-telegram-init-data`, но backend возвращает 401 "Недействительные данные авторизации".

## Найденная причина
В файле `backend/app/auth/telegram.py` строка 20:
```python
if not settings.telegram_bot_token or (settings.telegram_bot_token == "test_token"):
    logger.error("Токен Telegram бота не установлен или использует значение по умолчанию!")
    return None
```

Backend отклоняет валидацию из-за тестового токена.

## Нужно исправить

### Вариант 1: Настройте реальный токен бота
1. Создайте файл `.env` в папке `backend/`
2. Добавьте реальный токен: `TELEGRAM_BOT_TOKEN=YOUR_REAL_BOT_TOKEN`
3. Получите токен в [@BotFather](https://t.me/BotFather)

### Вариант 2: Разрешите тестовый режим
Измените `backend/app/auth/telegram.py` строку 20:
```python
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

## Ожидаемый результат
- ✅ `/api/v1/me` возвращает данные пользователя
- ✅ `/api/v1/chats/` возвращает список чатов  
- ✅ Ошибка 401 исчезает

## Тестирование
```bash
# Запустите backend
cd backend && uvicorn app.main:app --reload

# Проверьте
curl http://localhost:8000/api/v1/me -H "x-telegram-init-data: test"
```

Исправьте это, пожалуйста! 