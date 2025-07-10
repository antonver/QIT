import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AeonCurrentUser } from '../types/api';

export interface AeonChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface AeonChatState {
  messages: AeonChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionStartTime: number;
  currentUser: AeonCurrentUser | null;
  isUserLoading: boolean;
  userError: string | null;
}

const initialState: AeonChatState = {
  messages: [
    {
      id: 1,
      text: 'Добро пожаловать в ÆON! Как дела?',
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ],
  isLoading: false,
  error: null,
  sessionStartTime: Date.now(),
  currentUser: null,
  isUserLoading: false,
  userError: null,
};

const aeonChatSlice = createSlice({
  name: 'aeonChat',
  initialState,
  reducers: {
    // Добавляем новое сообщение
    addMessage: (state, action: PayloadAction<AeonChatMessage>) => {
      state.messages.push(action.payload);
    },

    // Добавляем сообщение пользователя
    addUserMessage: (state, action: PayloadAction<string>) => {
      const userMessage: AeonChatMessage = {
        id: state.messages.length + 1,
        text: action.payload,
        isUser: true,
        timestamp: new Date().toISOString(),
      };
      state.messages.push(userMessage);
    },

    // Добавляем сообщение бота
    addBotMessage: (state, action: PayloadAction<string>) => {
      const botMessage: AeonChatMessage = {
        id: state.messages.length + 1,
        text: action.payload,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      state.messages.push(botMessage);
    },

    // Устанавливаем статус загрузки
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Устанавливаем ошибку
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Очищаем все сообщения
    clearMessages: (state) => {
      state.messages = [
        {
          id: 1,
          text: 'Добро пожаловать в ÆON! Как дела?',
          isUser: false,
          timestamp: new Date().toISOString(),
        },
      ];
    },

    // Инициализируем новую сессию
    initSession: (state) => {
      state.sessionStartTime = Date.now();
      state.error = null;
    },

    setCurrentUser: (state, action: PayloadAction<AeonCurrentUser>) => {
      state.currentUser = action.payload;
      state.userError = null;
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isUserLoading = action.payload;
    },
    setUserError: (state, action: PayloadAction<string>) => {
      state.userError = action.payload;
      state.isUserLoading = false;
    },
    clearUserError: (state) => {
      state.userError = null;
    },
  },
});

export const {
  addMessage,
  addUserMessage,
  addBotMessage,
  setLoading,
  setError,
  clearMessages,
  initSession,
  setCurrentUser,
  setUserLoading,
  setUserError,
  clearUserError,
} = aeonChatSlice.actions;

export default aeonChatSlice.reducer;

// Селекторы
export const selectAeonMessages = (state: any) => state.aeonChat.messages;
export const selectAeonLoading = (state: any) => state.aeonChat.isLoading;
export const selectAeonError = (state: any) => state.aeonChat.error;
export const selectAeonSessionStartTime = (state: any) => state.aeonChat.sessionStartTime; 