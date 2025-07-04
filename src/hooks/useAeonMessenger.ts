import { useState, useEffect, useCallback } from 'react';
import {
  getChats,
  getChatMessages,
  sendMessage,
  createChat,
  getCurrentUser,
  markAllMessagesAsRead,
  addMemberToChat as apiAddMemberToChat,
  removeMemberFromChat as apiRemoveMemberFromChat,
  checkAndAcceptInvitations,
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

  // Автоматическое обновление
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Проверяем доступность Telegram WebApp
  const checkTelegramWebApp = useCallback(() => {
    return initTelegramWebApp();
  }, []);

  // Загружаем информацию о пользователе
  const loadCurrentUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setCurrentUser(userData);
      setError(null);
      setIsAuthError(false);
      
      // Проверяем и активируем приглашения при входе
      try {
        await checkAndAcceptInvitations();
      } catch (err) {
        console.log('No pending invitations or error checking invitations:', err);
      }
    } catch (err: any) {
      console.error('Error loading current user:', err);
      
      // Проверяем, является ли это ошибкой авторизации
      if (err.response?.status === 401 || err.isAuthError) {
        setIsAuthError(true);
        setError('Приложение должно быть открыто из Telegram для корректной работы');
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
      
      if (err.response?.status === 401 || err.isAuthError) {
        setIsAuthError(true);
        setError('Приложение должно быть открыто из Telegram для корректной работы');
      } else if (err.isTimeoutError || err.code === 'ECONNABORTED') {
        setError('⏱️ Сервер запускается, попробуйте обновить страницу через минуту');
      } else if (err.isServiceError || err.response?.status === 503) {
        setError('🔧 Сервер временно недоступен, попробуйте через несколько минут');
      } else {
        setError('Ошибка загрузки чатов');
      }
    } finally {
      setLoading(false);
    }
  }, [checkTelegramWebApp]);

  // Автоматическое обновление списка чатов (без лоадера)
  const refreshChats = useCallback(async () => {
    try {
      const chatsData = await getChats();
      setChats(chatsData);
      setError(null);
      setIsAuthError(false);
    } catch (err: any) {
      console.error('Error refreshing chats:', err);
      // В автообновлении не показываем ошибки так агрессивно
      if (err.response?.status === 401 || err.isAuthError) {
        setIsAuthError(true);
      }
    }
  }, []);

  // Загружаем сообщения чата
  const loadMessages = useCallback(async (chatId: number) => {
    try {
      setMessagesLoading(true);
      const messagesData = await getChatMessages(chatId);
      setMessages(messagesData.messages);
      
      // Устанавливаем ID последнего сообщения для отслеживания новых
      if (messagesData.messages.length > 0) {
        const lastMsg = messagesData.messages[messagesData.messages.length - 1];
        setLastMessageId(lastMsg.id);
      }
      
      setError(null);
      setIsAuthError(false);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      
      if (err.response?.status === 401 || err.isAuthError) {
        setIsAuthError(true);
        setError('Приложение должно быть открыто из Telegram для корректной работы');
      } else if (err.isTimeoutError || err.code === 'ECONNABORTED') {
        setError('⏱️ Сервер запускается, сообщения загрузятся автоматически');
      } else if (err.isServiceError || err.response?.status === 503) {
        setError('🔧 Сервер временно недоступен, попробуйте обновить чат');
      } else {
        setError('Ошибка загрузки сообщений');
      }
    } finally {
      setMessagesLoading(false);
    }
  }, [checkTelegramWebApp]);

  // Проверка новых сообщений в текущем чате
  const checkNewMessages = useCallback(async (chatId: number) => {
    try {
      const messagesData = await getChatMessages(chatId);
      const newMessages = messagesData.messages;
      
      if (newMessages.length > 0) {
        const latestMessageId = newMessages[newMessages.length - 1].id;
        
        // Если есть новые сообщения
        if (lastMessageId && latestMessageId > lastMessageId) {
          setMessages(newMessages);
          setLastMessageId(latestMessageId);
          setHasNewMessages(true);
          
          // Обновляем список чатов для показа нового последнего сообщения
          refreshChats();
          
          // Звуковое уведомление (если доступно в Telegram WebApp)
          try {
            if (window.Telegram?.WebApp?.HapticFeedback) {
              window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
          } catch (err) {
            console.log('Haptic feedback not available');
          }
          
          console.log('🔄 Получены новые сообщения');
        }
      }
    } catch (err: any) {
      console.error('Error checking new messages:', err);
      // Не показываем ошибки для фоновых проверок
    }
  }, [lastMessageId, refreshChats]);

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
      setLastMessageId(newMessage.id);
      
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
        setLastMessageId(mockMessage.id);
      }
    }
  }, [currentUser]);

  // Создаем новый чат
  const createNewChat = useCallback(async (title: string, memberIds: number[] = [], memberUsernames: string[] = []) => {
    try {
      const chatData: AeonChatCreate = {
        title,
        chat_type: (memberIds.length + memberUsernames.length) > 0 ? 'group' : 'private',
        member_ids: memberIds,
      };

      const newChat = await createChat(chatData);
      
      // Отправляем приглашения по username, если есть
      if (memberUsernames.length > 0) {
        const { inviteMemberByUsername } = await import('../services/aeonMessengerApi');
        for (const username of memberUsernames) {
          try {
            await inviteMemberByUsername(newChat.id, username);
          } catch (err) {
            console.error(`Error inviting ${username}:`, err);
          }
        }
      }
      
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
    setLastMessageId(null);
    setHasNewMessages(false);
    loadMessages(chat.id);
    
    // Отмечаем все сообщения как прочитанные
    if (chat.unread_count > 0) {
      markAllMessagesAsRead(chat.id).catch(err => 
        console.error('Error marking messages as read:', err)
      );
    }
  }, [loadMessages]);

  // Очищаем текущий чат (возврат к списку чатов)
  const clearCurrentChat = useCallback(() => {
    setCurrentChat(null);
    setMessages([]);
    setLastMessageId(null);
    setHasNewMessages(false);
  }, []);

  // Сброс флага новых сообщений
  const markMessagesAsViewed = useCallback(() => {
    setHasNewMessages(false);
  }, []);

  // Загружаем подробную информацию о чате
  const loadChatInfo = useCallback(async (chatId: number) => {
    try {
      const { getChat } = await import('../services/aeonMessengerApi');
      const chatInfo = await getChat(chatId);
      return chatInfo;
    } catch (err) {
      console.error('Error loading chat info:', err);
      setError('Ошибка загрузки информации о чате');
      throw err;
    }
  }, []);

  // Добавляем участника в чат
  const addMemberToChat = useCallback(async (chatId: number, userId: number) => {
    try {
      await apiAddMemberToChat(chatId, userId);
      setError(null);
      
      // Обновляем информацию о чате после добавления участника
      if (currentChat && currentChat.id === chatId) {
        setTimeout(() => refreshChats(), 1000);
      }
    } catch (err) {
      console.error('Error adding member to chat:', err);
      setError('Ошибка добавления участника');
      throw err;
    }
  }, [currentChat, refreshChats]);

  // Удаляем участника из чата
  const removeMemberFromChat = useCallback(async (chatId: number, userId: number) => {
    try {
      await apiRemoveMemberFromChat(chatId, userId);
      setError(null);
      
      // Обновляем информацию о чате после удаления участника
      if (currentChat && currentChat.id === chatId) {
        setTimeout(() => refreshChats(), 1000);
      }
    } catch (err) {
      console.error('Error removing member from chat:', err);
      setError('Ошибка удаления участника');
      throw err;
    }
  }, [currentChat, refreshChats]);

  // Инициализация
  useEffect(() => {
    checkTelegramWebApp();
    loadCurrentUser();
    loadChats();
  }, [checkTelegramWebApp, loadCurrentUser, loadChats]);

  // Автоматическое обновление списка чатов каждые 30 секунд
  useEffect(() => {
    if (!autoRefresh || isAuthError) return;
    
    const chatsInterval = setInterval(() => {
      refreshChats();
    }, 30000); // 30 секунд
    
    return () => clearInterval(chatsInterval);
  }, [autoRefresh, isAuthError, refreshChats]);

  // Автоматическое обновление сообщений в текущем чате каждые 5 секунд
  useEffect(() => {
    if (!autoRefresh || !currentChat || isAuthError) return;
    
    const messagesInterval = setInterval(() => {
      checkNewMessages(currentChat.id);
    }, 5000); // 5 секунд
    
    return () => clearInterval(messagesInterval);
  }, [autoRefresh, currentChat, isAuthError, checkNewMessages]);

  // Проверка приглашений каждые 2 минуты
  useEffect(() => {
    if (!autoRefresh || isAuthError) return;
    
    const invitationsInterval = setInterval(async () => {
      try {
        await checkAndAcceptInvitations();
        // Если были приняты приглашения, обновляем список чатов
        refreshChats();
      } catch (err) {
        console.log('No new invitations or error:', err);
      }
    }, 120000); // 2 минуты
    
    return () => clearInterval(invitationsInterval);
  }, [autoRefresh, isAuthError, refreshChats]);

  return {
    chats,
    currentChat,
    messages,
    currentUser,
    loading,
    messagesLoading,
    error,
    isAuthError,
    autoRefresh,
    setAutoRefresh,
    hasNewMessages,
    markMessagesAsViewed,
    sendNewMessage,
    createNewChat,
    selectChat,
    refreshChats,
    refreshMessages: () => currentChat && loadMessages(currentChat.id),
    loadChatInfo,
    addMemberToChat,
    removeMemberFromChat,
    clearCurrentChat,
    checkNewMessages: () => currentChat && checkNewMessages(currentChat.id),
  };
}; 