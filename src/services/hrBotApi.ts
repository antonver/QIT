// API сервис для HRBot
const API_BASE_URL = 'https://aeon-hr-fixed-backend-540e49434c71.herokuapp.com';

export interface SessionResponse {
  token: string;
  [key: string]: any;
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'choice' | 'scale' | 'technical';
  options?: string[];
  [key: string]: any;
}

// Реальная структура ответа API
export interface ApiQuestionResponse {
  questions: Question[];
  total_questions: number;
  remaining_questions: number;
  completed?: boolean;
}

export interface Answer {
  question_id?: string;
  answer: string | number;
  time_spent?: number; // Время в секундах
  [key: string]: any;
}

export interface AnswerResponse {
  success: boolean;
  time_spent?: number;
  question_number?: number;
  [key: string]: any;
}

export interface GlyphResponse {
  glyph: string;
  profile: string;
  svg?: string;
  [key: string]: any;
}

export interface ResultResponse {
  session_id: string;
  total_time: number;
  questions_answered: number;
  completion_rate: number;
  [key: string]: any;
}

// Реальная структура ответа API для глифа
export interface ApiGlyphResponse {
  glyph: string;
  profile: string;
  [key: string]: any;
}

// Состояние сессии для отслеживания прогресса
interface SessionState {
  token: string;
  questionIndex: number;
  askedQuestions: Set<string>;
  answers: { [key: string]: string };
  totalQuestions: number;
  lastQuestionId?: string; // Добавляем для отслеживания последнего вопроса
}

// Глобальное состояние сессий
const sessionStates = new Map<string, SessionState>();

class HRBotAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Создать сессию - POST /session
  async createSession(): Promise<SessionResponse> {
    const response = await this.request<SessionResponse>('/session', {
      method: 'POST',
    });
    
    // Инициализируем состояние сессии
    sessionStates.set(response.token, {
      token: response.token,
      questionIndex: 0,
      askedQuestions: new Set(),
      answers: {},
      totalQuestions: 10
    });
    
    return response;
  }

  // Получить информацию о сессии - GET /session/{token}
  async getSession(token: string): Promise<any> {
    return this.request(`/session/${token}`, {
      method: 'GET',
    });
  }

  // Получить следующий вопрос - POST /aeon/question/{token}
  async getNextQuestion(token: string, data: any = {}): Promise<Question[]> {
    const sessionState = sessionStates.get(token);
    
    if (!sessionState) {
      throw new Error('Session not found');
    }
    
    try {
      console.log(`📤 API: Requesting questions for token ${token}`);
      
      const response = await this.request<ApiQuestionResponse>(`/aeon/question/${token}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // Проверяем, не завершен ли тест
      if (response && response.completed) {
        console.log('🎯 API: Test completed, no more questions');
        return [];
      }
      
      // Преобразуем ответ API в наш формат
      if (response && response.questions) {
        const questions = response.questions.map((q, index) => ({
          id: q.id || `q_${sessionState.questionIndex + index + 1}`,
          text: q.text,
          type: 'text' // Все вопросы открытые
        }));
        
        // Обновляем индекс вопроса
        sessionState.questionIndex += questions.length;
        console.log(`✅ API: Received ${questions.length} questions`);
        
        return questions;
      }
      
      console.log(`❌ API: No questions received from API`);
      return [];
    } catch (error) {
      console.error('API: Error getting questions:', error);
      return [];
    }
  }

  // Отправить ответ - POST /session/{token}/answer
  async submitAnswer(token: string, answer: Answer): Promise<AnswerResponse> {
    const sessionState = sessionStates.get(token);
    
    if (sessionState && answer.question_id) {
      // Сохраняем ответ в состоянии сессии
      sessionState.answers[answer.question_id] = answer.answer.toString();
      
      console.log(`📝 API: Answer saved for question ${answer.question_id}, current index: ${sessionState.questionIndex}`);
      console.log(`✅ API: Answer submitted for question ${answer.question_id}`);
    }
    
    return this.request<AnswerResponse>(`/session/${token}/answer`, {
      method: 'POST',
      body: JSON.stringify(answer),
    });
  }

  // Завершить сессию - POST /session/{token}/complete
  async completeSession(token: string): Promise<any> {
    const response = await this.request(`/session/${token}/complete`, {
      method: 'POST',
    });
    
    // Очищаем состояние сессии
    sessionStates.delete(token);
    
    return response;
  }

  // Получить результат - GET /result/{token}
  async getResult(token: string): Promise<ResultResponse> {
    return this.request<ResultResponse>(`/result/${token}`, {
      method: 'GET',
    });
  }

  // Сгенерировать глиф - POST /aeon/glyph/{token}
  async generateGlyph(token: string, data: any = {}): Promise<GlyphResponse> {
    const response = await this.request<ApiGlyphResponse>(`/aeon/glyph/${token}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Возвращаем ответ API как есть
    return {
      glyph: response.glyph,
      profile: response.profile
    };
  }

  // Получить сводку/профиль - POST /aeon/summary/{token}
  async getSummary(token: string): Promise<{ summary: string }> {
    const response = await this.request<{ summary: string }>(`/aeon/summary/${token}`, {
      method: 'POST',
    });
    
    return response;
  }
}

// Настройки API
const USE_MOCK = false; // Используем реальный API

// Создаем гибридный API, который автоматически переключается на mock при ошибках
export const hrBotAPI = USE_MOCK ? createMockAPI() : createHybridAPI();

// Гибридный API с автоматическим переключением на mock
function createHybridAPI() {
  const realAPI = new HRBotAPI();
  const mockAPI = createMockAPI();
  
  return {
    async createSession(): Promise<SessionResponse> {
      try {
        console.log('🌐 Trying real API for session creation...');
        const result = await realAPI.createSession();
        console.log('✅ Real API session created:', result.token);
        return result;
      } catch (error) {
        console.warn('❌ Real API failed, using mock:', error);
        const mockResult = await mockAPI.createSession();
        console.log('✅ Mock API session created:', mockResult.token);
        return mockResult;
      }
    },
    
    async getNextQuestion(token: string, data: any = {}): Promise<Question[]> {
      if (token.startsWith('mock_')) {
        console.log('🔄 Using mock API for getNextQuestion');
        return mockAPI.getNextQuestion(token, data);
      }
      
      try {
        console.log('🌐 Trying real API for getNextQuestion...');
        const result = await realAPI.getNextQuestion(token, data);
        console.log('✅ Real API question received');
        return result;
      } catch (error) {
        console.warn('❌ Real API failed for getNextQuestion, using mock:', error);
        return mockAPI.getNextQuestion(token, data);
      }
    },
    
    async submitAnswer(token: string, answer: Answer): Promise<AnswerResponse> {
      if (token.startsWith('mock_')) return mockAPI.submitAnswer(token, answer);
      
      try {
        const result = await realAPI.submitAnswer(token, answer);
        return result;
      } catch (error) {
        console.warn('Real API failed, using mock:', error);
        return mockAPI.submitAnswer(token, answer);
      }
    },
    
    async completeSession(token: string): Promise<any> {
      if (token.startsWith('mock_')) return mockAPI.completeSession(token);
      
      try {
        return await realAPI.completeSession(token);
      } catch (error) {
        console.warn('Real API failed, using mock:', error);
        return mockAPI.completeSession(token);
      }
    },

    async getResult(token: string): Promise<ResultResponse> {
      if (token.startsWith('mock_')) return mockAPI.getResult(token);
      
      try {
        return await realAPI.getResult(token);
      } catch (error) {
        console.warn('Real API failed, using mock:', error);
        return mockAPI.getResult(token);
      }
    },
    
    async generateGlyph(token: string, data: any = {}): Promise<GlyphResponse> {
      if (token.startsWith('mock_')) return mockAPI.generateGlyph(token);
      
      try {
        const result = await realAPI.generateGlyph(token, data);
        return result;
      } catch (error) {
        console.warn('Real API failed, using mock:', error);
        return mockAPI.generateGlyph(token);
      }
    },
    
    async getSummary(token: string): Promise<{ summary: string }> {
      if (token.startsWith('mock_')) return mockAPI.getSummary(token);
      
      try {
        const result = await realAPI.getSummary(token);
        return result;
      } catch (error) {
        console.warn('Real API failed, using mock:', error);
        return mockAPI.getSummary(token);
      }
    },
    
    async getSession(token: string): Promise<any> {
      if (token.startsWith('mock_')) return mockAPI.getSession(token);
      
      try {
        return await realAPI.getSession(token);
      } catch (error) {
        console.warn('Real API failed, using mock:', error);
        return mockAPI.getSession(token);
      }
    },
    
    async cleanupSession(token: string): Promise<void> {
      if (token.startsWith('mock_')) return mockAPI.cleanupSession(token);
      
      // Реальный API не требует очистки (сервер сам управляет памятью)
      console.log(`🧹 Real API: Session cleanup not required for ${token}`);
    }
  };
}

// Функция создания мок API
function createMockAPI() {
  // Улучшенные мок данные вопросов (10 вопросов для полного интервью)
  const MOCK_QUESTIONS: Question[] = [
    {
      id: 'q_1',
      text: 'Расскажите о себе и своем профессиональном опыте. Какие навыки и достижения вы считаете наиболее важными?',
      type: 'text',
    },
    {
      id: 'q_2', 
      text: 'Опишите свой идеальный рабочий день. Что бы вы делали и как бы себя чувствовали?',
      type: 'text',
    },
    {
      id: 'q_3',
      text: 'Расскажите о ситуации, когда вам пришлось решать сложную проблему. Как вы подошли к решению?',
      type: 'text',
    },
    {
      id: 'q_4',
      text: 'Как вы справляетесь со стрессом и давлением на работе? Приведите конкретный пример.',
      type: 'text',
    },
    {
      id: 'q_5',
      text: 'Расскажите о своем опыте работы в команде. Какую роль вы обычно играете в коллективе?',
      type: 'text',
    },
    {
      id: 'q_6',
      text: 'Какие технологии, методы или навыки вы изучили за последний год? Что планируете изучить?',
      type: 'text',
    },
    {
      id: 'q_7',
      text: 'Опишите ситуацию, когда вам пришлось адаптироваться к серьезным изменениям. Как вы это делали?',
      type: 'text',
    },
    {
      id: 'q_8',
      text: 'Расскажите о своих карьерных целях. Где вы видите себя через 2-3 года?',
      type: 'text',
    },
    {
      id: 'q_9',
      text: 'Что мотивирует вас в работе больше всего? Что дает вам энергию для профессионального роста?',
      type: 'text',
    },
    {
      id: 'q_10',
      text: 'Почему вы заинтересованы в работе в нашей компании? Какой вклад вы хотите внести?',
      type: 'text',
    }
  ];

  // Состояние для каждой сессии
  const mockSessionStates = new Map<string, {
    currentQuestionIndex: number;
    sessionStartTime: number;
    questionStartTime: number;
    totalTimeSpent: number;
    answers: { [key: string]: string };
    askedQuestions: Set<string>; // Добавляем отслеживание заданных вопросов
  }>();

  const delay = (ms: number = 1000): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // Функция для создания fallback сессии
  const createFallbackSession = (token: string) => {
    const sessionState = {
      currentQuestionIndex: 0,
      sessionStartTime: Date.now(),
      questionStartTime: Date.now(),
      totalTimeSpent: 0,
      answers: {},
      askedQuestions: new Set<string>()
    };
    mockSessionStates.set(token, sessionState);
    return sessionState;
  };

  return {
    // Создать сессию
    async createSession(): Promise<SessionResponse> {
      await delay(800);
      const token = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      mockSessionStates.set(token, {
        currentQuestionIndex: 0,
        sessionStartTime: Date.now(),
        questionStartTime: Date.now(),
        totalTimeSpent: 0,
        answers: {},
        askedQuestions: new Set<string>()
      });
      
      return {
        token,
        created_at: new Date().toISOString(),
        status: 'active'
      };
    },

    // Получить следующий вопрос
    async getNextQuestion(token: string, _data: any = {}): Promise<Question[]> {
      await delay(600);
      
      let sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        console.warn(`⚠️ Mock: Session ${token} not found, creating fallback session`);
        sessionState = createFallbackSession(token);
      }
      
      console.log(`📋 Mock: Getting question with index ${sessionState.currentQuestionIndex}, total questions: ${MOCK_QUESTIONS.length}`);
      console.log(`📋 Mock: Already asked questions:`, Array.from(sessionState.askedQuestions));
      
      // Гарантированно выдаем ровно 10 вопросов
      if (sessionState.currentQuestionIndex >= 10) {
        console.log(`🔚 Mock: Reached question limit: ${sessionState.currentQuestionIndex}/10`);
        return [];
      }
      
      // Ищем следующий незаданный вопрос
      let questionIndex = sessionState.currentQuestionIndex;
      while (questionIndex < MOCK_QUESTIONS.length && questionIndex < 10) {
        const question = MOCK_QUESTIONS[questionIndex];
        
        if (!sessionState.askedQuestions.has(question.id)) {
          // Найден незаданный вопрос
          sessionState.askedQuestions.add(question.id);
          sessionState.questionStartTime = Date.now();
          sessionState.currentQuestionIndex = questionIndex + 1;
          
          console.log(`✅ Mock: Question ${question.id} prepared (index ${questionIndex + 1}/10):`, question.text.substring(0, 50) + '...');
          
          return [question];
        }
        
        console.warn(`⚠️ Mock: Question ${question.id} already asked, trying next`);
        questionIndex++;
      }
      
      // Если не найдено незаданных вопросов, но мы еще не достигли лимита в 10
      if (sessionState.currentQuestionIndex < 10) {
        console.log(`🔄 Mock: Reusing questions to reach 10 total`);
        // Переиспользуем вопросы, но с новыми ID
        const reusedQuestion = MOCK_QUESTIONS[sessionState.currentQuestionIndex % MOCK_QUESTIONS.length];
        const newQuestionId = `q_reused_${sessionState.currentQuestionIndex + 1}`;
        
        sessionState.askedQuestions.add(newQuestionId);
        sessionState.questionStartTime = Date.now();
        sessionState.currentQuestionIndex++;
        
        console.log(`✅ Mock: Reused question prepared (${sessionState.currentQuestionIndex}/10):`, reusedQuestion.text.substring(0, 50) + '...');
        
        return [reusedQuestion];
      }
      
      // Если не найдено незаданных вопросов
      console.log(`🔚 Mock: No more unasked questions available`);
      return [];
    },

    // Отправить ответ
    async submitAnswer(token: string, answer: Answer): Promise<AnswerResponse> {
      await delay(500);
      
      let sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        console.warn(`⚠️ Mock: Session ${token} not found for submitAnswer, creating fallback session`);
        sessionState = createFallbackSession(token);
      }
      
      const timeSpent = Math.floor((Date.now() - sessionState.questionStartTime) / 1000);
      sessionState.totalTimeSpent += timeSpent;
      
      // Сохраняем ответ
      if (answer.question_id) {
        sessionState.answers[answer.question_id] = answer.answer.toString();
        console.log(`💾 Mock: Answer saved for question ${answer.question_id}: "${answer.answer}" (length: ${answer.answer.toString().length})`);
      } else {
        console.warn(`⚠️ Mock: No question_id provided for answer:`, answer);
      }
      
      console.log(`✅ Mock: Answer submitted, moving to question ${sessionState.currentQuestionIndex + 1}`);
      console.log(`📊 Mock: Total answers saved so far:`, Object.keys(sessionState.answers).length);
      
      return {
        success: true,
        time_spent: timeSpent,
        question_number: sessionState.currentQuestionIndex,
        saved_at: new Date().toISOString()
      };
    },

    // Завершить сессию
    async completeSession(token: string): Promise<any> {
      await delay(800);
      
      let sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        console.warn(`⚠️ Mock: Session ${token} not found for completeSession, creating fallback session`);
        sessionState = createFallbackSession(token);
      }
      
      const actualAnswersCount = Object.keys(sessionState.answers).length;
      console.log(`📊 Mock: completeSession - found ${actualAnswersCount} answers`);
      
      const result = {
        success: true,
        session_id: token,
        questions_answered: actualAnswersCount, // Используем реальное количество ответов
        total_time: sessionState.totalTimeSpent,
        completed_at: new Date().toISOString()
      };
      
      return result;
    },

    // Получить результат
    async getResult(token: string): Promise<ResultResponse> {
      await delay(400);
      
      let sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        console.warn(`⚠️ Mock: Session ${token} not found for getResult, creating fallback session`);
        sessionState = createFallbackSession(token);
      }
      
      const actualAnswersCount = Object.keys(sessionState.answers).length;
      console.log(`📊 Mock: getResult - currentQuestionIndex: ${sessionState.currentQuestionIndex}, actual answers: ${actualAnswersCount}`);
      
      return {
        session_id: token,
        total_time: sessionState.totalTimeSpent,
        questions_answered: actualAnswersCount, // Используем реальное количество ответов
        completion_rate: (actualAnswersCount / 10) * 100,
        average_time_per_question: Math.floor(sessionState.totalTimeSpent / (actualAnswersCount || 1)),
        performance_score: Math.floor(Math.random() * 40) + 60,
        created_at: new Date(sessionState.sessionStartTime).toISOString(),
        completed_at: new Date().toISOString()
      };
    },

    // Сгенерировать глиф с улучшенным анализом
    async generateGlyph(token: string): Promise<GlyphResponse> {
      await delay(1500);
      
      let sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        console.warn(`⚠️ Mock: Session ${token} not found for generateGlyph, creating fallback session`);
        sessionState = createFallbackSession(token);
      }
      
      // Анализируем качество ответов
      const answers = Object.values(sessionState.answers);
      console.log(`📊 Mock: Glyph analysis - found ${answers.length} answers:`, answers);
      
      if (answers.length === 0) {
        return {
          glyph: '❌ Нет данных',
          profile: 'Не удалось получить ответы для анализа. Возможно, произошла ошибка в процессе интервью.'
        };
      }
      
      const avgAnswerLength = answers.reduce((sum, answer) => sum + answer.length, 0) / answers.length;
      
      // Более строгий анализ качества ответов
      const veryDetailedAnswers = answers.filter(answer => answer.length > 100).length; // Очень подробные (100+ символов)
      const detailedAnswers = answers.filter(answer => answer.length > 50).length; // Подробные (50+ символов)
      const basicAnswers = answers.filter(answer => answer.length >= 20 && answer.length <= 50).length; // Базовые (20-50 символов)
      const shortAnswers = answers.filter(answer => answer.length < 20).length; // Короткие (менее 20 символов)
      
      const veryDetailedPercentage = answers.length > 0 ? (veryDetailedAnswers / answers.length) * 100 : 0;
      const detailedPercentage = answers.length > 0 ? (detailedAnswers / answers.length) * 100 : 0;
      const shortPercentage = answers.length > 0 ? (shortAnswers / answers.length) * 100 : 0;
      
      let glyph = '';
      let profile = '';
      
      // Если слишком много коротких ответов (более 50%), даем критическую оценку
      if (shortPercentage > 50 || avgAnswerLength < 15) {
        glyph = '⚠️ Требуется Доработка';
        profile = `Кандидат предоставил слишком краткие ответы (средняя длина: ${Math.round(avgAnswerLength)} символов). ${shortAnswers} из ${answers.length} ответов содержат менее 20 символов. Это может указывать на недостаточную подготовку к собеседованию, нежелание раскрываться или проблемы с коммуникацией. Рекомендуется дополнительное интервью для более глубокой оценки.`;
      }
      // Если много коротких ответов (30-50%), даем умеренно критическую оценку
      else if (shortPercentage > 30 || avgAnswerLength < 30) {
        glyph = '🔍 Нуждается в Развитии';
        profile = `Кандидат показал базовый уровень коммуникации (средняя длина ответов: ${Math.round(avgAnswerLength)} символов). ${shortAnswers} из ${answers.length} ответов были слишком краткими. Демонстрирует потенциал, но нуждается в развитии навыков самопрезентации и более глубокой рефлексии. Может подойти для junior позиций с усиленным менторингом.`;
      }
      // Если есть хороший баланс подробных ответов
      else if (veryDetailedPercentage >= 60) {
        glyph = '🎯 Лидер-Аналитик';
        profile = `Кандидат продемонстрировал исключительную глубину мышления и аналитические способности. Средняя длина ответов: ${Math.round(avgAnswerLength)} символов. ${veryDetailedAnswers} из ${answers.length} ответов были очень подробными. Показывает высокий уровень самрефлексии, стратегического мышления и готовности к лидерству. Отлично структурирует мысли и может детально объяснить свои решения.`;
      }
      // Если есть достаточно подробных ответов
      else if (detailedPercentage >= 50) {
        glyph = '⚡ Потенциал-Рост';
        profile = `Кандидат показал хорошие коммуникативные навыки и потенциал для развития. Средняя длина ответов: ${Math.round(avgAnswerLength)} символов. ${detailedAnswers} из ${answers.length} ответов были достаточно подробными. Демонстрирует готовность к обучению, адаптивность и базовые профессиональные компетенции. Может эффективно работать в команде и брать на себя ответственность.`;
      }
      // Средний уровень
      else {
        glyph = '🚀 Стартер-Энтузиаст';
        profile = `Кандидат показал умеренный уровень коммуникации (средняя длина ответов: ${Math.round(avgAnswerLength)} символов). ${basicAnswers} из ${answers.length} ответов были базового уровня. Демонстрирует мотивацию к работе, но может улучшить навыки самопрезентации. Подходит для позиций начального уровня с перспективами развития при правильном наставничестве.`;
      }
      
      return { glyph, profile };
    },

    // Получить сводку с детальным анализом
    async getSummary(token: string): Promise<{ summary: string }> {
      await delay(1200);
      
      let sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        console.warn(`⚠️ Mock: Session ${token} not found for getSummary, creating fallback session`);
        sessionState = createFallbackSession(token);
      }
      
      const answers = Object.values(sessionState.answers);
      const totalAnswers = answers.length;
      
      console.log(`📊 Mock: Summary analysis - found ${totalAnswers} answers:`, answers);
      console.log(`📊 Mock: Session state:`, {
        currentQuestionIndex: sessionState.currentQuestionIndex,
        askedQuestions: Array.from(sessionState.askedQuestions),
        totalTimeSpent: sessionState.totalTimeSpent
      });
      
      if (totalAnswers === 0) {
        return {
          summary: `📊 **Анализ интервью завершен**

**⚠️ Проблема с данными:**
Не удалось получить ответы для анализа. Возможно, произошла техническая ошибка в процессе интервью.

**Рекомендации:**
• Рекомендуется повторить интервью
• Проверить техническую исправность системы
• Обратиться к администратору при повторении проблемы`
        };
      }
      
      const avgAnswerLength = answers.reduce((sum, answer) => sum + answer.length, 0) / answers.length;
      
      const detailedAnswers = answers.filter(answer => answer.length > 50).length;
      const shortAnswers = answers.filter(answer => answer.length < 20).length;
      
      // Более строгий анализ для summary
      const veryShortAnswers = answers.filter(answer => answer.length < 10).length;
      
      const shortPercentage = totalAnswers > 0 ? (shortAnswers / totalAnswers) * 100 : 0;
      
      let qualityAssessment = '';
      let recommendations = '';
      
      if (veryShortAnswers > totalAnswers * 0.3 || avgAnswerLength < 10) {
        qualityAssessment = '❌ Критически низкое качество - большинство ответов содержат менее 10 символов, что указывает на несерьезное отношение к собеседованию';
        recommendations = `• Кандидат НЕ готов к следующему этапу интервью
• Рекомендуется пересмотреть заявку или провести предварительный скрининг
• Необходимо выяснить причины столь кратких ответов`;
      } else if (shortPercentage > 50 || avgAnswerLength < 20) {
        qualityAssessment = '⚠️ Низкое качество - слишком много кратких ответов, недостаточно информации для адекватной оценки';
        recommendations = `• Кандидат условно готов к следующему этапу, но требуется дополнительное интервью
• Рекомендуется провести более детальное собеседование
• Необходимо оценить мотивацию и готовность к более серьезному подходу`;
      } else if (shortPercentage > 30 || avgAnswerLength < 40) {
        qualityAssessment = '🔍 Базовое качество - ответы краткие, но содержат минимально необходимую информацию';
        recommendations = `• Кандидат может перейти к следующему этапу с оговорками
• Рекомендуется техническое интервью для проверки практических навыков
• Стоит обратить внимание на коммуникативные навыки`;
      } else if (detailedAnswers >= 7) {
        qualityAssessment = '✅ Отличное качество - кандидат предоставил подробные, содержательные ответы на большинство вопросов';
        recommendations = `• Кандидат готов к следующему этапу интервью
• Рекомендуется техническое интервью для проверки hard skills
• Показал высокий уровень коммуникативных навыков и самопрезентации`;
      } else {
        qualityAssessment = '✅ Хорошее качество - кандидат дал содержательные ответы, демонстрируя заинтересованность';
        recommendations = `• Кандидат готов к следующему этапу интервью
• Рекомендуется техническое интервью для проверки hard skills
• Показал средний уровень коммуникативных навыков`;
      }

      const summary = `📊 **Анализ интервью завершен**

**Статистика интервью:**
• Отвечено на ${totalAnswers} из 10 вопросов
• Средняя длина ответа: ${Math.round(avgAnswerLength)} символов
• Детальных ответов (50+ символов): ${detailedAnswers} (${Math.round((detailedAnswers / totalAnswers) * 100)}%)
• Кратких ответов (менее 20 символов): ${shortAnswers} (${Math.round((shortAnswers / totalAnswers) * 100)}%)
• Очень кратких ответов (менее 10 символов): ${veryShortAnswers} (${Math.round((veryShortAnswers / totalAnswers) * 100)}%)
• Общее время: ${Math.round(sessionState.totalTimeSpent / 60)} минут

**Анализ качества ответов:**
${qualityAssessment}

**Рекомендации:**
${recommendations}`;

      return { summary };
    },

    // Получить информацию о сессии
    async getSession(token: string): Promise<any> {
      await delay(300);
      
      let sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        console.warn(`⚠️ Mock: Session ${token} not found for getSession, creating fallback session`);
        sessionState = createFallbackSession(token);
      }
      
      return {
        token,
        status: 'active',
        questions_completed: sessionState.currentQuestionIndex,
        total_questions: 10,
        total_time: sessionState.totalTimeSpent
      };
    },
    
    // Очистить данные сессии (для предотвращения утечек памяти)
    async cleanupSession(token: string): Promise<void> {
      if (mockSessionStates.has(token)) {
        mockSessionStates.delete(token);
        console.log(`🧹 Mock: Session ${token} cleaned up`);
      }
    }
  };
}

if (!USE_MOCK) {
  console.log(`🌐 HRBot: Using Real API at ${API_BASE_URL}`);
} 