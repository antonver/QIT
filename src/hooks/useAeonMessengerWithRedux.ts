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
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  initSession,
  endSession,
  loadMessages as loadMessagesAction,
  addMessage,
  addMessages,
  setLoading as setMessagesLoading,
  setError as setMessagesError,
  optimizeStorage,
  selectMessagesByChat,
  selectMessagesLoading,
  selectMessagesError,
  selectLastMessageId,
  selectMessagesCount,
} from '../store/messagesSlice';
import type {
  AeonChatList,
  AeonMessage,
  AeonMessageCreate,
  AeonChatCreate,
  AeonCurrentUser,
} from '../types/api';

export const useAeonMessengerWithRedux = () => {
  const dispatch = useAppDispatch();
  
  // Локальное состояние для чатов и пользователя
  const [chats, setChats] = useState<AeonChatList[]>([]);
  const [currentChat, setCurrentChat] = useState<AeonChatList | null>(null);
  const [currentUser, setCurrentUser] = useState<AeonCurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  // Автоматическое обновление
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Получаем сообщения из Redux для текущего чата
  const messages = useAppSelector(state => 
    currentChat ? selectMessagesByChat(state, currentChat.id) : []
  );
  const messagesLoading = useAppSelector(state => 
    currentChat ? selectMessagesLoading(state, currentChat.id) : false
  );
  const messagesError = useAppSelector(state => 
    currentChat ? selectMessagesError(state, currentChat.id) : null
  );
  const lastMessageId = useAppSelector(state => 
    currentChat ? selectLastMessageId(state, currentChat.id) : 0
  );
  const totalMessagesCount = useAppSelector(selectMessagesCount);

  // Проверяем доступность Telegram WebApp
  const checkTelegramWebApp = useCallback(() => {
    return initTelegramWebApp();
  }, []);

  // Инициализируем сессию при запуске
  useEffect(() => {
    dispatch(initSession());
    console.log('📱 Сессия инициализирована');
  }, [dispatch]);

  // Периодическая оптимизация хранилища
  useEffect(() => {
    const optimizeInterval = setInterval(() => {
      if (totalMessagesCount > 5000) { // Если сообщений больше 5000
        dispatch(optimizeStorage({ maxMessagesPerChat: 500, maxChatAge: 6 * 60 * 60 * 1000 })); // 6 часов
        console.log('🧹 Хранилище оптимизировано, сообщений было:', totalMessagesCount);
      }
    }, 10 * 60 * 1000); // Каждые 10 минут

    return () => clearInterval(optimizeInterval);
  }, [dispatch, totalMessagesCount]);

  // Завершаем сессию при закрытии приложения
  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch(endSession());
      console.log('📱 Сессия завершена');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Страница скрыта - можем оптимизировать
        dispatch(optimizeStorage({ maxMessagesPerChat: 1000 }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);

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
      } catch (err: any) {
        // 404 ошибка означает что endpoint не существует - это нормально
        if (err.response?.status === 404) {
          console.log('Check invitations endpoint not available (404) - skipping');
        } else {
          console.log('No pending invitations or error checking invitations:', err);
        }
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
      // Сортируем чаты по времени последнего сообщения (самые новые сверху)
      const sortedChats = chatsData.sort((a, b) => {
        if (!a.last_message_time && !b.last_message_time) return 0;
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });
      setChats(sortedChats);
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
  }, []);

  // Автоматическое обновление списка чатов (без лоадера)
  const refreshChats = useCallback(async () => {
    try {
      const chatsData = await getChats();
      const sortedChats = chatsData.sort((a, b) => {
        if (!a.last_message_time && !b.last_message_time) return 0;
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });
      setChats(sortedChats);
      setError(null);
      setIsAuthError(false);
    } catch (err: any) {
      console.error('Error refreshing chats:', err);
      if (err.response?.status === 401 || err.isAuthError) {
        setIsAuthError(true);
      }
    }
  }, []);

  // Загружаем сообщения чата из Redux или API
  const loadMessages = useCallback(async (chatId: number) => {
    try {
      dispatch(setMessagesLoading({ chatId, loading: true }));
      const messagesData = await getChatMessages(chatId);
      
      // Сохраняем сообщения в Redux
      dispatch(loadMessagesAction({ chatId, messages: messagesData.messages }));
      
      setError(null);
      setIsAuthError(false);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      
      dispatch(setMessagesError({ chatId, error: err.message }));
      
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
      dispatch(setMessagesLoading({ chatId, loading: false }));
    }
  }, [dispatch]);

  // Проверка новых сообщений в текущем чате
  const checkNewMessages = useCallback(async (chatId: number) => {
    try {
      const messagesData = await getChatMessages(chatId);
      const newMessages = messagesData.messages;
      
      if (newMessages.length > 0) {
        const latestMessageId = newMessages[newMessages.length - 1].id;
        
        // Если есть новые сообщения
        if (lastMessageId && latestMessageId > lastMessageId) {
          // Находим только новые сообщения
          const currentMessages = messages;
          const existingIds = new Set(currentMessages.map((m: AeonMessage) => m.id));
          const onlyNewMessages = newMessages.filter(m => !existingIds.has(m.id));
          
          if (onlyNewMessages.length > 0) {
            dispatch(addMessages({ chatId, messages: onlyNewMessages }));
            setHasNewMessages(true);
            
            // Обновляем список чатов
            refreshChats();
            
            // Haptic feedback
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
      }
    } catch (err: any) {
      console.error('Error checking new messages:', err);
    }
  }, [lastMessageId, messages, dispatch, refreshChats]);

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
      
      // Добавляем сообщение в Redux
      dispatch(addMessage({ chatId, message: newMessage }));
      
      // Обновляем список чатов
      setChats(prev => {
        const updatedChats = prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, last_message: text.trim(), last_message_time: new Date().toISOString() }
            : chat
        );
        
        return updatedChats.sort((a, b) => {
          if (!a.last_message_time && !b.last_message_time) return 0;
          if (!a.last_message_time) return 1;
          if (!b.last_message_time) return -1;
          
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });
      });
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
        
        dispatch(addMessage({ chatId, message: mockMessage }));
        
        // Обновляем список чатов
        setChats(prev => {
          const updatedChats = prev.map(chat => 
            chat.id === chatId 
              ? { ...chat, last_message: text.trim(), last_message_time: new Date().toISOString() }
              : chat
          );
          
          return updatedChats.sort((a, b) => {
            if (!a.last_message_time && !b.last_message_time) return 0;
            if (!a.last_message_time) return 1;
            if (!b.last_message_time) return -1;
            
            return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
          });
        });
      }
    }
  }, [currentUser, dispatch]);

  // Создаем новый чат
  const createNewChat = useCallback(async (title: string, memberIds: number[] = [], memberUsernames: string[] = [], photoUrl?: string) => {
    try {
      const chatData: AeonChatCreate = {
        title,
        chat_type: (memberIds.length + memberUsernames.length) > 0 ? 'group' : 'private',
        member_ids: memberIds,
        // Добавляем photo_url только если он действительно есть
        ...(photoUrl && { photo_url: photoUrl }),
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
    if (isAuthError) return;
    
    const chatsInterval = setInterval(() => {
      refreshChats();
    }, 30000);
    
    return () => clearInterval(chatsInterval);
  }, [isAuthError, refreshChats]);

  // Автоматическое обновление сообщений в текущем чате каждые 5 секунд
  useEffect(() => {
    if (!currentChat || isAuthError) return;
    
    const messagesInterval = setInterval(() => {
      checkNewMessages(currentChat.id);
    }, 5000);
    
    return () => clearInterval(messagesInterval);
  }, [currentChat, isAuthError, checkNewMessages]);

  // Проверка приглашений каждые 2 минуты
  useEffect(() => {
    if (isAuthError) return;
    
    const invitationsInterval = setInterval(async () => {
      try {
        await checkAndAcceptInvitations();
        refreshChats();
      } catch (err: any) {
        // 404 ошибка означает что endpoint не существует - это нормально
        if (err.response?.status === 404) {
          console.log('Check invitations endpoint not available (404) - skipping');
        } else {
          console.log('No new invitations or error:', err);
        }
      }
    }, 120000);
    
    return () => clearInterval(invitationsInterval);
  }, [isAuthError, refreshChats]);

  return {
    chats,
    currentChat,
    messages,
    currentUser,
    loading,
    messagesLoading,
    error: error || messagesError,
    isAuthError,

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