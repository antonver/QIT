import axios from 'axios';
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

// Create axios instance for Aeon Messenger API
const aeonApi = axios.create({
  baseURL: import.meta.env.VITE_CHAT_URL || 'https://aeon-messenger-app-09faae856b73.herokuapp.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});



// Get Telegram init data from WebApp or use mock
const getTelegramInitData = () => {
  // Проверяем, есть ли реальный Telegram WebApp
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData;
  }
  
  // Проверяем, есть ли тестовые данные в localStorage (для разработки)
  if (typeof window !== 'undefined' && localStorage.getItem('telegram_init_data')) {
    return localStorage.getItem('telegram_init_data');
  }
  
  // Возвращаем пустую строку, чтобы API мог обработать отсутствие данных
  return '';
};

// Request interceptor to add Telegram init data
aeonApi.interceptors.request.use(
  (config) => {
    const initData = getTelegramInitData();
    if (initData) {
      config.headers['x-telegram-init-data'] = initData;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
aeonApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Aeon Messenger API Error:', error.response?.data || error.message);
    return Promise.reject(error);
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

export default aeonApi; 