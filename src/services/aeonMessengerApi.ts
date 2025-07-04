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

// Debug function to log API configuration
const logApiConfig = () => {
  console.log('=== Aeon Messenger API Configuration ===');
  console.log('VITE_CHAT_URL:', import.meta.env.VITE_CHAT_URL);
  console.log('Base URL:', import.meta.env.VITE_CHAT_URL || 'https://aeon-messenger-app-09faae856b73.herokuapp.com');
  console.log('Environment:', import.meta.env.MODE);
  console.log('=========================================');
};

// Log configuration on module load
logApiConfig();

// Create axios instance for Aeon Messenger API
const aeonApi = axios.create({
  baseURL: import.meta.env.VITE_CHAT_URL || 'https://aeon-messenger-app-09faae856b73.herokuapp.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    
    if (initData) {
      config.headers['x-telegram-init-data'] = initData;
      console.log('✅ Auth header attached');
    } else {
      console.warn('❌ No auth data available - running in development mode');
      console.warn('❌ This request will likely fail with 401 error');
      // Не добавляем заголовок авторизации если данных нет
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
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Request Headers:', error.config?.headers);
    console.error('======================');
    
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
    
    throw error;
  }
);

// Chat API methods
export const getChats = async (): Promise<AeonChatList[]> => {
  const response = await aeonApi.get<AeonChatList[]>('/api/v1/chats/');
  return response.data;
};

export const createChat = async (chatData: AeonChatCreate): Promise<AeonChat> => {
  const response = await aeonApi.post<AeonChat>('/api/v1/chats/', chatData);
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
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await aeonApi.post<{ media_url: string }>('/api/v1/messages/upload-media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const forwardMessage = async (messageId: number, chatId: number): Promise<void> => {
  await aeonApi.post(`/api/v1/messages/forward?message_id=${messageId}&chat_id=${chatId}`);
};

// User API methods
export const getCurrentUser = async (): Promise<AeonCurrentUser> => {
  const response = await aeonApi.get<AeonCurrentUser>('/api/v1/me');
  return response.data;
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

export default aeonApi; 