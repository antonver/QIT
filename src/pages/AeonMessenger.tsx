import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import backgroundImage from '../assets/background.png';
import { useAeonMessenger } from '../hooks/useAeonMessenger';
import DiagnosticModal from '../components/DiagnosticModal';
import ChatInfoDialog from '../components/ChatInfoDialog';
import type { AeonMessage } from '../types/api';

const AeonMessenger: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [inputValue, setInputValue] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [newChatMembers, setNewChatMembers] = useState('');
  const [createChatResult, setCreateChatResult] = useState<{type: 'success' | 'info' | 'warning', message: string} | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [showChatInfoDialog, setShowChatInfoDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
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
    loadChatInfo,
    addMemberToChat,
    removeMemberFromChat,
    clearCurrentChat,
    checkNewMessages,
  } = useAeonMessenger();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBackToChats = () => {
    // Очищаем текущий чат для возврата к списку чатов
    clearCurrentChat();
  };

  useEffect(scrollToBottom, [messages]);

  // Сбрасываем флаг новых сообщений при просмотре
  useEffect(() => {
    if (hasNewMessages && messages.length > 0) {
      // Задержка для того, чтобы пользователь успел увидеть новые сообщения
      const timer = setTimeout(() => {
        markMessagesAsViewed();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [hasNewMessages, messages.length, markMessagesAsViewed]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentChat) return;

    try {
      // Сбрасываем флаг новых сообщений при отправке
      markMessagesAsViewed();
      
      await sendNewMessage(currentChat.id, inputValue.trim());
      setInputValue('');
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateNewChat = async () => {
    try {
      setCreatingChat(true);
      setCreateChatResult(null);
      const memberIds: number[] = [];
      const memberUsernames: string[] = [];
      
      // Парсим участников (ID или username)
      if (newChatMembers.trim()) {
        const members = newChatMembers
          .split(',')
          .map(member => member.trim())
          .filter(member => member.length > 0);
        
        members.forEach(member => {
          const parsed = parseInt(member);
          if (!isNaN(parsed) && parsed > 0) {
            // Это числовой ID
            memberIds.push(parsed);
          } else {
            // Это username
            memberUsernames.push(member.replace(/^@/, ''));
          }
        });
      }

      await createNewChat(newChatTitle.trim(), memberIds, memberUsernames);
      
      // Показываем результат создания
      let message = `✅ Чат "${newChatTitle.trim()}" создан успешно!`;
      if (memberIds.length > 0) {
        message += ` Добавлено ${memberIds.length} участников.`;
      }
      if (memberUsernames.length > 0) {
        message += ` Отправлено ${memberUsernames.length} приглашений по username.`;
      }
      
      setCreateChatResult({
        type: 'success',
        message
      });
      
      // Очищаем результат и закрываем диалог через 2 секунды
      setTimeout(() => {
        setCreateChatResult(null);
        setShowNewChatDialog(false);
      }, 2000);
      
      setNewChatTitle('');
      setNewChatMembers('');
    } catch (err) {
      console.error('Error creating chat:', err);
      
      // Обработка разных типов ошибок
      let errorMessage = 'Не удалось создать чат. Попробуйте еще раз.';
      
      if ((err as any)?.isTimeoutError) {
        errorMessage = '⏱️ Сервер запускается, это может занять до минуты. Попробуйте еще раз.';
      } else if ((err as any)?.isServiceError) {
        errorMessage = '🔧 Сервер временно недоступен. Попробуйте через несколько минут.';
      } else if ((err as any)?.isAuthError) {
        errorMessage = '🔐 Ошибка авторизации. Откройте приложение из Telegram.';
      } else if ((err as any)?.code === 'ECONNABORTED') {
        errorMessage = '⏱️ Превышено время ожидания. Сервер может запускаться - попробуйте еще раз.';
      } else if ((err as any)?.response?.status === 503) {
        errorMessage = '🔧 Сервер временно недоступен. Попробуйте через несколько минут.';
      } else if ((err as any)?.response?.status === 500) {
        errorMessage = '⚠️ Ошибка на сервере. Попробуйте еще раз или обратитесь в поддержку.';
      }
      
      setCreateChatResult({
        type: 'warning',
        message: errorMessage
      });
    } finally {
      setCreatingChat(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const getDisplayName = (message: AeonMessage) => {
    const sender = message.sender;
    if (sender.username) return `@${sender.username}`;
    return `${sender.first_name}${sender.last_name ? ` ${sender.last_name}` : ''}`;
  };

  const isMyMessage = (message: AeonMessage) => {
    return currentUser && message.sender_id === currentUser.id;
  };

  if (loading) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(35, 43, 59, 0.95)',
      }}>
        <CircularProgress sx={{ color: '#4a9eff' }} />
      </Box>
    );
  }

  // Показываем ошибку авторизации
  if (isAuthError) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        bgcolor: 'rgba(35, 43, 59, 0.95)',
        p: 3,
      }}>
        <Alert severity="error" sx={{ mb: 3, maxWidth: '600px' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            🚫 Ошибка авторизации
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Проблема с авторизацией на сервере
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Сервер отклоняет авторизацию. Возможные причины:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>На сервере не настроен токен Telegram бота</li>
            <li>Неправильный или истёкший токен бота</li>
            <li>Проблема с подписью данных авторизации</li>
            <li>Приложение запущено не из Telegram</li>
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Что делать:</strong>
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>Нажмите "Диагностика" для подробной проверки</li>
            <li>Убедитесь, что приложение открыто из Telegram</li>
            <li>Если вы администратор - проверьте настройки сервера</li>
            <li>Если проблема повторяется - обратитесь в поддержку</li>
          </Typography>
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => setShowDiagnosticModal(true)}
            sx={{
              bgcolor: '#f44336',
              '&:hover': {
                bgcolor: '#d32f2f',
              },
            }}
          >
            🔬 Диагностика проблемы
          </Button>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              bgcolor: '#4a9eff',
              '&:hover': {
                bgcolor: '#3d8bdb',
              },
            }}
          >
            🔄 Перезагрузить приложение
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.close();
              } else {
                window.history.back();
              }
            }}
            sx={{
              borderColor: '#4a9eff',
              color: '#4a9eff',
              '&:hover': {
                borderColor: '#3d8bdb',
                color: '#3d8bdb',
              },
            }}
          >
            ⬅️ Назад
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      bgcolor: 'rgba(35, 43, 59, 0.95)',
      color: 'white',
      overflow: 'hidden',
    }}>
      {/* Список чатов */}
      <Box sx={{
        width: isMobile ? '100%' : '350px',
        display: isMobile && currentChat ? 'none' : 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(43, 52, 65, 1)',
        bgcolor: 'rgba(35, 43, 59, 0.95)',
      }}>
        {/* Заголовок списка чатов */}
        <Box sx={{
          p: isMobile ? 1 : 2,
          borderBottom: '1px solid rgba(43, 52, 65, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: isMobile ? '52px' : 'auto',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              sx={{ 
                fontWeight: 600,
                fontSize: isMobile ? '1rem' : 'inherit',
              }}
            >
              Чаты
            </Typography>
            {autoRefresh && (
              <Tooltip title="Автообновление включено">
                <CircularProgress 
                  size={isMobile ? 14 : 16} 
                  sx={{ 
                    color: '#4a9eff',
                    animation: 'spin 2s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    }
                  }} 
                />
              </Tooltip>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: isMobile ? 0.5 : 1 }}>
            <Tooltip title={autoRefresh ? "Отключить автообновление" : "Включить автообновление"}>
              <IconButton
                onClick={() => setAutoRefresh(!autoRefresh)}
                sx={{
                  color: autoRefresh ? '#4a9eff' : '#8b95a1',
                  p: isMobile ? 0.75 : 1,
                  '&:hover': {
                    bgcolor: 'rgba(74, 158, 255, 0.1)',
                  },
                }}
              >
                <RefreshIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Создать новый чат">
              <IconButton
                onClick={() => setShowNewChatDialog(true)}
                sx={{
                  bgcolor: '#4a9eff',
                  color: 'white',
                  p: isMobile ? 0.75 : 1,
                  '&:hover': {
                    bgcolor: '#3d8bdb',
                  },
                }}
              >
                <AddIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Список чатов */}
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {chats.map((chat) => (
            <motion.div
              key={chat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ListItem
                disablePadding
                sx={{
                  borderBottom: '1px solid rgba(43, 52, 65, 0.5)',
                }}
              >
                <ListItemButton
                  selected={currentChat?.id === chat.id}
                  onClick={() => selectChat(chat)}
                  sx={{
                    py: isMobile ? 1.25 : 1.5,
                    px: isMobile ? 1 : 2,
                    bgcolor: currentChat?.id === chat.id ? 'rgba(74, 158, 255, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: currentChat?.id === chat.id ? 'rgba(74, 158, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    },
                    minHeight: isMobile ? 64 : 'auto',
                  }}
                >
                <ListItemAvatar>
                  <Badge
                    badgeContent={chat.unread_count}
                    color="error"
                    invisible={chat.unread_count === 0}
                  >
                    <Avatar
                      src={chat.photo_url || undefined}
                      sx={{
                        bgcolor: '#4a9eff',
                        width: isMobile ? 44 : 45,
                        height: isMobile ? 44 : 45,
                      }}
                    >
                      {chat.title ? chat.title[0].toUpperCase() : <ChatIcon />}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: chat.unread_count > 0 ? 600 : 400,
                        color: 'white',
                        fontSize: isMobile ? '0.9rem' : 'inherit',
                      }}
                    >
                      {chat.title || 'Безымянный чат'}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#8b95a1',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: isMobile ? '120px' : '150px',
                          fontSize: isMobile ? '0.75rem' : 'inherit',
                        }}
                      >
                        {chat.last_message || 'Нет сообщений'}
                      </Typography>
                      {chat.last_message_time && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#8b95a1',
                            fontSize: isMobile ? '0.65rem' : '0.7rem',
                            ml: 1,
                          }}
                        >
                          {formatDate(chat.last_message_time)}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                </ListItemButton>
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Box>

      {/* Область чата */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        {!currentChat ? (
          /* Заглушка когда чат не выбран */
          <Box sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            bgcolor: 'rgba(35, 43, 59, 0.95)',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(35, 43, 59, 0.8)',
              pointerEvents: 'none',
            },
          }}>
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <ChatIcon sx={{ fontSize: 80, color: '#4a9eff', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1, color: 'white' }}>
                Выберите чат
              </Typography>
              <Typography variant="body1" sx={{ color: '#8b95a1' }}>
                Выберите чат из списка или создайте новый
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            {/* Заголовок чата */}
            <Box sx={{
              p: isMobile ? 0.75 : 2,
              borderBottom: '1px solid rgba(43, 52, 65, 1)',
              bgcolor: 'rgba(35, 43, 59, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: isMobile ? '56px' : 'auto',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {/* Кнопка назад на мобильных */}
                {isMobile && (
                  <IconButton
                    onClick={handleBackToChats}
                    sx={{
                      color: '#4a9eff',
                      mr: 0.5,
                      p: 0.5,
                      '&:hover': {
                        bgcolor: 'rgba(74, 158, 255, 0.1)',
                      },
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                )}
                
                <Avatar
                  src={currentChat.photo_url || undefined}
                  sx={{
                    bgcolor: '#4a9eff',
                    width: isMobile ? 32 : 40,
                    height: isMobile ? 32 : 40,
                    mr: isMobile ? 1 : 2,
                  }}
                >
                  {currentChat.title ? currentChat.title[0].toUpperCase() : <ChatIcon />}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant={isMobile ? "body2" : "h6"} 
                    sx={{ 
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 0.5 : 1,
                      fontSize: isMobile ? '0.875rem' : 'inherit',
                    }}
                  >
                    {currentChat.title || 'Безымянный чат'}
                    {hasNewMessages && (
                      <Box
                        sx={{
                          width: isMobile ? 6 : 8,
                          height: isMobile ? 6 : 8,
                          borderRadius: '50%',
                          bgcolor: '#4CAF50',
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)', opacity: 1 },
                            '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                            '100%': { transform: 'scale(1)', opacity: 1 },
                          },
                        }}
                      />
                    )}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#8b95a1',
                      fontSize: isMobile ? '0.65rem' : '0.75rem',
                      lineHeight: isMobile ? 1.2 : 'inherit',
                    }}
                  >
                    {currentChat.chat_type === 'private' ? 'Личный чат' : 'Групповой чат'}
                    {hasNewMessages && (isMobile ? ' • Новые' : ' • Новые сообщения')}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: isMobile ? 0.25 : 1 }}>
                <Tooltip title="Обновить сообщения">
                  <IconButton
                    onClick={() => currentChat && checkNewMessages()}
                    sx={{
                      color: '#4a9eff',
                      p: isMobile ? 0.5 : 1.5,
                      '&:hover': {
                        bgcolor: 'rgba(74, 158, 255, 0.1)',
                      },
                    }}
                  >
                    <RefreshIcon fontSize={isMobile ? "small" : "medium"} />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Информация о чате">
                  <IconButton
                    onClick={() => setShowChatInfoDialog(true)}
                    sx={{
                      color: '#4a9eff',
                      p: isMobile ? 0.5 : 1.5,
                      '&:hover': {
                        bgcolor: 'rgba(74, 158, 255, 0.1)',
                      },
                    }}
                  >
                    <InfoIcon fontSize={isMobile ? "small" : "medium"} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Сообщения */}
            <Box sx={{
              flex: 1,
              overflow: 'auto',
              p: isMobile ? 0.5 : 1.5,
              bgcolor: 'rgba(35, 43, 59, 0.95)',
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'local',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(35, 43, 59, 0.8)',
                pointerEvents: 'none',
                zIndex: 0,
              },
              position: 'relative',
              '&::-webkit-scrollbar': {
                width: isMobile ? '3px' : '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: isMobile ? '1.5px' : '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
              },
            }}>
              {error && (
                <Alert severity="error" sx={{ mb: isMobile ? 1 : 2, zIndex: 1, position: 'relative' }}>
                  {error}
                </Alert>
              )}

              {messagesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: isMobile ? 2 : 4, zIndex: 1, position: 'relative' }}>
                  <CircularProgress sx={{ color: '#4a9eff' }} />
                </Box>
              ) : (
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        display: 'flex',
                        justifyContent: isMyMessage(message) ? 'flex-end' : 'flex-start',
                        marginBottom: isMobile ? '8px' : '12px',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: isMobile ? '85%' : '70%',
                          px: isMobile ? 1.25 : 2,
                          py: isMobile ? 0.75 : 1.2,
                          borderRadius: isMyMessage(message) ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          bgcolor: isMyMessage(message) ? '#4a9eff' : 'rgba(43, 52, 65, 0.9)',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          wordBreak: 'break-word',
                        }}
                      >
                        {!isMyMessage(message) && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#40C4FF',
                              fontWeight: 600,
                              display: 'block',
                              mb: isMobile ? 0.25 : 0.5,
                              fontSize: isMobile ? '0.7rem' : '0.75rem',
                            }}
                          >
                            {getDisplayName(message)}
                          </Typography>
                        )}
                        <Typography
                          variant="body1"
                          sx={{
                            mb: isMobile ? 0.25 : 0.5,
                            fontSize: isMobile ? '0.875rem' : '0.95rem',
                            lineHeight: isMobile ? 1.3 : 1.4,
                          }}
                        >
                          {message.text}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            fontSize: isMobile ? '0.6rem' : '0.7rem',
                            display: 'block',
                            textAlign: 'right',
                            mt: isMobile ? 0.125 : 0.25,
                            color: isMyMessage(message) ? 'rgba(255,255,255,0.8)' : '#8b95a1',
                          }}
                        >
                          {formatTime(message.created_at)}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} style={{ position: 'relative', zIndex: 1 }} />
            </Box>

            {/* Поле ввода */}
            <Box sx={{
              p: isMobile ? 1 : 2,
              bgcolor: 'rgba(35, 43, 59, 0.95)',
              display: 'flex',
              gap: isMobile ? 0.75 : 1.5,
              alignItems: 'flex-end',
              borderTop: '1px solid rgba(43, 52, 65, 1)',
              pb: isMobile ? 'max(1rem, env(safe-area-inset-bottom))' : 2,
            }}>
              <TextField
                fullWidth
                multiline
                maxRows={isMobile ? 2 : 4}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Напишите сообщение..."
                variant="outlined"
                size={isMobile ? 'small' : 'small'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: isMobile ? '16px' : '20px',
                    bgcolor: 'rgba(35, 46, 60, 1)',
                    border: 'none',
                    fontSize: isMobile ? '0.875rem' : '0.95rem',
                    color: 'white',
                    '& fieldset': {
                      border: '1px solid rgba(60, 72, 84, 1)',
                    },
                    '&:hover fieldset': {
                      border: '1px solid #4a9eff',
                    },
                    '&.Mui-focused fieldset': {
                      border: '2px solid #4a9eff',
                    },
                    '& .MuiInputBase-input': {
                      padding: isMobile ? '8px 12px' : '12px 16px',
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                      },
                    },
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                size={isMobile ? 'medium' : 'medium'}
                sx={{
                  bgcolor: '#4a9eff',
                  color: 'white',
                  width: isMobile ? 36 : 44,
                  height: isMobile ? 36 : 44,
                  minWidth: isMobile ? 36 : 44,
                  minHeight: isMobile ? 36 : 44,
                  '&:hover': {
                    bgcolor: '#3d8bdb',
                    transform: 'scale(1.05)',
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(60, 72, 84, 1)',
                    color: '#8b95a1',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <SendIcon sx={{ fontSize: isMobile ? '1rem' : '1.2rem' }} />
              </IconButton>
            </Box>
          </>
        )}
      </Box>

      {/* Диалог создания нового чата */}
      <Dialog
        open={showNewChatDialog}
        onClose={() => {
          setShowNewChatDialog(false);
          setCreateChatResult(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(35, 43, 59, 0.95)',
            color: 'white',
          },
        }}
      >
        <DialogTitle>Создать новый чат</DialogTitle>
        <DialogContent>
          {/* Результат создания чата */}
          {createChatResult && (
            <Alert 
              severity={createChatResult.type === 'success' ? 'success' : 'warning'} 
              sx={{ 
                mb: 2,
                '& .MuiAlert-message': {
                  color: 'white',
                },
                bgcolor: createChatResult.type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                border: `1px solid ${createChatResult.type === 'success' ? '#4CAF50' : '#FF9800'}`,
              }}
            >
              {createChatResult.message}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Название чата"
            fullWidth
            variant="outlined"
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: '#4a9eff',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4a9eff',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#4a9eff',
                },
              },
            }}
          />
          
          <TextField
            margin="dense"
            label="Участники (ID или @username, через запятую)"
            fullWidth
            variant="outlined"
            placeholder="Например: 123456789, @username, 987654321, @user2"
            value={newChatMembers}
            onChange={(e) => setNewChatMembers(e.target.value)}
            helperText="💡 Поддерживаются как Telegram ID (числа), так и @username. Если пользователь не найден по username - получит приглашение."
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: '#4a9eff',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4a9eff',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#4a9eff',
                },
              },
              '& .MuiFormHelperText-root': {
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowNewChatDialog(false);
            setCreateChatResult(null);
          }} sx={{ color: '#8b95a1' }}>
            Отмена
          </Button>
          <Button
            onClick={handleCreateNewChat}
            disabled={!newChatTitle.trim() || creatingChat}
            startIcon={creatingChat ? <CircularProgress size={16} /> : undefined}
            sx={{
              bgcolor: '#4a9eff',
              color: 'white',
              '&:hover': {
                bgcolor: '#3d8bdb',
              },
              '&:disabled': {
                bgcolor: 'rgba(60, 72, 84, 1)',
                color: '#8b95a1',
              },
            }}
          >
            {creatingChat ? 'Создаём...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно диагностики */}
      <DiagnosticModal 
        open={showDiagnosticModal} 
        onClose={() => setShowDiagnosticModal(false)} 
      />

      {/* Диалог информации о чате */}
      <ChatInfoDialog
        open={showChatInfoDialog}
        onClose={() => setShowChatInfoDialog(false)}
        currentChat={currentChat}
        loadChatInfo={loadChatInfo}
        addMemberToChat={addMemberToChat}
        removeMemberFromChat={removeMemberFromChat}
        currentUserId={currentUser?.telegram_id}
      />
    </Box>
  );
};

export default AeonMessenger; 