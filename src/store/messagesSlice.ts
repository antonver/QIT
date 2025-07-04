import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AeonMessage } from '../types/api';

interface MessagesState {
  // Хранилище сообщений по чатам: { [chatId]: messages[] }
  messagesByChat: { [chatId: number]: AeonMessage[] };
  // Время последнего обновления для каждого чата
  lastUpdated: { [chatId: number]: number };
  // Статус загрузки для каждого чата
  loading: { [chatId: number]: boolean };
  // Ошибки для каждого чата
  errors: { [chatId: number]: string | null };
  // ID последнего сообщения для каждого чата (для проверки новых сообщений)
  lastMessageId: { [chatId: number]: number };
  // Время создания сессии для автоочистки
  sessionStartTime: number;
  // Флаг активности сессии
  isSessionActive: boolean;
}

const initialState: MessagesState = {
  messagesByChat: {},
  lastUpdated: {},
  loading: {},
  errors: {},
  lastMessageId: {},
  sessionStartTime: Date.now(),
  isSessionActive: true,
};

// Функция для проверки валидности сессии (например, не старше 24 часов)
const isSessionValid = (sessionStartTime: number): boolean => {
  const maxSessionAge = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
  return Date.now() - sessionStartTime < maxSessionAge;
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // Инициализация новой сессии
    initSession: (state) => {
      state.sessionStartTime = Date.now();
      state.isSessionActive = true;
      // Очищаем старые данные если сессия истекла
      if (!isSessionValid(state.sessionStartTime)) {
        state.messagesByChat = {};
        state.lastUpdated = {};
        state.loading = {};
        state.errors = {};
        state.lastMessageId = {};
      }
    },

    // Завершение сессии
    endSession: (state) => {
      state.isSessionActive = false;
    },

    // Устанавливаем статус загрузки для чата
    setLoading: (state, action: PayloadAction<{ chatId: number; loading: boolean }>) => {
      const { chatId, loading } = action.payload;
      state.loading[chatId] = loading;
    },

    // Устанавливаем ошибку для чата
    setError: (state, action: PayloadAction<{ chatId: number; error: string | null }>) => {
      const { chatId, error } = action.payload;
      state.errors[chatId] = error;
    },

    // Загружаем сообщения для чата (полная замена)
    loadMessages: (state, action: PayloadAction<{ chatId: number; messages: AeonMessage[] }>) => {
      const { chatId, messages } = action.payload;
      
      // Проверяем валидность сессии
      if (!state.isSessionActive || !isSessionValid(state.sessionStartTime)) {
        return;
      }
      
      state.messagesByChat[chatId] = messages;
      state.lastUpdated[chatId] = Date.now();
      state.loading[chatId] = false;
      state.errors[chatId] = null;
      
      // Обновляем ID последнего сообщения
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        state.lastMessageId[chatId] = lastMessage.id;
      }
    },

    // Добавляем новое сообщение в конец
    addMessage: (state, action: PayloadAction<{ chatId: number; message: AeonMessage }>) => {
      const { chatId, message } = action.payload;
      
      // Проверяем валидность сессии
      if (!state.isSessionActive || !isSessionValid(state.sessionStartTime)) {
        return;
      }
      
      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
      }
      
      // Проверяем, что сообщение еще не добавлено
      const exists = state.messagesByChat[chatId].some(m => m.id === message.id);
      if (!exists) {
        state.messagesByChat[chatId].push(message);
        state.lastMessageId[chatId] = message.id;
        state.lastUpdated[chatId] = Date.now();
      }
    },

    // Добавляем несколько новых сообщений
    addMessages: (state, action: PayloadAction<{ chatId: number; messages: AeonMessage[] }>) => {
      const { chatId, messages } = action.payload;
      
      // Проверяем валидность сессии
      if (!state.isSessionActive || !isSessionValid(state.sessionStartTime)) {
        return;
      }
      
      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
      }
      
      // Добавляем только новые сообщения
      const existingIds = new Set(state.messagesByChat[chatId].map(m => m.id));
      const newMessages = messages.filter(m => !existingIds.has(m.id));
      
      if (newMessages.length > 0) {
        state.messagesByChat[chatId].push(...newMessages);
        
        // Обновляем ID последнего сообщения
        const lastMessage = newMessages[newMessages.length - 1];
        state.lastMessageId[chatId] = lastMessage.id;
        state.lastUpdated[chatId] = Date.now();
      }
    },

    // Обновляем существующее сообщение
    updateMessage: (state, action: PayloadAction<{ chatId: number; messageId: number; updates: Partial<AeonMessage> }>) => {
      const { chatId, messageId, updates } = action.payload;
      
      if (state.messagesByChat[chatId]) {
        const messageIndex = state.messagesByChat[chatId].findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          state.messagesByChat[chatId][messageIndex] = {
            ...state.messagesByChat[chatId][messageIndex],
            ...updates,
          };
          state.lastUpdated[chatId] = Date.now();
        }
      }
    },

    // Удаляем сообщение
    deleteMessage: (state, action: PayloadAction<{ chatId: number; messageId: number }>) => {
      const { chatId, messageId } = action.payload;
      
      if (state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = state.messagesByChat[chatId].filter(m => m.id !== messageId);
        state.lastUpdated[chatId] = Date.now();
      }
    },

    // Очищаем сообщения для чата
    clearMessages: (state, action: PayloadAction<{ chatId: number }>) => {
      const { chatId } = action.payload;
      delete state.messagesByChat[chatId];
      delete state.lastUpdated[chatId];
      delete state.loading[chatId];
      delete state.errors[chatId];
      delete state.lastMessageId[chatId];
    },

    // Очищаем все сообщения (при выходе из приложения)
    clearAllMessages: (state) => {
      state.messagesByChat = {};
      state.lastUpdated = {};
      state.loading = {};
      state.errors = {};
      state.lastMessageId = {};
      state.isSessionActive = false;
    },

    // Оптимизация: удаляем старые сообщения для экономии памяти
    optimizeStorage: (state, action: PayloadAction<{ maxMessagesPerChat?: number; maxChatAge?: number }>) => {
      const { maxMessagesPerChat = 1000, maxChatAge = 12 * 60 * 60 * 1000 } = action.payload; // 12 часов
      const now = Date.now();
      
      Object.keys(state.messagesByChat).forEach(chatIdStr => {
        const chatId = parseInt(chatIdStr);
        const lastUpdated = state.lastUpdated[chatId] || 0;
        
        // Удаляем чаты которые не обновлялись долго
        if (now - lastUpdated > maxChatAge) {
          delete state.messagesByChat[chatId];
          delete state.lastUpdated[chatId];
          delete state.loading[chatId];
          delete state.errors[chatId];
          delete state.lastMessageId[chatId];
        } else {
          // Ограничиваем количество сообщений в чате
          const messages = state.messagesByChat[chatId];
          if (messages && messages.length > maxMessagesPerChat) {
            state.messagesByChat[chatId] = messages.slice(-maxMessagesPerChat);
          }
        }
      });
    },

    // Устанавливаем время последнего обновления
    setLastUpdated: (state, action: PayloadAction<{ chatId: number; timestamp: number }>) => {
      const { chatId, timestamp } = action.payload;
      state.lastUpdated[chatId] = timestamp;
    },

    // Устанавливаем ID последнего сообщения
    setLastMessageId: (state, action: PayloadAction<{ chatId: number; messageId: number }>) => {
      const { chatId, messageId } = action.payload;
      state.lastMessageId[chatId] = messageId;
    },
  },
});

export const {
  initSession,
  endSession,
  setLoading,
  setError,
  loadMessages,
  addMessage,
  addMessages,
  updateMessage,
  deleteMessage,
  clearMessages,
  clearAllMessages,
  optimizeStorage,
  setLastUpdated,
  setLastMessageId,
} = messagesSlice.actions;

export default messagesSlice.reducer;

// Селекторы
export const selectMessagesByChat = (state: any, chatId: number) => 
  state.messages.messagesByChat[chatId] || [];

export const selectMessagesLoading = (state: any, chatId: number) => 
  state.messages.loading[chatId] || false;

export const selectMessagesError = (state: any, chatId: number) => 
  state.messages.errors[chatId] || null;

export const selectLastMessageId = (state: any, chatId: number) => 
  state.messages.lastMessageId[chatId] || 0;

export const selectLastUpdated = (state: any, chatId: number) => 
  state.messages.lastUpdated[chatId] || 0;

export const selectSessionInfo = (state: any) => ({
  sessionStartTime: state.messages.sessionStartTime,
  isSessionActive: state.messages.isSessionActive,
  isValid: isSessionValid(state.messages.sessionStartTime)
});

export const selectMessagesCount = (state: any) => 
  Object.values(state.messages.messagesByChat).reduce((total: number, messages: any) => 
    total + (messages?.length || 0), 0); 