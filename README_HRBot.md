# HR Bot Интервью - Документация

## 🚀 Что создано

Создана полнофункциональная страница HR Bot интервью с интеграцией API и современным UI.

## 📁 Новые файлы

### API Service
- `src/services/hrBotApi.ts` - Сервис для работы с API
  - Типизация TypeScript для всех эндпоинтов  
  - Обработка ошибок
  - Поддержка всех методов API

### Страницы
- `src/pages/HRBotPage.tsx` - Основная страница интервью
- `src/pages/HRBot.tsx` - Обновлен для использования новой страницы

## ⚙️ Настройка

### 1. Создайте .env файл
```bash
# В корне проекта создайте файл .env
VITE_API_URL=http://localhost:8000
```

### 2. Убедитесь что API работает
Проверьте что ваш бэкенд запущен на указанном URL и отвечает на эндпоинты:
- `POST /session`
- `POST /aeon/question/{token}`
- `POST /session/{token}/answer`
- `POST /session/{token}/complete`
- `POST /aeon/glyph/{token}`

## 🎯 Функциональность

### Основные возможности
- ✅ **Создание сессии** при загрузке страницы
- ✅ **90-секундный таймер** для каждого вопроса  
- ✅ **Автоотправка** ответов по истечении времени
- ✅ **Ручная отправка** ответов досрочно
- ✅ **Прогресс-бар** и индикация текущего вопроса
- ✅ **Разные типы вопросов**: текст, выбор, шкала
- ✅ **Генерация глифа** по завершении
- ✅ **Скачивание результата**

### Типы вопросов
1. **Текстовые** - многострочное поле ввода
2. **Выбор вариантов** - радио-кнопки  
3. **Шкала оценки** - слайдер от 1 до 10

### Состояния интервью
1. **Инициализация** - создание сессии и загрузка первого вопроса
2. **Готов к началу** - ожидание старта пользователем
3. **В процессе** - прохождение вопросов с таймером
4. **Завершено** - показ глифа и результатов

## 🎨 UI/UX Features

### Material UI компоненты
- `Card` с elevation для современного вида
- `LinearProgress` для таймера и прогресса  
- `Chip` для отображения времени с цветовой индикацией
- `Alert` для показа ошибок
- `CircularProgress` для индикации загрузки

### Анимации
- Плавные переходы с Framer Motion
- Анимированное появление элементов
- Hover эффекты на кнопках

### Адаптивность
- Responsive дизайн для всех устройств
- Оптимизация для мобильных
- Современная типографика

## 🔧 Техническая реализация

### Управление состоянием
```typescript
type SessionState = 'initializing' | 'ready' | 'in_progress' | 'completed' | 'error';
```

### Таймер
- Обратный отсчет с 90 секунд
- Автоматическая отправка по истечении
- Визуальная индикация (зеленый → желтый → красный)

### API интеграция
- Полная типизация TypeScript
- Обработка ошибок сети
- Автоматические переходы между вопросами

## 🚦 Как использовать

### 1. Навигация
Перейдите на страницу HR Bot через боковое меню

### 2. Процесс интервью
1. Дождитесь инициализации сессии
2. Нажмите "Начать интервью"
3. Отвечайте на вопросы в течение 90 секунд каждый
4. Получите персональный глиф по завершении

### 3. Результаты
- Просмотр сгенерированного глифа
- Скачивание результата на устройство
- Просмотр статистики сессии

## 🐛 Обработка ошибок

### Сетевые ошибки
- Показ пользователю понятных сообщений
- Кнопка "Попробовать снова"
- Логирование в консоль для отладки

### Состояния загрузки
- Spinner'ы во время загрузки
- Блокировка кнопок во время отправки
- Индикация прогресса

## 🧪 Тестирование

### Для разработки
Если у вас нет настоящего API, вы можете:
1. Запустить мок-сервер
2. Изменить URL в `.env` 
3. Использовать инструменты разработчика для имитации ответов

### Проверка функций
1. Создание сессии при загрузке
2. Работа таймера (90 сек)
3. Отправка ответов
4. Переход между вопросами
5. Завершение сессии
6. Генерация глифа

## 🔮 Возможные улучшения

- [ ] Сохранение прогресса в localStorage
- [ ] Пауза/возобновление интервью  
- [ ] Предпросмотр ответов перед отправкой
- [ ] Экспорт результатов в PDF
- [ ] Интеграция с календарем
- [ ] Уведомления о приближающемся deadline

## 📱 Навигация

Страница доступна по маршруту `/hrbot` или через кнопку "HR Bot" в боковом меню.

---

🎉 **Готово к использованию!** Запустите приложение и перейдите на страницу HR Bot для тестирования. 