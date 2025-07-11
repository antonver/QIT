// API сервис для HRBot
const API_BASE_URL = 'https://aeon-backend-2892-d50dfbe26b14.herokuapp.com';

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
  question?: string;
  questions?: {
    id: string;
    text: string;
    type: 'text' | 'choice' | 'scale' | 'technical';
    options?: string[];
  }[];
  total_questions?: number;
  remaining_questions?: number;
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
      
      console.log('📥 API: Received response:', response);
      
      // Проверяем, не завершен ли тест
      if (response && response.completed) {
        console.log('🎯 API: Test completed, no more questions');
        return [];
      }
      
      // Обрабатываем ответ в новом формате (одиночный вопрос)
      if (response && response.question) {
        const question: Question = {
          id: `q_${sessionState.questionIndex + 1}`,
          text: response.question,
          type: 'text'
        };
        
        // Обновляем индекс вопроса
        sessionState.questionIndex += 1;
        console.log(`✅ API: Received single question`);
        
        return [question];
      }
      
      // Обрабатываем ответ в старом формате (массив вопросов)
      if (response && response.questions) {
        const questions: Question[] = response.questions.map((q, index) => ({
          id: q.id || `q_${sessionState.questionIndex + index + 1}`,
          text: q.text,
          type: q.type || 'text'
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
      throw error; // Пробрасываем ошибку дальше для обработки в компоненте
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

  // Очистить сессию - DELETE /session/{token}
  async cleanupSession(token: string): Promise<void> {
    try {
      await this.request(`/session/${token}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Failed to cleanup session on server:', error);
    } finally {
      // Очищаем локальное состояние сессии
      sessionStates.delete(token);
    }
  }
}

// Используем только реальный API
export const hrBotAPI = new HRBotAPI();



// Функция создания мок API
// (удалено, мок-режим больше не поддерживается) 