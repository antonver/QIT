import React, { useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { getCurrentUser, healthCheck } from '../services/aeonMessengerApi';

const CorsTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const testCors = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Тестируем через healthCheck вместо прямого вызова aeonApi
      const response = await healthCheck();
      setResult({
        type: 'success',
        message: `CORS тест успешен! Данные: ${JSON.stringify(response)}`
      });
    } catch (error: any) {
      console.error('CORS test error:', error);
      
      let message = 'Неизвестная ошибка';
      
      if (error.isTelegramWebAppError) {
        message = 'Приложение должно быть открыто из Telegram WebApp';
      } else if (error.response?.status === 401) {
        message = 'Ошибка авторизации - требуется Telegram авторизация';
      } else if (error.response?.status === 500) {
        message = 'Ошибка сервера (500)';
      } else if (error.message?.includes('CORS')) {
        message = 'CORS ошибка - проверьте настройки сервера';
      } else if (error.code === 'ECONNABORTED') {
        message = 'Таймаут запроса - сервер может запускаться';
      } else {
        message = `Ошибка: ${error.message || 'Неизвестная ошибка'}`;
      }
      
      setResult({
        type: 'error',
        message
      });
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await healthCheck();
      setResult({
        type: 'success',
        message: `Health check успешен! Данные: ${JSON.stringify(response)}`
      });
    } catch (error: any) {
      console.error('Health test error:', error);
      
      let message = 'Неизвестная ошибка';
      
      if (error.isTelegramWebAppError) {
        message = 'Приложение должно быть открыто из Telegram WebApp';
      } else if (error.response?.status === 401) {
        message = 'Ошибка авторизации - требуется Telegram авторизация';
      } else if (error.response?.status === 500) {
        message = 'Ошибка сервера (500)';
      } else if (error.message?.includes('CORS')) {
        message = 'CORS ошибка - проверьте настройки сервера';
      } else if (error.code === 'ECONNABORTED') {
        message = 'Таймаут запроса - сервер может запускаться';
      } else {
        message = `Ошибка: ${error.message || 'Неизвестная ошибка'}`;
      }
      
      setResult({
        type: 'error',
        message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        CORS Тест
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Эта страница позволяет протестировать CORS настройки и подключение к бэкенду.
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={testCors}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Тест CORS'}
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testHealth}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Health Check'}
        </Button>
      </Box>
      
      {result && (
        <Alert severity={result.type} sx={{ mt: 2 }}>
          {result.message}
        </Alert>
      )}
      
      <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
        <strong>Инструкции:</strong>
        <br />
        1. Откройте приложение из Telegram WebApp для полного тестирования
        <br />
        2. В браузере вы увидите ошибки авторизации (это нормально)
        <br />
        3. CORS ошибки должны исчезнуть после правильной настройки
      </Typography>
    </Box>
  );
};

export default CorsTest; 