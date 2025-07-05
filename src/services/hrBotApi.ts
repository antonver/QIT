// API сервис для HRBot
const API_BASE_URL = 'https://aeon-hr-interview-c0238c9f48f7.herokuapp.com';

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
  question: string;
  type: string;
  question_id?: string;
  [key: string]: any;
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
  async getNextQuestion(token: string, data: any = {}): Promise<Question | null> {
    const sessionState = sessionStates.get(token);
    
    if (!sessionState) {
      throw new Error('Session not found');
    }
    
    // Проверяем, достигли ли мы лимита вопросов
    if (sessionState.questionIndex >= sessionState.totalQuestions) {
      return null;
    }
    
    try {
      // Передаем информацию о текущем состоянии сессии
      const requestData = {
        ...data,
        current_question_index: sessionState.questionIndex,
        asked_questions: Array.from(sessionState.askedQuestions),
        answers: sessionState.answers
      };
      
      const response = await this.request<ApiQuestionResponse>(`/aeon/question/${token}`, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      
      // Преобразуем ответ API в наш формат
      if (response && response.question) {
        // Используем стабильный ID на основе индекса вопроса
        const questionId = response.question_id || `q_${sessionState.questionIndex + 1}`;
        
        // Проверяем, не задавали ли мы уже этот вопрос
        if (sessionState.askedQuestions.has(questionId)) {
          console.warn('Question already asked:', questionId);
          return null;
        }
        
        const question: Question = {
          id: questionId,
          text: response.question,
          type: 'text' // Все вопросы открытые
        };
        
        // Добавляем вопрос в список заданных
        sessionState.askedQuestions.add(questionId);
        
        return question;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting next question:', error);
      // Если нет больше вопросов, API может вернуть ошибку
      return null;
    }
  }

  // Отправить ответ - POST /session/{token}/answer
  async submitAnswer(token: string, answer: Answer): Promise<AnswerResponse> {
    const sessionState = sessionStates.get(token);
    
    if (sessionState && answer.question_id) {
      // Сохраняем ответ в состоянии сессии
      sessionState.answers[answer.question_id] = answer.answer.toString();
      sessionState.questionIndex++;
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
        const result = await realAPI.createSession();
        return result;
      } catch (error) {
        console.warn('Real API failed, using mock:', error);
        return mockAPI.createSession();
      }
    },
    
    async getNextQuestion(token: string, data: any = {}): Promise<Question | null> {
      if (token.startsWith('mock_')) return mockAPI.getNextQuestion(token, data);
      
      try {
        const result = await realAPI.getNextQuestion(token, data);
        return result;
      } catch (error) {
        console.warn('Real API failed, using mock:', error);
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
  }>();

  const delay = (ms: number = 1000): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        answers: {}
      });
      
      return {
        token,
        created_at: new Date().toISOString(),
        status: 'active'
      };
    },

    // Получить следующий вопрос
    async getNextQuestion(token: string, _data: any = {}): Promise<Question | null> {
      await delay(600);
      
      const sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        throw new Error('Session not found');
      }
      
      if (sessionState.currentQuestionIndex >= MOCK_QUESTIONS.length) {
        return null;
      }
      
      const question = MOCK_QUESTIONS[sessionState.currentQuestionIndex];
      sessionState.questionStartTime = Date.now();
      
      return { ...question };
    },

    // Отправить ответ
    async submitAnswer(token: string, answer: Answer): Promise<AnswerResponse> {
      await delay(500);
      
      const sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        throw new Error('Session not found');
      }
      
      const timeSpent = Math.floor((Date.now() - sessionState.questionStartTime) / 1000);
      sessionState.totalTimeSpent += timeSpent;
      
      // Сохраняем ответ
      if (answer.question_id) {
        sessionState.answers[answer.question_id] = answer.answer.toString();
      }
      
      sessionState.currentQuestionIndex++;
      
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
      
      const sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        throw new Error('Session not found');
      }
      
      const result = {
        success: true,
        session_id: token,
        questions_answered: sessionState.currentQuestionIndex,
        total_time: sessionState.totalTimeSpent,
        completed_at: new Date().toISOString()
      };
      
      return result;
    },

    // Получить результат
    async getResult(token: string): Promise<ResultResponse> {
      await delay(400);
      
      const sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        throw new Error('Session not found');
      }
      
      return {
        session_id: token,
        total_time: sessionState.totalTimeSpent,
        questions_answered: sessionState.currentQuestionIndex,
        completion_rate: (sessionState.currentQuestionIndex / 10) * 100,
        average_time_per_question: Math.floor(sessionState.totalTimeSpent / sessionState.currentQuestionIndex || 1),
        performance_score: Math.floor(Math.random() * 40) + 60,
        created_at: new Date(sessionState.sessionStartTime).toISOString(),
        completed_at: new Date().toISOString()
      };
    },

    // Сгенерировать глиф с улучшенным анализом
    async generateGlyph(token: string): Promise<GlyphResponse> {
      await delay(1500);
      
      const sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        throw new Error('Session not found');
      }
      
      // Анализируем качество ответов
      const answers = Object.values(sessionState.answers);
      const avgAnswerLength = answers.length > 0 ? 
        answers.reduce((sum, answer) => sum + answer.length, 0) / answers.length : 0;
      
      const detailedAnswers = answers.filter(answer => answer.length > 50).length;
      const detailedPercentage = answers.length > 0 ? (detailedAnswers / answers.length) * 100 : 0;
      
      let glyph = '';
      let profile = '';
      
      if (detailedPercentage >= 70) {
        glyph = '🎯 Лидер-Аналитик';
        profile = `Кандидат продемонстрировал исключительную глубину мышления и аналитические способности. Средняя длина ответов: ${Math.round(avgAnswerLength)} символов. Показывает высокий уровень самрефлексии, стратегического мышления и готовности к лидерству. Отлично структурирует мысли и может детально объяснить свои решения.`;
      } else if (detailedPercentage >= 50) {
        glyph = '⚡ Потенциал-Рост';
        profile = `Кандидат показал хорошие коммуникативные навыки и потенциал для развития. Средняя длина ответов: ${Math.round(avgAnswerLength)} символов. Демонстрирует готовность к обучению, адаптивность и базовые профессиональные компетенции. Может эффективно работать в команде и брать на себя ответственность.`;
      } else {
        glyph = '🚀 Стартер-Энтузиаст';
        profile = `Кандидат показал энтузиазм и базовые навыки. Средняя длина ответов: ${Math.round(avgAnswerLength)} символов. Демонстрирует мотивацию к работе и готовность к профессиональному росту. Подходит для позиций начального уровня с хорошими перспективами развития.`;
      }
      
      return { glyph, profile };
    },

    // Получить сводку с детальным анализом
    async getSummary(token: string): Promise<{ summary: string }> {
      await delay(1200);
      
      const sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        throw new Error('Session not found');
      }
      
      const answers = Object.values(sessionState.answers);
      const totalAnswers = answers.length;
      const avgAnswerLength = answers.length > 0 ? 
        answers.reduce((sum, answer) => sum + answer.length, 0) / answers.length : 0;
      
      const detailedAnswers = answers.filter(answer => answer.length > 50).length;
      const shortAnswers = answers.filter(answer => answer.length < 20).length;
      
      const summary = `📊 **Анализ интервью завершен**

**Статистика интервью:**
• Отвечено на ${totalAnswers} из 10 вопросов
• Средняя длина ответа: ${Math.round(avgAnswerLength)} символов
• Детальных ответов: ${detailedAnswers} (${Math.round((detailedAnswers / totalAnswers) * 100)}%)
• Кратких ответов: ${shortAnswers} (${Math.round((shortAnswers / totalAnswers) * 100)}%)
• Общее время: ${Math.round(sessionState.totalTimeSpent / 60)} минут

**Анализ качества ответов:**
${detailedAnswers >= 7 ? 
  '✅ Отличное качество - кандидат предоставил подробные, thoughtful ответы на большинство вопросов' :
  detailedAnswers >= 5 ? 
    '✅ Хорошее качество - кандидат дал содержательные ответы на половину вопросов' :
    '⚠️ Базовое качество - ответы краткие, рекомендуется более детальное собеседование'
}

**Рекомендации:**
• Кандидат готов к следующему этапу интервью
• Рекомендуется техническое интервью для проверки hard skills
• Показал ${avgAnswerLength > 100 ? 'высокий' : avgAnswerLength > 50 ? 'средний' : 'базовый'} уровень коммуникативных навыков`;

      return { summary };
    },

    // Получить информацию о сессии
    async getSession(token: string): Promise<any> {
      await delay(300);
      
      const sessionState = mockSessionStates.get(token);
      if (!sessionState) {
        throw new Error('Session not found');
      }
      
      return {
        token,
        status: 'active',
        questions_completed: sessionState.currentQuestionIndex,
        total_questions: 10,
        total_time: sessionState.totalTimeSpent
      };
    }
  };
}

if (!USE_MOCK) {
  console.log(`🌐 HRBot: Using Real API at ${API_BASE_URL}`);
} 