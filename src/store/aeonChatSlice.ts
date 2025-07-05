import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
} = aeonChatSlice.actions;

export default aeonChatSlice.reducer;

// Селекторы
export const selectAeonMessages = (state: any) => state.aeonChat.messages;
export const selectAeonLoading = (state: any) => state.aeonChat.isLoading;
export const selectAeonError = (state: any) => state.aeonChat.error;
export const selectAeonSessionStartTime = (state: any) => state.aeonChat.sessionStartTime; 