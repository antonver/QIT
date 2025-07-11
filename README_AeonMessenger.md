# ÆON Messenger

## Описание

**ÆON Messenger** — это новая версия страницы Aeon с полной функциональностью чата, интегрированная с backend API `https://aeon-messenger-app-09faae856b73.herokuapp.com`.

## Функциональность

### 🎯 Основные возможности:
- **Список чатов** - отображение всех доступных чатов пользователя
- **Обмен сообщениями** - отправка и получение текстовых сообщений
- **Создание чатов** - возможность создания новых чатов
- **Responsive дизайн** - адаптивный интерфейс для мобильных устройств
- **Отметки о прочтении** - система уведомлений о непрочитанных сообщениях
- **Аутентификация** - интеграция с Telegram Mini App (с мок-данными для разработки)

### 🔧 Технические особенности:
- **TypeScript** - полная типизация API
- **React Hooks** - кастомный хук `useAeonMessenger` для управления состоянием
- **Material-UI** - современный дизайн с анимациями
- **Axios** - HTTP клиент с interceptors для аутентификации
- **Real-time updates** - поддержка обновлений в реальном времени
- **Error handling** - обработка ошибок с fallback на мок-данные

## API Интеграция

### Endpoint'ы:
- `GET /api/v1/chats/` - получение списка чатов
- `POST /api/v1/chats/` - создание нового чата
- `GET /api/v1/messages/chat/{chat_id}` - получение сообщений чата
- `POST /api/v1/messages/` - отправка сообщения
- `GET /api/v1/me` - получение информации о пользователе

### Аутентификация:
- Использует заголовок `x-telegram-init-data` для аутентификации
- Поддерживает мок-данные для разработки

## Структура файлов

```
src/
├── pages/
│   ├── AeonChat.tsx          # Старая версия (сохранена)
│   └── AeonMessenger.tsx     # Новая версия с backend
├── services/
│   └── aeonMessengerApi.ts   # API клиент
├── hooks/
│   └── useAeonMessenger.ts   # Хук для управления состоянием
└── types/
    └── api.ts                # Типы для API
```

## Навигация

Новая страница доступна по адресу `/aeon-messenger` и добавлена в боковое меню как **"ÆON Messenger"** с синей иконкой.

## Дизайн

Интерфейс выполнен в едином стиле с остальным приложением:
- Темная тема с градиентными акцентами
- Синий цвет (#4a9eff) для активных элементов
- Анимации при наведении и переходах
- Адаптивный дизайн для мобильных устройств

## Мобильная версия

- Адаптивный список чатов
- Полноэкранный режим чата на мобильных устройствах
- Кнопка возврата к списку чатов (FAB)
- Оптимизированные размеры элементов

## Fallback режим

При недоступности backend API приложение автоматически переключается на мок-данные, позволяя тестировать интерфейс локально.

## Запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для production
npm run build
```

## Переменные окружения

```env
VITE_CHAT_URL=https://aeon-messenger-app-09faae856b73.herokuapp.com
```

---

*Создано с использованием React, TypeScript, Material-UI и Telegram Mini App API* 