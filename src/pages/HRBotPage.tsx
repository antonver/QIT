import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  Container,
} from '@mui/material';
import {
  Download,
  TimerOutlined,
  CheckCircle,
  PlayArrow,
  Psychology,
  QuestionAnswer,
  Assessment,
  Speed,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import { hrBotAPI } from '../services/hrBotApi';
import type { Question, Answer, SessionResponse, GlyphResponse, AnswerResponse, ResultResponse } from '../services/hrBotApi';

type SessionState = 'welcome' | 'initializing' | 'in_progress' | 'completed' | 'error';

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  intervalId: NodeJS.Timeout | null;
}

interface SessionResults {
  glyph: GlyphResponse | null;
  result: ResultResponse | null;
  answerTimes: number[];
}

const HRBotPage: React.FC = () => {
  // Основные состояния
  const [sessionState, setSessionState] = useState<SessionState>('welcome');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions] = useState<number>(10); // Фиксируем на 10 вопросах

  // Состояние ответов
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  
  // Состояние таймера
  const [timer, setTimer] = useState<TimerState>({
    timeLeft: 90,
    isRunning: false,
    intervalId: null,
  });

  // Отслеживание времени
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  
  // Финальные результаты
  const [sessionResults, setSessionResults] = useState<SessionResults>({
    glyph: null,
    result: null,
    answerTimes: []
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Функция для форматирования времени
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Форматирование времени в удобочитаемый вид
  const formatDuration = (seconds: number): string => {
    // Защита от NaN и недопустимых значений
    if (!seconds || isNaN(seconds) || seconds < 0) {
      return '0 сек';
    }
    
    if (seconds < 60) {
      return `${Math.round(seconds)} сек`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins} мин ${secs} сек`;
  };

  // Безопасное получение численных значений
  const getSafeNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Безопасное получение процента
  const getSafePercentage = (value: any): number => {
    const num = getSafeNumber(value, 0);
    return Math.min(Math.max(num, 0), 100); // Ограничиваем от 0 до 100%
  };

  // Очистка таймера
  const clearTimer = useCallback(() => {
    if (timer.intervalId) {
      clearInterval(timer.intervalId);
      setTimer(prev => ({ ...prev, intervalId: null, isRunning: false }));
    }
  }, [timer.intervalId]);

  // Отправка ответа
  const handleSubmitAnswer = useCallback(async () => {
    if (!sessionToken || !currentQuestion) return;

    try {
      setLoading(true);
      clearTimer();

      // Вычисляем время, потраченное на вопрос
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

      const answer: Answer = {
        question_id: currentQuestion.id,
        answer: currentAnswer,
        time_spent: timeSpent,
      };

      // Сохраняем ответ локально
      setAnswers(prev => [...prev, answer]);

      // Отправляем ответ на /session/token/answer
      const answerResponse: AnswerResponse = await hrBotAPI.submitAnswer(sessionToken, answer);
      console.log('✅ Answer response:', answerResponse, 'Time spent:', timeSpent);
      
      // Сохраняем время ответа
      const actualTimeSpent = answerResponse.time_spent || timeSpent;
      setSessionResults(prev => ({
        ...prev,
        answerTimes: [...prev.answerTimes, actualTimeSpent]
      }));
      
      console.log('⏱️ Answer times so far:', [...sessionResults.answerTimes, actualTimeSpent]);

      // Проверяем, если это последний вопрос (10-й)
      if (questionIndex >= totalQuestions) {
        await completeSession();
        return;
      }

      // Получаем следующий вопрос
      const nextQuestion = await hrBotAPI.getNextQuestion(sessionToken);
      if (nextQuestion && questionIndex < totalQuestions) {
        setCurrentQuestion(nextQuestion);
        setQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');
        setQuestionStartTime(Date.now());
        startTimer();
      } else {
        // Завершаем сессию
        await completeSession();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки ответа');
    } finally {
      setLoading(false);
    }
  }, [sessionToken, currentQuestion, currentAnswer, clearTimer, questionIndex, totalQuestions, questionStartTime]);

  // Запуск таймера
  const startTimer = useCallback(() => {
    clearTimer();
    
    setTimer(prev => ({ ...prev, timeLeft: 90, isRunning: true }));
    
    const intervalId = setInterval(() => {
      setTimer(prev => {
        if (prev.timeLeft <= 1) {
          clearTimer();
          // Автоматически отправить ответ когда время закончилось
          handleSubmitAnswer();
          return { ...prev, timeLeft: 0, isRunning: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    setTimer(prev => ({ ...prev, intervalId }));
  }, [clearTimer, handleSubmitAnswer]);

  // Завершение сессии
  const completeSession = async () => {
    try {
      setLoading(true);
      clearTimer();

      // 1. Завершаем сессию - /session/token/complete
      await hrBotAPI.completeSession(sessionToken);

      // 2. Получаем результаты - /result/token
      const result = await hrBotAPI.getResult(sessionToken);
      console.log('📊 Result from API:', result);

      // 3. Генерируем глиф - /aeon/glyph/token
      const glyph = await hrBotAPI.generateGlyph(sessionToken);
      console.log('🎨 Glyph from API:', glyph);

      // Сохраняем все результаты
      setSessionResults(prev => ({
        ...prev,
        glyph,
        result
      }));
      
      setSessionState('completed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка завершения сессии');
      setSessionState('error');
    } finally {
      setLoading(false);
    }
  };

  // Инициализация сессии
  const initializeSession = async () => {
    try {
      setLoading(true);
      setError('');
      setSessionState('initializing');
      
      const sessionResponse = await hrBotAPI.createSession();
      setSessionToken(sessionResponse.token);
      
      // Получить первый вопрос
      const firstQuestion = await hrBotAPI.getNextQuestion(sessionResponse.token);
      
      if (firstQuestion) {
        setCurrentQuestion(firstQuestion);
        setQuestionIndex(1);
        setQuestionStartTime(Date.now());
        setSessionState('in_progress');
        startTimer();
      } else {
        setError('Не удалось загрузить вопросы');
        setSessionState('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка инициализации');
      setSessionState('error');
    } finally {
      setLoading(false);
    }
  };

  // Начать интервью
  const startInterview = () => {
    initializeSession();
  };

  // Скачивание отчета
  const downloadReport = () => {
    if (sessionResults.glyph && sessionResults.result) {
      const reportData = `HR Bot - Полный отчет интервью
================================================================
Дата: ${new Date().toLocaleDateString('ru-RU')}
Время завершения: ${new Date().toLocaleTimeString('ru-RU')}

ПЕРСОНАЛЬНЫЙ ГЛИФ
${sessionResults.glyph.glyph}

ПРОФИЛЬ КАНДИДАТА
${sessionResults.glyph.profile}

СТАТИСТИКА СЕССИИ
================================================================
Общее время: ${formatDuration(getSafeNumber(sessionResults.result?.total_time))}
Количество вопросов: ${getSafeNumber(sessionResults.result?.questions_answered) || answers.length}
Процент завершения: ${Math.round(getSafePercentage(sessionResults.result?.completion_rate || (answers.length / totalQuestions) * 100))}%
Среднее время на вопрос: ${formatDuration(getSafeNumber(sessionResults.result?.average_time_per_question) || 
  (sessionResults.answerTimes.length > 0 ? 
    sessionResults.answerTimes.reduce((sum, time) => sum + time, 0) / sessionResults.answerTimes.length : 
    0))}

ДЕТАЛИЗАЦИЯ ПО ВОПРОСАМ
================================================================
${sessionResults.answerTimes.map((time, index) => 
  `Вопрос ${index + 1}: ${formatDuration(time)}`
).join('\n')}

================================================================
Это автоматически сгенерированный отчет HR Bot системы.
Сессия ID: ${sessionResults.result.session_id}`;

      const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `hr-bot-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };

  // Рестарт
  const restart = () => {
    clearTimer();
    setSessionState('welcome');
    setSessionToken('');
    setCurrentQuestion(null);
    setQuestionIndex(0);
    setCurrentAnswer('');
    setAnswers([]);
    setSessionResults({
      glyph: null,
      result: null,
      answerTimes: []
    });
    setError('');
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Заголовок */}
        <Typography 
          variant="h3" 
          component="h1" 
          align="center" 
          sx={{ 
            mb: 6, 
            color: 'white',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          🤖 HR Bot
        </Typography>

        {/* Ошибка */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} action={
            <Button color="inherit" size="small" onClick={restart}>
              Попробовать снова
            </Button>
          }>
            {error}
          </Alert>
        )}

        {/* Стартовая страница */}
        {sessionState === 'welcome' && (
          <Card elevation={8} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ 
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              p: 4,
              color: 'white',
              textAlign: 'center'
            }}>
              <Psychology sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Добро пожаловать в HR интервью!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Искусственный интеллект проведет с вами персональное интервью
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                <Box sx={{ flex: '1 1 300px', textAlign: 'center', p: 2 }}>
                  <QuestionAnswer sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    10 Вопросов
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Открытые вопросы для полного анализа
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px', textAlign: 'center', p: 2 }}>
                  <TimerOutlined sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    90 секунд
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    На каждый вопрос или ответить раньше
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 300px', textAlign: 'center', p: 2 }}>
                  <Assessment sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Персональный отчет
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Уникальный глиф и профиль кандидата
                  </Typography>
                </Box>
              </Box>

              <Paper sx={{ p: 3, mb: 4, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                  Как это работает:
                </Typography>
                <Typography variant="body1" paragraph>
                  • ИИ задаст вам 10 открытых вопросов о вашем опыте и навыках
                </Typography>
                <Typography variant="body1" paragraph>
                  • Каждый ответ анализируется в реальном времени
                </Typography>
                <Typography variant="body1">
                  • В конце вы получите персональный глиф и профиль кандидата
                </Typography>
              </Paper>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={startInterview}
                  sx={{ 
                    px: 6, 
                    py: 2,
                    fontSize: '1.2rem',
                    background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Начать интервью
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Инициализация */}
        {sessionState === 'initializing' && (
          <Card elevation={8} sx={{ borderRadius: 4 }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={80} sx={{ mb: 4, color: 'primary.main' }} />
              <Typography variant="h5" gutterBottom>
                Подготовка интервью...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ИИ создает персональную сессию и загружает вопросы
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* В процессе интервью */}
        {sessionState === 'in_progress' && currentQuestion && (
          <Card elevation={8} sx={{ borderRadius: 4 }}>
            <Box sx={{ 
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              p: 3,
              color: 'white'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                  Вопрос {questionIndex} из {totalQuestions}
                </Typography>
                <Chip
                  icon={<TimerOutlined />}
                  label={formatTime(timer.timeLeft)}
                  color={timer.timeLeft <= 10 ? 'error' : timer.timeLeft <= 30 ? 'warning' : 'default'}
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={(questionIndex / totalQuestions) * 100}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'white'
                  }
                }}
              />
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 4, lineHeight: 1.4, fontWeight: 500 }}>
                {currentQuestion.text}
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={8}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Поделитесь своими мыслями и опытом..."
                variant="outlined"
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: 2,
                    },
                  },
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmitAnswer}
                  disabled={loading || !currentAnswer.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  sx={{ 
                    minWidth: 180,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                    },
                    '&:disabled': {
                      background: 'rgba(0,0,0,0.12)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? 'Обработка...' : 'Далее'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Завершено */}
        {sessionState === 'completed' && sessionResults.glyph && sessionResults.result && (
          <Card elevation={12} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 4,
              color: 'white',
              textAlign: 'center'
            }}>
              <CheckCircle sx={{ fontSize: 100, mb: 2 }} />
              <Typography variant="h3" gutterBottom fontWeight="bold">
                Интервью завершено!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Ваш персональный профиль готов
              </Typography>
            </Box>

            <CardContent sx={{ p: 6 }}>
              {/* Глиф */}
              <Paper 
                elevation={6} 
                sx={{ 
                  p: 6, 
                  mb: 4, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  borderRadius: 4
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                  Ваш персональный глиф
                </Typography>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    mb: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  {sessionResults.glyph.glyph}
                </Typography>
              </Paper>

              {/* Профиль */}
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  mb: 4,
                  borderRadius: 3,
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  borderLeft: '6px solid #667eea'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  📊 Анализ профиля кандидата
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                    color: 'text.primary'
                  }}
                >
                  {sessionResults.glyph.profile}
                </Typography>
              </Paper>

              {/* Детальная статистика */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 4, 
                  mb: 4,
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.02)'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                  📈 Подробная статистика интервью
                </Typography>
                
                {/* Основные метрики */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                  <Box sx={{ textAlign: 'center', minWidth: 140 }}>
                    <Speed sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {formatDuration(getSafeNumber(sessionResults.result?.total_time))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Общее время
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: 140 }}>
                    <EmojiEvents sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {Math.round(getSafePercentage(sessionResults.result?.completion_rate || (answers.length / totalQuestions) * 100))}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Завершено
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: 140 }}>
                    <TimerOutlined sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {formatDuration(getSafeNumber(sessionResults.result?.average_time_per_question) || 
                        (sessionResults.answerTimes.length > 0 ? 
                          sessionResults.answerTimes.reduce((sum, time) => sum + time, 0) / sessionResults.answerTimes.length : 
                          0))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Среднее время
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: 140 }}>
                    <QuestionAnswer sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {getSafeNumber(sessionResults.result?.questions_answered) || answers.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ответов дано
                    </Typography>
                  </Box>
                </Box>

                {/* График времени по вопросам */}
                {sessionResults.answerTimes.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      ⏱️ Время ответа по вопросам
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {sessionResults.answerTimes.map((time, index) => (
                        <Chip
                          key={index}
                          label={`${index + 1}: ${formatDuration(time)}`}
                          variant="outlined"
                          size="small"
                          color={time > 60 ? 'error' : time > 30 ? 'warning' : 'success'}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>

              {/* Кнопки действий */}
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Download />}
                  onClick={downloadReport}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Скачать полный отчет
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={restart}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Пройти повторно
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default HRBotPage; 