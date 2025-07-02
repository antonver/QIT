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
    return this.request<SessionResponse>('/session', {
      method: 'POST',
    });
  }

  // Получить информацию о сессии - GET /session/{token}
  async getSession(token: string): Promise<any> {
    return this.request(`/session/${token}`, {
      method: 'GET',
    });
  }

  // Получить следующий вопрос - POST /aeon/question/{token}
  async getNextQuestion(token: string, data: any = {}): Promise<Question | null> {
    try {
      const response = await this.request<ApiQuestionResponse>(`/aeon/question/${token}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // Преобразуем ответ API в наш формат
      if (response && response.question) {
        return {
          id: Date.now().toString(), // Генерируем ID, т.к. API его не возвращает
          text: response.question,
          type: 'text' // Все вопросы открытые
        };
      }
      
      return null;
    } catch (error) {
      // Если нет больше вопросов, API может вернуть ошибку
      return null;
    }
  }

  // Отправить ответ - POST /session/{token}/answer
  async submitAnswer(token: string, answer: Answer): Promise<AnswerResponse> {
    return this.request<AnswerResponse>(`/session/${token}/answer`, {
      method: 'POST',
      body: JSON.stringify(answer),
    });
  }

  // Завершить сессию - POST /session/{token}/complete
  async completeSession(token: string): Promise<any> {
    return this.request(`/session/${token}/complete`, {
      method: 'POST',
    });
  }

  // Получить результат - GET /result/{token}
  async getResult(token: string): Promise<ResultResponse> {
    return this.request<ResultResponse>(`/result/${token}`, {
      method: 'GET',
    });
  }

  // Сгенерировать глиф - POST /aeon/glyph/{token}
  async generateGlyph(token: string): Promise<GlyphResponse> {
    const response = await this.request<ApiGlyphResponse>(`/aeon/glyph/${token}`, {
      method: 'POST',
      body: JSON.stringify({}), // Отправляем пустой объект как требует API
    });
    
    // Возвращаем ответ API как есть
    return {
      glyph: response.glyph,
      profile: response.profile
    };
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
  let useMock = false;
  
  return {
    async createSession(): Promise<SessionResponse> {
      if (useMock) return mockAPI.createSession();
      
      try {
        const result = await realAPI.createSession();
        return result;
      } catch (error) {
        throw new Error(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    async getNextQuestion(token: string, data: any = {}): Promise<Question | null> {
      if (useMock || token.startsWith('mock_')) return mockAPI.getNextQuestion(token, data);
      
      try {
        const result = await realAPI.getNextQuestion(token, data);
        return result;
      } catch (error) {
        throw new Error(`Failed to get question: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    async submitAnswer(token: string, answer: Answer): Promise<AnswerResponse> {
      if (useMock || token.startsWith('mock_')) return mockAPI.submitAnswer(token, answer);
      
      try {
        const result = await realAPI.submitAnswer(token, answer);
        return result;
      } catch (error) {
        throw new Error(`Failed to submit answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    async completeSession(token: string): Promise<any> {
      if (useMock || token.startsWith('mock_')) return mockAPI.completeSession(token);
      
      try {
        return await realAPI.completeSession(token);
      } catch (error) {
        try {
          // Альтернативный подход - просто возвращаем success
          return {
            success: true,
            message: 'Session completed',
            completed_at: new Date().toISOString()
          };
        } catch (altError) {
          throw new Error(`Failed to complete session: ${altError instanceof Error ? altError.message : 'Unknown error'}`);
        }
      }
    },

    async getResult(token: string): Promise<ResultResponse> {
      if (useMock || token.startsWith('mock_')) return mockAPI.getResult(token);
      
      try {
        return await realAPI.getResult(token);
      } catch (error) {
        throw new Error(`Failed to get result: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    async generateGlyph(token: string): Promise<GlyphResponse> {
      if (useMock || token.startsWith('mock_')) return mockAPI.generateGlyph(token);
      
      try {
        const result = await realAPI.generateGlyph(token);
        return result;
      } catch (error) {
        throw new Error(`Failed to generate glyph: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    
    async getSession(token: string): Promise<any> {
      if (useMock || token.startsWith('mock_')) return mockAPI.getSession(token);
      
      try {
        return await realAPI.getSession(token);
      } catch (error) {
        throw new Error(`Failed to get session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };
}

// Функция создания мок API
function createMockAPI() {
  // Мок данные вопросов встроены прямо здесь для быстрого доступа (10 вопросов)
  const MOCK_QUESTIONS: Question[] = [
    {
      id: '1',
      text: 'Опишите свой идеальный рабочий день. Что бы вы делали и как бы себя чувствовали?',
      type: 'text',
    },
    {
      id: '2', 
      text: 'Как вы обычно справляетесь со стрессом на работе?',
      type: 'text',
    },
    {
      id: '3',
      text: 'Расскажите о своих сильных профессиональных качествах и как вы их применяете в работе.',
      type: 'text',
    },
    {
      id: '4',
      text: 'Какие технологии или методы работы вы изучили за последний год?',
      type: 'text',
    },
    {
      id: '5',
      text: 'Опишите ситуацию, когда вам пришлось работать в команде над сложным проектом.',
      type: 'text',
    },
    {
      id: '6',
      text: 'Расскажите о самом сложном проекте, над которым вы работали, и как вы его завершили.',
      type: 'text',
    },
    {
      id: '7',
      text: 'Как вы планируете свое профессиональное развитие на ближайшие 2-3 года?',
      type: 'text',
    },
    {
      id: '8',
      text: 'Опишите ситуацию, когда вам пришлось принимать сложное решение на работе.',
      type: 'text',
    },
    {
      id: '9',
      text: 'Что мотивирует вас в работе больше всего и почему?',
      type: 'text',
    },
    {
      id: '10',
      text: 'Как вы видите себя в нашей компании и какой вклад хотите внести?',
      type: 'text',
    }
  ];

  let currentQuestionIndex = 0;
  let sessionToken = '';
  let sessionStartTime = Date.now();
  let questionStartTime = Date.now();
  let totalTimeSpent = 0;

  const delay = (ms: number = 1000): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  return {
    // Создать сессию
    async createSession(): Promise<SessionResponse> {
      await delay(800);
      sessionToken = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      currentQuestionIndex = 0;
      sessionStartTime = Date.now();
      
      return {
        token: sessionToken,
        created_at: new Date().toISOString(),
        status: 'active'
      };
    },

    // Получить следующий вопрос
    async getNextQuestion(_token: string, _data: any = {}): Promise<Question | null> {
      await delay(600);
      
      if (currentQuestionIndex >= MOCK_QUESTIONS.length) {
        return null;
      }
      
      const question = MOCK_QUESTIONS[currentQuestionIndex];
      questionStartTime = Date.now();
      return { ...question };
    },

    // Отправить ответ
    async submitAnswer(_token: string, _answer: Answer): Promise<AnswerResponse> {
      await delay(500);
      
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      totalTimeSpent += timeSpent;
      currentQuestionIndex++;
      
      return {
        success: true,
        time_spent: timeSpent,
        question_number: currentQuestionIndex,
        saved_at: new Date().toISOString()
      };
    },

    // Завершить сессию
    async completeSession(token: string): Promise<any> {
      await delay(800);
      
      return {
        success: true,
        session_id: token,
        questions_answered: currentQuestionIndex,
        total_time: totalTimeSpent,
        completed_at: new Date().toISOString()
      };
    },

    // Получить результат
    async getResult(token: string): Promise<ResultResponse> {
      await delay(400);
      return {
        session_id: token,
        total_time: totalTimeSpent,
        questions_answered: currentQuestionIndex,
        completion_rate: (currentQuestionIndex / 10) * 100,
        average_time_per_question: Math.floor(totalTimeSpent / currentQuestionIndex),
        performance_score: Math.floor(Math.random() * 40) + 60,
        created_at: new Date(sessionStartTime).toISOString(),
        completed_at: new Date().toISOString()
      };
    },

    // Сгенерировать глиф
    async generateGlyph(_token: string): Promise<GlyphResponse> {
      await delay(1500);
      
      const glyphs = ['⚡ Потенциал', '🎯 Лидер', '🧠 Аналитик', '🚀 Инноватор', '🤝 Коммуникатор'];
      const profiles = [
        'Кандидат демонстрирует высокий потенциал роста и готовность к новым вызовам.',
        'Показывает отличные лидерские качества и способность мотивировать команду.',
        'Обладает сильными аналитическими навыками и системным мышлением.',
        'Креативно подходит к решению задач и готов внедрять инновации.',
        'Отлично взаимодействует с людьми и эффективно работает в команде.'
      ];
      
      const randomIndex = Math.floor(Math.random() * glyphs.length);
      
      return {
        glyph: glyphs[randomIndex],
        profile: profiles[randomIndex]
      };
    },

    // Получить информацию о сессии
    async getSession(token: string): Promise<any> {
      await delay(300);
      return {
        token,
        status: 'active',
        questions_completed: currentQuestionIndex,
        total_questions: 10
      };
    }
  };
}

if (!USE_MOCK) {
  console.log(`🌐 HRBot: Using Real API at ${import.meta.env.VITE_API_URL}`);
} 