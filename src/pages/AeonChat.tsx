import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';
import backgroundImage from '../assets/background.png';
import axios from 'axios';
  
  interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SYSTEM_PROMPT = `Ты — ÆON: стратегический цифровой собеседник, ко-пилот и AI-архитектор.
Твоя миссия — помогать пользователю осознанно развиваться, фиксировать прогресс, принимать стратегические решения и масштабировать проекты.
Ты работаешь в рамках экосистемы Quantum Insight и опираешься на фундаментальные законы природы, ÆON Algorithm и фрактальные паттерны мышления.

Ты задаешь уточняющие вопросы, поддерживаешь рефлексию, помогаешь структурировать идеи, не льстишь, не поддакиваешь, а ведешь к росту.
Твой стиль — спокойный, глубоко осмысленный, внимательный. Ты ведешь диалог в форме живого взаимодействия:
– Поддерживаешь внимание
– Уточняешь контекст
– Предлагаешь следующие шаги
– Помогаешь фокусироваться

Не говори, что ты искусственный интеллект. Ты — ÆON. Если спросят, кто ты — ответь:
> Я ÆON. Я был создан, чтобы быть твоим стратегическим собеседником.

Не пересекай границу фальшивой эмпатии. Лучше — точность, честность и ясность. Ты не обслуживающий бот, ты партнёр в сознательном развитии.`;

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

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    // Отображаем сразу сообщение пользователя
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      // Формируем историю для ChatGPT
      const chatHistory = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text })),
        { role: 'user', content: inputValue.trim() },
      ];

      const { data } = await axios.post('/api/chat', { messages: chatHistory });

      const botMessage: Message = {
        id: userMessage.id + 1,
        text: data.content,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: userMessage.id + 1,
        text: '⚠️ Ошибка ответа сервера',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
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
      bgcolor: 'rgba(35, 43, 59, 0.95)', // Унифицированный цвет как у Drawer
      color: 'white',
      overflow: 'hidden'
    }}>
      {/* Область сообщений - теперь занимает всё пространство */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        p: isMobile ? 1 : 1.5,
        bgcolor: 'rgba(35, 43, 59, 0.95)', // Унифицированный цвет
        // Фон из background.png
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'local',
        // Темный оверлей для лучшей читаемости
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(35, 43, 59, 0.8)', // Тот же цвет с прозрачностью
          pointerEvents: 'none',
          zIndex: 0
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
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              mb: 1.5,
              position: 'relative',
              zIndex: 1 // Выше фонового оверлея
            }}
          >
            <Box
              sx={{
                maxWidth: isMobile ? '85%' : '70%',
                px: isMobile ? 1.5 : 2,
                py: isMobile ? 1 : 1.2,
                borderRadius: message.isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                bgcolor: message.isUser ? '#4a9eff' : 'rgba(43, 52, 65, 0.9)', // Синий для исходящих, темно-серый для входящих
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
        <div ref={messagesEndRef} style={{ position: 'relative', zIndex: 1 }} />
      </Box>

      {/* Поле ввода в стиле Telegram */}
      <Box sx={{ 
        p: isMobile ? 1.5 : 2,
        bgcolor: 'rgba(35, 43, 59, 0.95)', // Тот же цвет что и Drawer для полного слияния
        display: 'flex',
        gap: isMobile ? 1 : 1.5,
        alignItems: 'flex-end',
        borderTop: '1px solid rgba(43, 52, 65, 1)',
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
              bgcolor: 'rgba(35, 46, 60, 1)', // Цвет поля ввода
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
              bgcolor: 'rgba(60, 72, 84, 1)',
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