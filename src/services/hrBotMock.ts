// Мок-сервис для тестирования HRBot без реального API
import type { SessionResponse, Question, GlyphResponse } from './hrBotApi';

// Мок данные вопросов
const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    text: 'Опишите свой идеальный рабочий день. Что бы вы делали и как бы себя чувствовали?',
    type: 'text',
  },
  {
    id: '2', 
    text: 'Как вы обычно справляетесь со стрессом на работе?',
    type: 'choice',
    options: [
      'Делаю перерывы и медитирую',
      'Обращаюсь за помощью к коллегам',
      'Планирую задачи более детально',
      'Занимаюсь спортом после работы'
    ]
  },
  {
    id: '3',
    text: 'Оцените свою готовность работать в команде от 1 до 10',
    type: 'scale',
  },
  {
    id: '4',
    text: 'Какие технологии вы используете в повседневной работе?',
    type: 'text',
  },
  {
    id: '5',
    text: 'Как часто вы предлагаете новые идеи в своей команде?',
    type: 'choice',
    options: [
      'Каждый день',
      'Несколько раз в неделю', 
      'Раз в неделю',
      'Несколько раз в месяц',
      'Редко'
    ]
  }
];

class HRBotMockAPI {
  private currentQuestionIndex = 0;
  private sessionToken = '';

  // Симуляция задержки сети
  private delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Создать сессию
  async createSession(): Promise<SessionResponse> {
    await this.delay(800);
    
    this.sessionToken = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentQuestionIndex = 0;
    
    return {
      token: this.sessionToken,
      created_at: new Date().toISOString(),
      status: 'active'
    };
  }

  // Получить информацию о сессии
  async getSession(token: string): Promise<any> {
    await this.delay(300);
    
    return {
      token,
      status: 'active',
      questions_completed: this.currentQuestionIndex,
      total_questions: MOCK_QUESTIONS.length
    };
  }

  // Получить следующий вопрос
  async getNextQuestion(token: string, data: any = {}): Promise<Question | null> {
    await this.delay(600);
    
    if (this.currentQuestionIndex >= MOCK_QUESTIONS.length) {
      return null; // Нет больше вопросов
    }
    
    const question = MOCK_QUESTIONS[this.currentQuestionIndex];
    return { ...question };
  }

  // Отправить ответ
  async submitAnswer(token: string, answer: any): Promise<any> {
    await this.delay(500);
    
    this.currentQuestionIndex++;
    
    console.log('📝 Mock answer submitted:', {
      token: token.substring(0, 12) + '...',
      question_id: answer.question_id,
      answer: answer.answer,
      progress: `${this.currentQuestionIndex}/${MOCK_QUESTIONS.length}`
    });
    
    return {
      success: true,
      question_id: answer.question_id,
      saved_at: new Date().toISOString()
    };
  }

  // Завершить сессию
  async completeSession(token: string): Promise<any> {
    await this.delay(800);
    
    console.log('✅ Mock session completed:', {
      token: token.substring(0, 12) + '...',
      questions_answered: this.currentQuestionIndex,
      completion_time: new Date().toISOString()
    });
    
    return {
      success: true,
      session_id: token,
      questions_answered: this.currentQuestionIndex,
      completed_at: new Date().toISOString()
    };
  }

  // Сгенерировать глиф
  async generateGlyph(token: string, data: any = {}): Promise<GlyphResponse> {
    await this.delay(1500); // Более долгая генерация
    
    // Возвращаем URL случайного изображения для демонстрации
    const glyphUrls = [
      'https://via.placeholder.com/300x300/6366f1/ffffff?text=Glyph+A',
      'https://via.placeholder.com/300x300/8b5cf6/ffffff?text=Glyph+B', 
      'https://via.placeholder.com/300x300/06b6d4/ffffff?text=Glyph+C',
      'https://via.placeholder.com/300x300/10b981/ffffff?text=Glyph+D',
      'https://via.placeholder.com/300x300/f59e0b/ffffff?text=Glyph+E',
    ];
    
    const randomGlyph = glyphUrls[Math.floor(Math.random() * glyphUrls.length)];
    
    console.log('🎨 Mock glyph generated:', {
      token: token.substring(0, 12) + '...',
      glyph_url: randomGlyph
    });
    
    return {
      glyph_url: randomGlyph,
      generated_at: new Date().toISOString(),
      style: 'mock_style',
      colors: ['#6366f1', '#8b5cf6', '#06b6d4']
    };
  }

  // Получить результат (опционально)
  async getResult(token: string): Promise<any> {
    await this.delay(400);
    
    return {
      session_id: token,
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      category: 'Mock Category',
      traits: ['Creative', 'Analytical', 'Team Player'],
      recommendations: 'Mock recommendations for development'
    };
  }
}

// Определяем какой API использовать
const USE_MOCK_API = !import.meta.env.VITE_API_URL || import.meta.env.VITE_USE_MOCK_API === 'true';

export const hrBotMockAPI = new HRBotMockAPI();

// Экспортируем информацию о том, используется ли мок
export const isMockMode = USE_MOCK_API; 