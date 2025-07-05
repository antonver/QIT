import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from './messagesSlice';
import aeonChatReducer from './aeonChatSlice';

export const store = configureStore({
  reducer: {
    messages: messagesReducer,
    aeonChat: aeonChatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 