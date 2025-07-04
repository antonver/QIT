import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { healthCheck, debugAuthConfig, debugValidateTelegramData } from '../services/aeonMessengerApi';
import { getTelegramInitData, isTelegramWebApp } from '../utils/telegram';

interface DiagnosticModalProps {
  open: boolean;
  onClose: () => void;
}

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'info' | 'loading';
  message: string;
  details?: string;
  suggestions?: string[];
}

const DiagnosticModal: React.FC<DiagnosticModalProps> = ({ open, onClose }) => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    // 1. Проверка Telegram WebApp
    try {
      const isTelegram = isTelegramWebApp();
      diagnosticResults.push({
        name: 'Telegram WebApp',
        status: isTelegram ? 'success' : 'warning',
        message: isTelegram 
          ? 'Приложение запущено в Telegram WebApp' 
          : 'Приложение запущено вне Telegram (режим разработки)',
        details: isTelegram 
          ? 'Все функции Telegram WebApp доступны'
          : 'Некоторые функции могут работать с ограничениями',
        suggestions: !isTelegram ? [
          'Откройте приложение через Telegram бота',
          'Проверьте настройки WebApp в боте'
        ] : undefined
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Telegram WebApp',
        status: 'error',
        message: 'Ошибка при проверке Telegram WebApp',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }

    // 2. Проверка инициализационных данных
    try {
      const initData = getTelegramInitData();
      diagnosticResults.push({
        name: 'Telegram Init Data',
        status: initData ? 'success' : 'error',
        message: initData 
          ? `Данные авторизации найдены (${initData.length} символов)`
          : 'Данные авторизации отсутствуют',
        details: initData 
          ? `Подпись: ${initData.substring(0, 50)}...`
          : 'Невозможно получить данные для авторизации на сервере',
        suggestions: !initData ? [
          'Перезапустите приложение из Telegram',
          'Проверьте настройки бота',
          'Убедитесь что WebApp правильно настроен'
        ] : undefined
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Telegram Init Data',
        status: 'error',
        message: 'Ошибка при получении данных авторизации',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }

    // 3. Проверка подключения к серверу
    try {
      await healthCheck();
      diagnosticResults.push({
        name: 'Подключение к серверу',
        status: 'success',
        message: 'Сервер отвечает на запросы',
        details: 'Health check прошел успешно'
      });
    } catch (error: any) {
      const isMethodError = error.isMethodError || error.response?.status === 405;
      diagnosticResults.push({
        name: 'Подключение к серверу',
        status: isMethodError ? 'warning' : 'error',
        message: isMethodError 
          ? 'Сервер доступен, но некоторые endpoints могут не работать (ошибка 405)'
          : 'Сервер недоступен или не отвечает',
        details: error.message || 'Неизвестная ошибка сервера',
        suggestions: isMethodError ? [
          'Проверьте настройки API на сервере',
          'Убедитесь что все endpoints правильно настроены',
          'Свяжитесь с администратором сервера'
        ] : [
          'Проверьте подключение к интернету',
          'Сервер может быть временно недоступен',
          'Попробуйте позже'
        ]
      });
    }

    // 4. Проверка конфигурации авторизации
    try {
      await debugAuthConfig();
      diagnosticResults.push({
        name: 'Конфигурация авторизации',
        status: 'success',
        message: 'Настройки авторизации на сервере корректны',
        details: 'Сервер готов к обработке Telegram авторизации'
      });
    } catch (error: any) {
      const isMethodError = error.isMethodError || error.response?.status === 405;
      diagnosticResults.push({
        name: 'Конфигурация авторизации',
        status: isMethodError ? 'warning' : 'error',
        message: isMethodError 
          ? 'Endpoint диагностики недоступен (405), но это не критично'
          : 'Проблема с настройками авторизации на сервере',
        details: error.message || 'Ошибка при проверке конфигурации',
        suggestions: isMethodError ? [
          'Функция диагностики может быть отключена на сервере',
          'Это не влияет на основную работу приложения'
        ] : [
          'Проверьте настройки Telegram бота на сервере',
          'Убедитесь что TELEGRAM_BOT_TOKEN настроен правильно'
        ]
      });
    }

    // 5. Проверка валидации данных Telegram (если есть initData)
    const initData = getTelegramInitData();
    if (initData) {
      try {
        await debugValidateTelegramData(initData);
        diagnosticResults.push({
          name: 'Валидация Telegram данных',
          status: 'success',
          message: 'Данные Telegram проходят валидацию на сервере',
          details: 'Подпись данных корректна'
        });
      } catch (error: any) {
        const isMethodError = error.isMethodError || error.response?.status === 405;
        diagnosticResults.push({
          name: 'Валидация Telegram данных',
          status: isMethodError ? 'warning' : 'error',
          message: isMethodError 
            ? 'Endpoint валидации недоступен (405)'
            : 'Данные Telegram не проходят валидацию',
          details: error.message || 'Ошибка валидации данных',
          suggestions: isMethodError ? [
            'Endpoint валидации может быть отключен',
            'Попробуйте основные функции приложения'
          ] : [
            'Данные авторизации могли быть повреждены',
            'Перезапустите приложение из Telegram',
            'Проверьте настройки бота'
          ]
        });
      }
    }

    setResults(diagnosticResults);
    setIsRunning(false);
  };

  useEffect(() => {
    if (open) {
      runDiagnostics();
    }
  }, [open]);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
      case 'error': return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'warning': return <WarningIcon sx={{ color: '#ff9800' }} />;
      case 'loading': return <CircularProgress size={24} />;
      default: return <InfoIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      default: return '#2196f3';
    }
  };

  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const successCount = results.filter(r => r.status === 'success').length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(35, 43, 59, 0.95)',
          color: 'white',
          maxHeight: '90vh'
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Диагностика системы</Typography>
          {isRunning && <CircularProgress size={24} />}
        </Box>
        {!isRunning && results.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip label={`${successCount} успешно`} color="success" size="small" />
            {warningCount > 0 && <Chip label={`${warningCount} предупр.`} sx={{ bgcolor: '#ff9800', color: 'white' }} size="small" />}
            {errorCount > 0 && <Chip label={`${errorCount} ошибок`} color="error" size="small" />}
          </Box>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ pb: 1 }}>
        {isRunning ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
            <CircularProgress />
            <Typography>Выполняется диагностика...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {results.map((result, index) => (
              <Accordion 
                key={index}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    margin: '8px 0',
                  }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    {getStatusIcon(result.status)}
                    <Typography sx={{ fontWeight: 500, flex: 1 }}>{result.name}</Typography>
                    <Chip 
                      label={result.status === 'success' ? 'OK' : result.status === 'error' ? 'Ошибка' : 'Внимание'}
                      size="small"
                      sx={{ 
                        bgcolor: getStatusColor(result.status),
                        color: 'white',
                        minWidth: 80
                      }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {result.message}
                  </Typography>
                  {result.details && (
                    <>
                      <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
                      <Typography variant="caption" sx={{ color: '#8b95a1' }}>
                        Детали: {result.details}
                      </Typography>
                    </>
                  )}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <>
                      <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
                      <Typography variant="caption" sx={{ color: '#8b95a1', display: 'block', mb: 0.5 }}>
                        Рекомендации:
                      </Typography>
                      {result.suggestions.map((suggestion, idx) => (
                        <Typography key={idx} variant="caption" sx={{ color: '#8b95a1', display: 'block', ml: 2 }}>
                          • {suggestion}
                        </Typography>
                      ))}
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}

            {errorCount > 0 && (
              <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(244, 67, 54, 0.1)' }}>
                <Typography variant="body2">
                  Обнаружены критические ошибки. Рекомендуется перезапустить приложение из Telegram.
                </Typography>
              </Alert>
            )}

            {errorCount === 0 && warningCount > 0 && (
              <Alert severity="warning" sx={{ mt: 2, bgcolor: 'rgba(255, 152, 0, 0.1)' }}>
                <Typography variant="body2">
                  Есть некритичные проблемы. Основные функции должны работать.
                </Typography>
              </Alert>
            )}

            {errorCount === 0 && warningCount === 0 && results.length > 0 && (
              <Alert severity="success" sx={{ mt: 2, bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
                <Typography variant="body2">
                  Все проверки прошли успешно! Система работает корректно.
                </Typography>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => runDiagnostics()} disabled={isRunning}>
          Повторить диагностику
        </Button>
        <Button onClick={onClose} variant="contained">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiagnosticModal; 