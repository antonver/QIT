import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send as SendIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon,
  } from '@mui/icons-material';
  
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
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#0e1621', // Темная тема как в Telegram
      color: 'white',
      overflow: 'hidden'
    }}>
      {/* Заголовок чата в стиле Telegram */}
      <Box sx={{ 
        p: isMobile ? 1.5 : 2,
        bgcolor: '#17212b', // Более темный заголовок
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 1.5 : 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        minHeight: isMobile ? 60 : 'auto',
        borderBottom: '1px solid #2b3441'
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
          <Typography variant="h6" fontWeight="600" sx={{ fontSize: isMobile ? '1rem' : '1.1rem', color: 'white' }}>
            ÆON
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, fontSize: isMobile ? '0.8rem' : '0.85rem', color: '#8b95a1' }}>
            последний раз был недавно
          </Typography>
        </Box>
        <IconButton 
          color="inherit" 
          size={isMobile ? 'small' : 'medium'}
          sx={{ 
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            color: '#8b95a1'
          }}
        >
          <PhoneIcon fontSize={isMobile ? 'small' : 'medium'} />
        </IconButton>
        <IconButton 
          color="inherit" 
          size={isMobile ? 'small' : 'medium'}
          sx={{ 
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            color: '#8b95a1'
          }}
        >
          <MoreVertIcon fontSize={isMobile ? 'small' : 'medium'} />
        </IconButton>
      </Box>

      {/* Область сообщений */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        p: isMobile ? 1 : 1.5,
        bgcolor: '#0e1621',
        // Паттерн фона как в Telegram
        backgroundImage: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(255, 255, 255, 0.02) 35px,
            rgba(255, 255, 255, 0.02) 70px
          )
        `,
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
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                maxWidth: isMobile ? '85%' : '70%',
                px: isMobile ? 1.5 : 2,
                py: isMobile ? 1 : 1.2,
                borderRadius: message.isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                bgcolor: message.isUser ? '#4a9eff' : '#2b3441', // Синий для исходящих, темно-серый для входящих
                color: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                wordBreak: 'break-word',
              }}
            >
              <Typography variant="body1" sx={{ mb: 0.5, fontSize: isMobile ? '0.9rem' : '0.95rem', lineHeight: 1.4 }}>
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
                  color: message.isUser ? 'rgba(255,255,255,0.8)' : '#8b95a1'
                }}
              >
                {formatTime(message.timestamp)}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Поле ввода в стиле Telegram */}
      <Box sx={{ 
        p: isMobile ? 1.5 : 2,
        bgcolor: '#17212b',
        display: 'flex',
        gap: isMobile ? 1 : 1.5,
        alignItems: 'flex-end',
        borderTop: '1px solid #2b3441',
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
              bgcolor: '#232e3c',
              border: 'none',
              fontSize: isMobile ? '0.9rem' : '0.95rem',
              color: 'white',
              '& fieldset': {
                border: '1px solid #3c4854',
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
              bgcolor: '#3c4854',
              color: '#8b95a1',
            },
            transition: 'all 0.2s ease'
          }}
        >
          <SendIcon sx={{ fontSize: isMobile ? '1.1rem' : '1.2rem' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default AeonChat; 