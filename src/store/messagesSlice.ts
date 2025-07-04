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
}

const initialState: MessagesState = {
  messagesByChat: {},
  lastUpdated: {},
  loading: {},
  errors: {},
  lastMessageId: {},
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
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
      
      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
      }
      
      // Проверяем, что сообщение еще не добавлено
      const exists = state.messagesByChat[chatId].some(m => m.id === message.id);
      if (!exists) {
        state.messagesByChat[chatId].push(message);
        state.lastMessageId[chatId] = message.id;
      }
    },

    // Добавляем несколько новых сообщений
    addMessages: (state, action: PayloadAction<{ chatId: number; messages: AeonMessage[] }>) => {
      const { chatId, messages } = action.payload;
      
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
        }
      }
    },

    // Удаляем сообщение
    deleteMessage: (state, action: PayloadAction<{ chatId: number; messageId: number }>) => {
      const { chatId, messageId } = action.payload;
      
      if (state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = state.messagesByChat[chatId].filter(m => m.id !== messageId);
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
  setLoading,
  setError,
  loadMessages,
  addMessage,
  addMessages,
  updateMessage,
  deleteMessage,
  clearMessages,
  clearAllMessages,
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