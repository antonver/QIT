import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { diagnoseServerAuth } from '../utils/telegram';

interface DiagnosticModalProps {
  open: boolean;
  onClose: () => void;
}

interface DiagnosticResult {
  status: string;
  serverConfig?: any;
  validationResult?: any;
  recommendations: string[];
}

const DiagnosticModal: React.FC<DiagnosticModalProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setResult(null);

    try {
      const status = await diagnoseServerAuth();
      
      // Get additional info from console logs
      const { debugAuthConfig, debugValidateTelegramData } = await import('../services/aeonMessengerApi');
      const { getTelegramInitData } = await import('../utils/telegram');
      
      let serverConfig;
      let validationResult;
      let recommendations: string[] = [];

      try {
        serverConfig = await debugAuthConfig();
      } catch (e) {
        serverConfig = { error: 'Не удалось получить конфигурацию сервера' };
      }

      const initData = getTelegramInitData();
      if (initData) {
        try {
          validationResult = await debugValidateTelegramData(initData);
        } catch (e) {
          validationResult = { error: 'Не удалось протестировать валидацию' };
        }
      }

      // Generate recommendations based on status
      switch (status) {
        case 'server_no_token':
          recommendations = [
            'Администратор должен установить переменную TELEGRAM_BOT_TOKEN на сервере',
            'Получите токен в @BotFather и добавьте его в настройки Heroku',
            'Перезапустите приложение после установки токена'
          ];
          break;
        case 'validation_failed':
          recommendations = [
            'Проверьте правильность токена бота в @BotFather',
            'Убедитесь, что приложение открыто из Telegram',
            'Токен должен соответствовать боту, через который открыто приложение'
          ];
          break;
        case 'validation_success':
          recommendations = [
            'Валидация прошла успешно, проблема может быть временной',
            'Попробуйте перезагрузить приложение',
            'Проверьте интернет-соединение'
          ];
          break;
        default:
          recommendations = [
            'Убедитесь, что приложение открыто из Telegram',
            'Проверьте интернет-соединение',
            'Обратитесь к администратору с результатами диагностики'
          ];
      }

      setResult({
        status,
        serverConfig,
        validationResult,
        recommendations
      });
    } catch (error) {
      setResult({
        status: 'error',
        recommendations: ['Произошла ошибка при диагностике', 'Проверьте консоль браузера для подробностей']
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validation_success': return 'success';
      case 'server_no_token':
      case 'validation_failed': return 'error';
      default: return 'warning';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'server_no_token': return 'Токен бота не установлен';
      case 'validation_failed': return 'Валидация не прошла';
      case 'validation_success': return 'Валидация успешна';
      case 'server_config_error': return 'Ошибка конфигурации сервера';
      case 'validation_error': return 'Ошибка валидации';
      case 'no_data': return 'Нет данных авторизации';
      case 'general_error': return 'Общая ошибка';
      default: return 'Неизвестный статус';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>🔬 Диагностика проблемы авторизации</DialogTitle>
      <DialogContent>
        {!loading && !result && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Нажмите "Запустить диагностику" для проверки проблемы авторизации
            </Typography>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ mr: 2 }} />
            <Typography>Выполняется диагностика...</Typography>
          </Box>
        )}

        {result && (
          <Box sx={{ py: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Результат диагностики:
              </Typography>
              <Chip 
                label={getStatusText(result.status)}
                color={getStatusColor(result.status)}
                sx={{ mb: 2 }}
              />
            </Box>

            {result.serverConfig && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Конфигурация сервера:
                </Typography>
                <Alert severity={result.serverConfig.telegram_bot_token_set ? 'success' : 'error'}>
                  <Typography variant="body2">
                    Токен бота: {result.serverConfig.telegram_bot_token_set ? '✅ Установлен' : '❌ Не установлен'}
                  </Typography>
                  <Typography variant="body2">
                    Режим отладки: {result.serverConfig.debug_mode ? 'Включен' : 'Выключен'}
                  </Typography>
                </Alert>
              </Box>
            )}

            {result.validationResult && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Результат валидации:
                </Typography>
                <Alert severity={result.validationResult.success ? 'success' : 'error'}>
                  <Typography variant="body2">
                    Валидация: {result.validationResult.success ? '✅ Успешна' : '❌ Не прошла'}
                  </Typography>
                </Alert>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Рекомендации:
              </Typography>
              {result.recommendations.map((rec, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 1, pl: 2 }}>
                  • {rec}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!result && (
          <Button 
            onClick={runDiagnostic} 
            disabled={loading}
            variant="contained"
            color="primary"
          >
            Запустить диагностику
          </Button>
        )}
        {result && (
          <Button onClick={runDiagnostic} variant="outlined">
            Повторить диагностику
          </Button>
        )}
        <Button onClick={onClose}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiagnosticModal; 