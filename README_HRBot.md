# HRBot Component

React TypeScript компонент для проведения HR-тестирования с автосохранением и интеграцией с бэкендом.

## Особенности

- ✅ Загрузка тестов с поддержкой мультиязычности
- ✅ Пошаговая навигация по вопросам
- ✅ Автосохранение ответов каждые 30 секунд
- ✅ Отправка результатов и получение оценки
- ✅ Обработка ошибок и состояний загрузки
- ✅ Современный UI с Material-UI
- ✅ TypeScript типизация

## Использование

```tsx
import HRBot from './components/HRBot';

// Базовое использование
<HRBot testId={1} />

// С указанием языка
<HRBot testId={1} lang="en" />
```

## Props

| Prop | Тип | Обязательный | По умолчанию | Описание |
|------|-----|--------------|--------------|----------|
| `testId` | `number` | ✅ | - | ID теста для загрузки |
| `lang` | `string` | ❌ | `'ru'` | Язык теста (`'ru'` или `'en'`) |

## API Endpoints

Компонент использует следующие эндпоинты:

- `GET /test/{test_id}?lang={lang}` - получение теста
- `POST /test/{test_id}/autosave` - автосохранение ответов
- `POST /test/{test_id}/submit` - отправка результатов
- `GET /result/{result_id}` - получение результатов

## Состояния компонента

### Загрузка теста
- Отображается спиннер и сообщение "Loading test..."
- При ошибке показывается сообщение об ошибке с кнопкой "Retry"

### Прохождение теста
- Отображается прогресс-бар с процентом завершения
- Показывается текущий вопрос с вариантами ответов
- Кнопки "Previous" и "Next" для навигации
- Индикатор автосохранения

### Результаты
- Отображается оценка в процентах
- Показываются детали результатов
- Кнопка "Take Test Again" для повторного прохождения

## Автосохранение

Компонент автоматически сохраняет ответы каждые 30 секунд при наличии выбранных ответов. Автосохранение происходит в фоновом режиме и не прерывает работу пользователя.

## Обработка ошибок

- **422 Validation Error**: Отображается пользователю с деталями ошибки
- **Сетевые ошибки**: Показывается общее сообщение об ошибке
- **Ошибки автосохранения**: Логируются в консоль, но не показываются пользователю

## Типы данных

```typescript
interface Test {
  id: number;
  title: string;
  questions: Question[];
}

interface Question {
  id: number;
  text: string;
  answers: Answer[];
}

interface Answer {
  id: number;
  text: string;
}

interface UserAnswer {
  question_id: number;
  answer_id: number;
}

interface GetResultResponse {
  score: number;
  details: string;
}
```

## Пример интеграции

```tsx
import React from 'react';
import { Container, Typography } from '@mui/material';
import HRBot from './components/HRBot';

const TestPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        HR Assessment Test
      </Typography>
      
      <HRBot testId={1} lang="ru" />
    </Container>
  );
};

export default TestPage;
```

## Зависимости

- React 18+
- TypeScript
- Material-UI (MUI)
- Axios (через API сервис)

## Требования к бэкенду

Бэкенд должен поддерживать OpenAPI спецификацию с эндпоинтами:
- Тесты с вопросами и ответами
- Автосохранение ответов
- Отправка результатов
- Получение результатов с оценкой

## Безопасность

- Все API запросы используют токены аутентификации
- Автоматическая обработка истечения токенов
- Валидация данных на клиенте и сервере 