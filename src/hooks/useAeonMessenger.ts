import { useState, useEffect, useCallback } from 'react';
import {
  getChats,
  getChatMessages,
  sendMessage,
  createChat,
  getCurrentUser,
  markAllMessagesAsRead,
} from '../services/aeonMessengerApi';
import { initTelegramWebApp, isTelegramWebApp, getTelegramUser } from '../utils/telegram';
import type {
  AeonChatList,
  AeonMessage,
  AeonMessageCreate,
  AeonChatCreate,
  AeonCurrentUser,
} from '../types/api';

export const useAeonMessenger = () => {
  const [chats, setChats] = useState<AeonChatList[]>([]);
  const [currentChat, setCurrentChat] = useState<AeonChatList | null>(null);
  const [messages, setMessages] = useState<AeonMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<AeonCurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  // Проверяем доступность Telegram WebApp
  const checkTelegramWebApp = useCallback(() => {
    return initTelegramWebApp();
  }, []);

  // Загружаем информацию о пользователе
  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setIsAuthError(false);
    } catch (err: any) {
      console.error('Error loading current user:', err);
      
      // Проверяем, является ли это ошибкой авторизации
      if (err.response?.status === 401) {
        setIsAuthError(true);
        setError('Ошибка авторизации. Пожалуйста, перезапустите приложение из Telegram.');
      } else {
        setError('Ошибка загрузки данных пользователя');
      }
      
      // Используем мок данные для разработки
      if (!isTelegramWebApp()) {
        const telegramUser = getTelegramUser();
        if (telegramUser) {
          setCurrentUser({
            id: telegramUser.id,
            telegram_id: telegramUser.id,
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            profile_photo_url: telegramUser.photo_url,
          });
        } else {
          setCurrentUser({
            id: 123456789,
            telegram_id: 123456789,
            username: 'testuser',
            first_name: 'Test',
            last_name: 'User',
            profile_photo_url: undefined,
          });
        }
        setIsAuthError(false);
      }
    }
  }, [checkTelegramWebApp]);

  // Загружаем список чатов
  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const chatsData = await getChats();
      setChats(chatsData);
      setError(null);
      setIsAuthError(false);
    } catch (err: any) {
      console.error('Error loading chats:', err);
      
      if (err.response?.status === 401) {
        setIsAuthError(true);
        setError('Ошибка авторизации. Пожалуйста, перезапустите приложение из Telegram.');
      } else {
        setError('Ошибка загрузки чатов');
      }
      
      // Используем мок данные для разработки
      if (!isTelegramWebApp()) {
        setChats([
          {
            id: 1,
            title: 'ÆON Assistant',
            chat_type: 'private',
            photo_url: undefined,
            last_message: 'Добро пожаловать в ÆON Messenger!',
            last_message_time: new Date().toISOString(),
            unread_count: 0,
          },
        ]);
        setIsAuthError(false);
      }
    } finally {
      setLoading(false);
    }
  }, [checkTelegramWebApp]);

  // Загружаем сообщения чата
  const loadMessages = useCallback(async (chatId: number) => {
    try {
      setMessagesLoading(true);
      const messagesData = await getChatMessages(chatId);
      setMessages(messagesData.messages);
      setError(null);
      setIsAuthError(false);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      
      if (err.response?.status === 401) {
        setIsAuthError(true);
        setError('Ошибка авторизации. Пожалуйста, перезапустите приложение из Telegram.');
      } else {
        setError('Ошибка загрузки сообщений');
      }
      
      // Используем мок данные для разработки
      if (!isTelegramWebApp()) {
        setMessages([
          {
            id: 1,
            text: 'Добро пожаловать в ÆON Messenger! Это новая версия чата с полной функциональностью.',
            message_type: 'text',
            chat_id: chatId,
            sender_id: 1,
            sender: {
              id: 1,
              telegram_id: 1,
              username: 'aeon_bot',
              first_name: 'ÆON',
              last_name: 'Assistant',
              profile_photo_url: undefined,
            },
            is_edited: false,
            is_deleted: false,
            read_by: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        setIsAuthError(false);
      }
    } finally {
      setMessagesLoading(false);
    }
  }, [checkTelegramWebApp]);

  // Отправляем сообщение
  const sendNewMessage = useCallback(async (chatId: number, text: string) => {
    if (!text.trim()) return;

    try {
      const messageData: AeonMessageCreate = {
        text: text.trim(),
        message_type: 'text',
        chat_id: chatId,
      };

      const newMessage = await sendMessage(messageData);
      setMessages(prev => [...prev, newMessage]);
      
      // Обновляем список чатов
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, last_message: text.trim(), last_message_time: new Date().toISOString() }
          : chat
      ));
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Ошибка отправки сообщения');
      
      // Добавляем сообщение локально для разработки
      if (currentUser) {
        const mockMessage: AeonMessage = {
          id: Date.now(),
          text: text.trim(),
          message_type: 'text',
          chat_id: chatId,
          sender_id: currentUser.id,
          sender: {
            id: currentUser.id,
            telegram_id: currentUser.telegram_id,
            username: currentUser.username,
            first_name: currentUser.first_name,
            last_name: currentUser.last_name,
            profile_photo_url: currentUser.profile_photo_url,
          },
          is_edited: false,
          is_deleted: false,
          read_by: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, mockMessage]);
      }
    }
  }, [currentUser]);

  // Создаем новый чат
  const createNewChat = useCallback(async (title: string, memberIds: number[] = []) => {
    try {
      const chatData: AeonChatCreate = {
        title,
        chat_type: 'private',
        member_ids: memberIds,
      };

      const newChat = await createChat(chatData);
      
      // Обновляем список чатов
      await loadChats();
      
      // Выбираем новый чат
      const newChatListItem: AeonChatList = {
        id: newChat.id,
        title: newChat.title,
        chat_type: newChat.chat_type,
        photo_url: newChat.photo_url,
        last_message: undefined,
        last_message_time: undefined,
        unread_count: 0,
      };
      
      setCurrentChat(newChatListItem);
      await loadMessages(newChat.id);
      
      return newChat;
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Ошибка создания чата');
      throw err;
    }
  }, [loadChats, loadMessages]);

  // Выбираем чат
  const selectChat = useCallback((chat: AeonChatList) => {
    setCurrentChat(chat);
    loadMessages(chat.id);
    
    // Отмечаем все сообщения как прочитанные
    if (chat.unread_count > 0) {
      markAllMessagesAsRead(chat.id).catch(err => 
        console.error('Error marking messages as read:', err)
      );
    }
  }, [loadMessages]);

  // Инициализация
  useEffect(() => {
    checkTelegramWebApp();
    loadCurrentUser();
    loadChats();
  }, [checkTelegramWebApp, loadCurrentUser, loadChats]);

  return {
    chats,
    currentChat,
    messages,
    currentUser,
    loading,
    messagesLoading,
    error,
    isAuthError,
    sendNewMessage,
    createNewChat,
    selectChat,
    refreshChats: loadChats,
    refreshMessages: () => currentChat && loadMessages(currentChat.id),
  };
}; 