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
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import backgroundImage from '../assets/background.png';
import { useAeonMessenger } from '../hooks/useAeonMessenger';
import type { AeonMessage } from '../types/api';

const AeonMessenger: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [inputValue, setInputValue] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
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
    sendNewMessage,
    createNewChat,
    selectChat,
  } = useAeonMessenger();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBackToChats = () => {
    // Очищаем текущий чат для возврата к списку чатов
    window.location.reload();
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || !currentChat) return;

    await sendNewMessage(currentChat.id, inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateNewChat = async () => {
    if (newChatTitle.trim() === '') return;

    try {
      await createNewChat(newChatTitle.trim());
      setNewChatTitle('');
      setShowNewChatDialog(false);
    } catch (err) {
      console.error('Error creating chat:', err);
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
        <Alert severity="error" sx={{ mb: 3, maxWidth: '500px' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Ошибка авторизации
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Не удалось авторизоваться в системе. Это может произойти, если:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Приложение запущено не из Telegram</li>
            <li>Истек срок действия сессии</li>
            <li>Проблемы с сетевым подключением</li>
          </Typography>
        </Alert>
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
          Перезагрузить приложение
        </Button>
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
          p: 2,
          borderBottom: '1px solid rgba(43, 52, 65, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Чаты
          </Typography>
          <Tooltip title="Создать новый чат">
            <IconButton
              onClick={() => setShowNewChatDialog(true)}
              sx={{
                bgcolor: '#4a9eff',
                color: 'white',
                '&:hover': {
                  bgcolor: '#3d8bdb',
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
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
                    py: 1.5,
                    px: 2,
                    bgcolor: currentChat?.id === chat.id ? 'rgba(74, 158, 255, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: currentChat?.id === chat.id ? 'rgba(74, 158, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    },
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
                        width: 45,
                        height: 45,
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
                          maxWidth: '150px',
                        }}
                      >
                        {chat.last_message || 'Нет сообщений'}
                      </Typography>
                      {chat.last_message_time && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#8b95a1',
                            fontSize: '0.7rem',
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
              p: 2,
              borderBottom: '1px solid rgba(43, 52, 65, 1)',
              bgcolor: 'rgba(35, 43, 59, 0.95)',
              display: 'flex',
              alignItems: 'center',
            }}>
              <Avatar
                src={currentChat.photo_url || undefined}
                sx={{
                  bgcolor: '#4a9eff',
                  width: 40,
                  height: 40,
                  mr: 2,
                }}
              >
                {currentChat.title ? currentChat.title[0].toUpperCase() : <ChatIcon />}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {currentChat.title || 'Безымянный чат'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8b95a1' }}>
                  {currentChat.chat_type === 'private' ? 'Личный чат' : 'Групповой чат'}
                </Typography>
              </Box>
            </Box>

            {/* Сообщения */}
            <Box sx={{
              flex: 1,
              overflow: 'auto',
              p: isMobile ? 1 : 1.5,
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
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
              },
            }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2, zIndex: 1, position: 'relative' }}>
                  {error}
                </Alert>
              )}

              {messagesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, zIndex: 1, position: 'relative' }}>
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
                        marginBottom: '12px',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: isMobile ? '85%' : '70%',
                          px: isMobile ? 1.5 : 2,
                          py: isMobile ? 1 : 1.2,
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
                              mb: 0.5,
                            }}
                          >
                            {getDisplayName(message)}
                          </Typography>
                        )}
                        <Typography
                          variant="body1"
                          sx={{
                            mb: 0.5,
                            fontSize: isMobile ? '0.9rem' : '0.95rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {message.text}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            fontSize: isMobile ? '0.65rem' : '0.7rem',
                            display: 'block',
                            textAlign: 'right',
                            mt: 0.25,
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
              p: isMobile ? 1.5 : 2,
              bgcolor: 'rgba(35, 43, 59, 0.95)',
              display: 'flex',
              gap: isMobile ? 1 : 1.5,
              alignItems: 'flex-end',
              borderTop: '1px solid rgba(43, 52, 65, 1)',
              pb: isMobile ? 'max(1.5rem, env(safe-area-inset-bottom))' : 2,
            }}>
              <TextField
                fullWidth
                multiline
                maxRows={isMobile ? 3 : 4}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Напишите сообщение..."
                variant="outlined"
                size={isMobile ? 'small' : 'small'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    bgcolor: 'rgba(35, 46, 60, 1)',
                    border: 'none',
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
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
                      padding: isMobile ? '10px 14px' : '12px 16px',
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
                  width: isMobile ? 40 : 44,
                  height: isMobile ? 40 : 44,
                  minWidth: isMobile ? 40 : 44,
                  minHeight: isMobile ? 40 : 44,
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
                <SendIcon sx={{ fontSize: isMobile ? '1.1rem' : '1.2rem' }} />
              </IconButton>
            </Box>
          </>
        )}
      </Box>

      {/* Диалог создания нового чата */}
      <Dialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
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
          <TextField
            autoFocus
            margin="dense"
            label="Название чата"
            fullWidth
            variant="outlined"
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            sx={{
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewChatDialog(false)} sx={{ color: '#8b95a1' }}>
            Отмена
          </Button>
          <Button
            onClick={handleCreateNewChat}
            disabled={!newChatTitle.trim()}
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
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Мобильная кнопка назад к списку чатов */}
      {isMobile && currentChat && (
        <Fab
          onClick={handleBackToChats}
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            bgcolor: '#4a9eff',
            color: 'white',
            '&:hover': {
              bgcolor: '#3d8bdb',
            },
            zIndex: 1000,
          }}
        >
          <PersonIcon />
        </Fab>
      )}
    </Box>
  );
};

export default AeonMessenger; 