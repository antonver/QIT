import axios from 'axios';
import { getTelegramInitData } from '../utils/telegram';
import type {
  AeonChat,
  AeonChatList,
  AeonChatCreate,
  AeonChatUpdate,
  AeonMessage,
  AeonMessageList,
  AeonMessageCreate,
  AeonMessageUpdate,
  AeonCurrentUser,
} from '../types/api';
import type { User } from '../types/api';

// Debug function to log API configuration
const logApiConfig = () => {
  console.log('=== Aeon Messenger API Configuration ===');
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('VITE_CHAT_URL:', import.meta.env.VITE_CHAT_URL);
  console.log('Base URL:', import.meta.env.VITE_API_URL || 'https://aeon-backend-2892-d50dfbe26b14.herokuapp.com');
  console.log('Environment:', import.meta.env.MODE);
  console.log('🆕 BACKEND URL: https://aeon-backend-2892-d50dfbe26b14.herokuapp.com');
  console.log('🔍 CORS Origin Check:');
  console.log('   - Current origin:', window.location.origin);
  console.log('   - Expected origins:', [
    'https://qit-antonvers-projects.vercel.app',
    'https://qit-antonver.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ]);
  console.log('=========================================');
};

// Log configuration on module load
logApiConfig();

// Create axios instance for Aeon Messenger API
const aeonApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://aeon-backend-2892-d50dfbe26b14.herokuapp.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Функция для retry запросов
const retryRequest = async <T>(
  request: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await request();
    } catch (error: any) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      
      // Не повторяем для ошибок авторизации
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }
      
      // Последняя попытка - выбрасываем ошибку
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Ждем перед следующей попыткой
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
};

// Request interceptor to add Telegram init data
aeonApi.interceptors.request.use(
  (config) => {
    const initData = getTelegramInitData();
    console.log('=== Aeon API Request Debug ===');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('Base URL:', config.baseURL);
    console.log('Init Data Length:', initData ? initData.length : 0);
    console.log('Init Data Preview:', initData ? initData.substring(0, 100) + '...' : 'No data');
    
    // Проверяем, что мы в Telegram WebApp
    const isTelegram = typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp);
    if (!isTelegram) {
      console.warn('❌ Приложение не запущено в Telegram WebApp');
      console.warn('❌ Запросы к API будут отклонены');
      
      // Создаем ошибку для предотвращения запроса
      const error = new Error('Приложение должно быть открыто из Telegram WebApp');
      error.name = 'TelegramWebAppRequired';
      throw error;
    }
    
    if (initData) {
      config.headers['x-telegram-init-data'] = initData;
      console.log('✅ Auth header attached');
    } else {
      console.warn('❌ No auth data available - running in development mode');
      console.warn('❌ Adding fallback auth header for development');
      // Добавляем fallback заголовок для режима разработки
      config.headers['x-telegram-init-data'] = 'test_data';
    }
    console.log('===============================');
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
aeonApi.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('=== Aeon API Error ===');
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method);
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Request Headers:', error.config?.headers);
    console.error('======================');
    
    // Обработка ошибки отсутствия Telegram WebApp
    if (error.name === 'TelegramWebAppRequired') {
      console.error('❌ Telegram WebApp Required Error');
      console.error('❌ Application must be opened from Telegram WebApp');
      
      const enhancedError = {
        ...error,
        message: 'Приложение должно быть открыто из Telegram WebApp',
        isTelegramWebAppError: true,
        response: {
          status: 403,
          data: {
            error: 'Приложение должно быть открыто из Telegram WebApp'
          }
        }
      };
      
      throw enhancedError;
    }
    
    // Специальная обработка CORS ошибок
    if (error.message && error.message.includes('CORS')) {
      console.error('❌ CORS Error Detected');
      console.error('❌ Possible reasons:');
      console.error('   1. Backend CORS configuration issue');
      console.error('   2. Origin not allowed by server');
      console.error('   3. Missing CORS headers in response');
      console.error('❌ Current origin:', window.location.origin);
      console.error('❌ Backend URL:', error.config?.baseURL);
      
      const enhancedError = {
        ...error,
        message: 'CORS error - check backend configuration',
        isCorsError: true,
        response: {
          ...error.response,
          data: {
            ...error.response?.data,
            error: 'CORS ошибка - проверьте конфигурацию сервера'
          }
        }
      };
      
      throw enhancedError;
    }
    
    // Обработка ошибки 405 - Method Not Allowed
    if (error.response?.status === 405) {
      console.error('❌ Method Not Allowed (405)');
      console.error('❌ Possible reasons:');
      console.error(`   1. HTTP method ${error.config?.method?.toUpperCase()} is not supported for URL: ${error.config?.url}`);
      console.error('   2. Server endpoint configuration issue');
      console.error('   3. API endpoint does not exist or is disabled');
      console.error('❌ Solution: Check API documentation and server configuration');
      
      // Создаем более информативную ошибку
      const enhancedError = {
        ...error,
        message: `HTTP method ${error.config?.method?.toUpperCase()} not allowed for this endpoint`,
        isMethodError: true,
        response: {
          ...error.response,
          data: {
            ...error.response?.data,
            error: 'HTTP метод не поддерживается для данного endpoint'
          }
        }
      };
      
      throw enhancedError;
    }
    
    // Enhanced error messages
    if (error.response?.status === 401) {
      console.error('❌ Authorization failed');
      console.error('❌ Possible reasons:');
      console.error('   1. App is not running inside Telegram WebApp');
      console.error('   2. Invalid or expired Telegram init data');
      console.error('   3. Server-side authorization issue');
      console.error('❌ Solution: Open this app from Telegram bot/mini app');
      
      // Создаем более информативную ошибку
      const enhancedError = {
        ...error,
        message: 'Authorization failed - app must be opened from Telegram',
        isAuthError: true,
        response: {
          ...error.response,
          data: {
            ...error.response?.data,
            error: 'Приложение должно быть открыто из Telegram'
          }
        }
      };
      
      throw enhancedError;
    }
    
    // Обработка timeout ошибок
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('❌ Request timeout');
      console.error('❌ Possible reasons:');
      console.error('   1. Server is starting up (cold start)');
      console.error('   2. Server is overloaded');
      console.error('   3. Network connectivity issues');
      console.error('❌ Solution: Try again in a moment');
      
      const enhancedError = {
        ...error,
        message: 'Server is starting up, please try again in a moment',
        isTimeoutError: true,
      };
      
      throw enhancedError;
    }
    
    // Обработка 503 ошибок
    if (error.response?.status === 503) {
      console.error('❌ Service Unavailable');
      console.error('❌ Server is temporarily unavailable');
      
      const enhancedError = {
        ...error,
        message: 'Server is temporarily unavailable, please try again',
        isServiceError: true,
      };
      
      throw enhancedError;
    }
    
    throw error;
  }
);

// Chat API methods
export const getChats = async (): Promise<AeonChatList[]> => {
  const response = await retryRequest(() => aeonApi.get<AeonChatList[]>('/api/v1/chats/'));
  return response.data;
};

export const createChat = async (chatData: AeonChatCreate): Promise<AeonChat> => {
  const response = await retryRequest(() => 
    aeonApi.post<AeonChat>('/api/v1/chats/', chatData, {
      timeout: 60000, // 60 секунд для создания чата
    })
  );
  return response.data;
};

export const getChat = async (chatId: number): Promise<AeonChat> => {
  const response = await aeonApi.get<AeonChat>(`/api/v1/chats/${chatId}`);
  return response.data;
};

export const updateChat = async (chatId: number, chatData: AeonChatUpdate): Promise<AeonChat> => {
  const response = await aeonApi.put<AeonChat>(`/api/v1/chats/${chatId}`, chatData);
  return response.data;
};

export const deleteChat = async (chatId: number): Promise<void> => {
  await aeonApi.delete(`/api/v1/chats/${chatId}`);
};

export const addMemberToChat = async (chatId: number, userId: number): Promise<void> => {
  await aeonApi.post(`/api/v1/chats/${chatId}/members/${userId}`);
};

export const removeMemberFromChat = async (chatId: number, userId: number): Promise<void> => {
  await aeonApi.delete(`/api/v1/chats/${chatId}/members/${userId}`);
};

// Message API methods
export const getChatMessages = async (
  chatId: number,
  page: number = 1,
  perPage: number = 50
): Promise<AeonMessageList> => {
  const response = await aeonApi.get<AeonMessageList>(
    `/api/v1/messages/chat/${chatId}?page=${page}&per_page=${perPage}`
  );
  return response.data;
};

export const sendMessage = async (messageData: AeonMessageCreate): Promise<AeonMessage> => {
  const response = await aeonApi.post<AeonMessage>('/api/v1/messages/', messageData);
  return response.data;
};

export const editMessage = async (messageId: number, messageData: AeonMessageUpdate): Promise<AeonMessage> => {
  const response = await aeonApi.put<AeonMessage>(`/api/v1/messages/${messageId}`, messageData);
  return response.data;
};

export const deleteMessage = async (messageId: number): Promise<void> => {
  await aeonApi.delete(`/api/v1/messages/${messageId}`);
};

export const markMessageAsRead = async (messageId: number): Promise<void> => {
  await aeonApi.post(`/api/v1/messages/${messageId}/read`);
};

export const markAllMessagesAsRead = async (chatId: number): Promise<void> => {
  await aeonApi.post(`/api/v1/messages/chat/${chatId}/read-all`);
};

export const uploadMedia = async (file: File): Promise<{ media_url: string }> => {
  console.log('uploadMedia: Starting upload for file:', file.name, file.size, file.type);
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await aeonApi.post<{ media_url: string }>('/api/v1/messages/upload-media', formData, {
      headers: {
        // Не устанавливаем Content-Type - пусть браузер сам установит с boundary
      },
      timeout: 60000, // 60 секунд для загрузки файлов
    });
    
    console.log('uploadMedia: Upload successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('uploadMedia: Upload failed:', error);
    
    // Более детальная информация об ошибке
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    }
    
    throw error;
  }
};

export const forwardMessage = async (messageId: number, chatId: number): Promise<void> => {
  await aeonApi.post(`/api/v1/messages/forward?message_id=${messageId}&chat_id=${chatId}`);
};

// User API methods
export const getCurrentUser = async (): Promise<AeonCurrentUser> => {
  try {
    const response = await aeonApi.get<AeonCurrentUser>('/api/v1/me');
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка при получении данных пользователя:', error);
    
    // Не возвращаем fallback данные - пусть ошибка пробрасывается дальше
    // для правильной обработки в компонентах
    throw error;
  }
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  const response = await aeonApi.get<{ status: string }>('/api/v1/health');
  return response.data;
};

// Debug functions for diagnosing server issues
export const debugAuthConfig = async (): Promise<any> => {
  const response = await aeonApi.get('/api/v1/debug/auth');
  return response.data;
};

export const debugValidateTelegramData = async (initData: string): Promise<any> => {
  const response = await aeonApi.post('/api/v1/debug/validate-telegram-data', initData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const inviteMemberByUsername = async (chatId: number, username: string): Promise<{message: string, status: string}> => {
  const response = await aeonApi.post(`/api/v1/chats/${chatId}/invite-by-username`, {
    username: username
  });
  return response.data;
};

// Функция для проверки и активации приглашений при входе
export const checkAndAcceptInvitations = async (): Promise<User> => {
  try {
    const response = await aeonApi.post<User>('/api/v1/users/check-invitations');
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка при проверке приглашений:', error);
    
    // Не возвращаем fallback данные - пусть ошибка пробрасывается дальше
    // для правильной обработки в компонентах
    throw error;
  }
};

// Admin API functions
export const createQuality = async (quality: { name: string }): Promise<{ id: number; name: string }> => {
  const response = await aeonApi.post('/api/v1/admin/qualities', quality);
  return response.data;
};

export const getQualities = async (): Promise<{ id: number; name: string }[]> => {
  const response = await aeonApi.get('/api/v1/admin/qualities');
  return response.data;
};

export const updateQuality = async (qualityId: number, quality: { name: string }): Promise<{ id: number; name: string }> => {
  const response = await aeonApi.put(`/api/v1/admin/qualities/${qualityId}`, quality);
  return response.data;
};

export const deleteQuality = async (qualityId: number): Promise<{ message: string }> => {
  const response = await aeonApi.delete(`/api/v1/admin/qualities/${qualityId}`);
  return response.data;
};

export const createPosition = async (position: { title: string; quality_ids: number[] }): Promise<{ id: number; title: string; qualities: any[]; is_active: boolean; created_at: string }> => {
  const response = await aeonApi.post('/api/v1/admin/positions', position);
  return response.data;
};

export const getPositions = async (): Promise<{ id: number; title: string; qualities: any[]; is_active: boolean; created_at: string }[]> => {
  const response = await aeonApi.get('/api/v1/admin/positions');
  return response.data;
};

export const updatePosition = async (positionId: number, position: { title: string; quality_ids: number[] }): Promise<{ id: number; title: string; qualities: any[]; is_active: boolean; created_at: string }> => {
  const response = await aeonApi.put(`/api/v1/admin/positions/${positionId}`, position);
  return response.data;
};

export const deletePosition = async (positionId: number): Promise<{ message: string }> => {
  const response = await aeonApi.delete(`/api/v1/admin/positions/${positionId}`);
  return response.data;
};

export const makeUserAdminByUsername = async (username: string): Promise<{message: string}> => {
  const response = await aeonApi.post('/api/v1/admin/users/make-admin-by-username', { username });
  return response.data;
};

// HR Interview API functions
export const getHrPositions = async (): Promise<{ id: number; title: string; qualities: any[]; is_active: boolean; created_at: string }[]> => {
  const response = await aeonApi.get('/api/v1/hr/positions');
  return response.data;
};

export const createInterview = async (interviewData: { position_id: number }): Promise<{
  id: number;
  position_id: number;
  questions: Array<{
    id: number;
    text: string;
    type: 'text' | 'scale' | 'choice';
    category?: string;
    scale?: { min: number; max: number };
  }>;
  answers: { [key: string]: string };
  status: 'in_progress' | 'completed';
  score?: number;
  max_score: number;
}> => {
  const response = await aeonApi.post('/api/v1/hr/interviews', interviewData);
  return response.data;
};

export const submitAnswer = async (interviewId: number, questionIndex: number, answer: string): Promise<{ message: string }> => {
  const response = await aeonApi.put(`/api/v1/hr/interviews/${interviewId}/answer`, {
    question_index: questionIndex,
    answer: answer
  });
  return response.data;
};

export const completeInterview = async (interviewId: number): Promise<{
  score: number;
  max_score: number;
  percentage: number;
}> => {
  const response = await aeonApi.post(`/api/v1/hr/interviews/${interviewId}/complete`);
  return response.data;
};

export default aeonApi; 