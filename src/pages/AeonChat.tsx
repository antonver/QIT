import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send as SendIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon,
  } from '@mui/icons-material';
import backgroundImage from '../assets/background.png';
  
  interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AeonChat: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Добро пожаловать в ÆON! Как дела?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Имитируем печатание и отвечаем через 1 секунду
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: 'ÆON пока не подключен 🤖',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Box sx={{
      height: '100vh',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        pointerEvents: 'none',
        zIndex: 0
      }
    }}>
      <Container maxWidth="md" sx={{ 
        height: '100%', 
        py: isMobile ? 0 : 2,
        px: isMobile ? 0 : 3,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1
      }}>
        <Paper 
          elevation={isMobile ? 0 : 12} 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: isMobile ? 0 : 3,
            overflow: 'hidden',
            bgcolor: 'background.default',
            backdropFilter: 'blur(10px)',
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Заголовок чата в стиле Telegram */}
          <Box sx={{ 
            p: isMobile ? 1.5 : 2,
            bgcolor: '#0088cc', // Синий цвет Telegram
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 1.5 : 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            minHeight: isMobile ? 60 : 'auto'
          }}>
            <Avatar sx={{ 
              width: isMobile ? 36 : 42, 
              height: isMobile ? 36 : 42,
              bgcolor: '#FF6B6B',
              fontSize: isMobile ? '1.1rem' : '1.3rem',
              fontWeight: 'bold'
            }}>
              Æ
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="600" sx={{ fontSize: isMobile ? '1rem' : '1.1rem' }}>
                ÆON
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                последний раз был недавно
              </Typography>
            </Box>
            <IconButton 
              color="inherit" 
              size={isMobile ? 'small' : 'medium'}
              sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <PhoneIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
            <IconButton 
              color="inherit" 
              size={isMobile ? 'small' : 'medium'}
              sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <MoreVertIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Box>

          {/* Область сообщений */}
          <Box sx={{ 
            flex: 1,
            overflow: 'auto',
            p: isMobile ? 1 : 2,
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
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              pointerEvents: 'none',
              zIndex: 0
            },
            position: 'relative'
          }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                  mb: 1.5,
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <Box
                  sx={{
                    maxWidth: isMobile ? '85%' : '70%',
                    px: isMobile ? 1.5 : 2,
                    py: isMobile ? 1 : 1.5,
                    borderRadius: message.isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    bgcolor: message.isUser ? '#4FC3F7' : '#ffffff', // Голубой для исходящих, белый для входящих
                    color: message.isUser ? 'white' : '#333',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    wordBreak: 'break-word',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  <Typography variant="body1" sx={{ mb: 0.5, fontSize: isMobile ? '0.9rem' : '0.95rem', lineHeight: 1.4 }}>
                    {message.text}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      opacity: message.isUser ? 0.8 : 0.6,
                      fontSize: isMobile ? '0.65rem' : '0.7rem',
                      display: 'block',
                      textAlign: 'right',
                      mt: 0.25
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} style={{ position: 'relative', zIndex: 1 }} />
          </Box>

          <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

          {/* Поле ввода в стиле Telegram */}
          <Box sx={{ 
            p: isMobile ? 1.5 : 2,
            bgcolor: '#ffffff',
            display: 'flex',
            gap: isMobile ? 1 : 1.5,
            alignItems: 'flex-end',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            pb: isMobile ? 'max(1.5rem, env(safe-area-inset-bottom))' : 2 // Безопасная зона для iPhone
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
                    bgcolor: '#0088cc', // Темно-синий цвет как в dashboard
                    border: 'none',
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    color: 'white',
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover fieldset': {
                      border: 'none',
                    },
                    '&.Mui-focused fieldset': {
                      border: '2px solid #ffffff',
                    },
                    '& .MuiInputBase-input': {
                      padding: isMobile ? '10px 14px' : '12px 16px',
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        opacity: 1,
                      }
                    }
                  },
                }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              size={isMobile ? 'medium' : 'medium'}
              sx={{
                bgcolor: '#0088cc',
                color: 'white',
                width: isMobile ? 40 : 44,
                height: isMobile ? 40 : 44,
                minWidth: isMobile ? 40 : 44,
                minHeight: isMobile ? 40 : 44,
                '&:hover': {
                  bgcolor: '#0077b5',
                  transform: 'scale(1.05)',
                },
                '&:disabled': {
                  bgcolor: '#bbb',
                  color: '#fff',
                },
                transition: 'all 0.2s ease'
              }}
            >
              <SendIcon sx={{ fontSize: isMobile ? '1.1rem' : '1.2rem' }} />
            </IconButton>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AeonChat; 