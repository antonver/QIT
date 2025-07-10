import React, { useState, useEffect, useCallback } from 'react';
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
  Paper,
  useTheme,
  useMediaQuery,
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
import type { Question, Answer, GlyphResponse, AnswerResponse, ResultResponse } from '../services/hrBotApi';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Основные состояния
  const [sessionState, setSessionState] = useState<SessionState>('welcome');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [totalQuestions] = useState<number>(10);

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

  // Получить текущий вопрос
  const currentQuestion = questions[currentQuestionIndex];

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

  // Запуск таймера
  const startTimer = useCallback((): void => {
    clearTimer();
    
    const id = setInterval(() => {
      setTimer(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(id);
          return { ...prev, timeLeft: 0, isRunning: false, intervalId: null };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    
    setTimer(prev => ({ ...prev, isRunning: true, intervalId: id }));
  }, [clearTimer]);

  // Обработчик отправки ответа
  const handleSubmitAnswer = useCallback(async (): Promise<void> => {
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

      // Очищаем предыдущие ошибки перед новой отправкой
      setError('');

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

      // Проверяем, если это последний вопрос
      if (currentQuestionIndex >= questions.length - 1 && currentQuestionIndex >= totalQuestions - 1) {
        await completeSession();
        return;
      }

      // Переходим к следующему вопросу, если он есть в массиве
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');
        setQuestionStartTime(Date.now());
        startTimer();
      } else {
        // Если вопросов в массиве больше нет, запрашиваем новые
        const newQuestions = await hrBotAPI.getNextQuestion(sessionToken);
        if (newQuestions.length > 0) {
          setQuestions(prev => [...prev, ...newQuestions]);
          setCurrentQuestionIndex(prev => prev + 1);
          setCurrentAnswer('');
          setQuestionStartTime(Date.now());
          startTimer();
        } else {
          // Если новых вопросов нет, завершаем сессию
          await completeSession();
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        setError('Не удалось отправить. Подождите 5 секунд и отправьте ещё раз.');
      } else {
        setError(err instanceof Error ? err.message : 'Ошибка отправки ответа');
      }
    } finally {
      setLoading(false);
    }
  }, [sessionToken, currentQuestion, currentAnswer, clearTimer, currentQuestionIndex, questions.length, totalQuestions, questionStartTime, startTimer]);

  // Завершение сессии
  const completeSession = async () => {
    try {
      setLoading(true);
      clearTimer();

      console.log('🏁 Starting session completion...');

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
      console.log('✅ Session completed successfully');
    } catch (err) {
      console.error('❌ Error completing session:', err);
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
      
      console.log('🚀 Initializing session...');
      
      // 1. Создаем новую сессию
      const session = await hrBotAPI.createSession();
      setSessionToken(session.token);
      
      console.log('✅ Session created:', session.token);
      
      // 2. Получаем первый вопрос
      const initialQuestions = await hrBotAPI.getNextQuestion(session.token);
      
      if (!initialQuestions || initialQuestions.length === 0) {
        throw new Error('Не удалось загрузить первый вопрос. Возможно, сервер временно недоступен или вопросы закончились.');
      }
      
      console.log('✅ Initial questions loaded:', initialQuestions);
      
      setQuestions(initialQuestions);
      setCurrentQuestionIndex(0);
      setSessionState('in_progress');
      setQuestionStartTime(Date.now());
      startTimer();
      
      console.log('✅ Session initialized successfully');
    } catch (err) {
      console.error('❌ Error initializing session:', err);
      setError(err instanceof Error ? err.message : 'Не удалось инициализировать сессию. Проверьте подключение к интернету и попробуйте снова.');
      setSessionState('error');
    } finally {
      setLoading(false);
    }
  };

  // Начало интервью
  const startInterview = () => {
    setSessionState('initializing');
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
  const restart = async () => {
    clearTimer();
    
    // Очищаем сессию на сервере если она была создана
    if (sessionToken) {
      try {
        await hrBotAPI.cleanupSession(sessionToken);
      } catch (err) {
        console.warn('Failed to cleanup session:', err);
      }
    }
    
    setSessionState('welcome');
    setSessionToken('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setAnswers([]);
    setSessionResults({
      glyph: null,
      result: null,
      answerTimes: []
    });
    setError('');
    
    console.log('🔄 Session restarted');
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      clearTimer();
      // Очищаем сессию при размонтировании компонента
      if (sessionToken) {
        hrBotAPI.cleanupSession(sessionToken).catch((err: any) => 
          console.warn('Failed to cleanup session on unmount:', err)
        );
      }
    };
  }, [clearTimer, sessionToken]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'rgba(35, 43, 59, 0.95)', // Унифицированный цвет как у Drawer
      py: { xs: 2, md: 4 }  // Уменьшенные отступы для мобильных
    }}>
      <Box maxWidth="md" sx={{ mx: 'auto', px: { xs: 1, sm: 2, md: 3 } }}> {/* Заменил Container на обычный Box */}
        {/* Заголовок */}
        <Typography 
          variant="h3" 
          component="h1" 
          align="center" 
          sx={{ 
            mb: { xs: 3, md: 6 }, // Адаптивные отступы
            color: 'white',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } // Адаптивный размер шрифта
          }}
        >
          🤖 HR Bot
        </Typography>

        {/* Ошибка */}
        {error && (
          <Alert severity="error" sx={{ mb: { xs: 2, md: 3 } }}
            action={error.includes('Не удалось отправить') ? undefined : (
              <Button color="inherit" size="small" onClick={() => restart()}>
                Попробовать снова
              </Button>
            )}
          >
            {error}
          </Alert>
        )}

        {/* Стартовая страница */}
        {sessionState === 'welcome' && (
          <Card elevation={8} sx={{ borderRadius: { xs: 2, md: 4 }, overflow: 'hidden' }}>
            <Box sx={{ 
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              p: { xs: 2, sm: 3, md: 4 }, // Адаптивные отступы
              color: 'white',
              textAlign: 'center'
            }}>
              <Psychology sx={{ fontSize: { xs: 60, md: 80 }, mb: { xs: 1, md: 2 } }} />
              <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                Добро пожаловать в HR интервью!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Искусственный интеллект проведет с вами персональное интервью
              </Typography>
            </Box>
            
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 3 }, mb: { xs: 3, md: 4 } }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' }, textAlign: 'center', p: { xs: 1, md: 2 } }}>
                  <QuestionAnswer sx={{ fontSize: { xs: 36, md: 48 }, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    10 Вопросов
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                    Открытые вопросы для полного анализа
                  </Typography>
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' }, textAlign: 'center', p: { xs: 1, md: 2 } }}>
                  <TimerOutlined sx={{ fontSize: { xs: 36, md: 48 }, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    90 секунд
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                    На каждый вопрос или ответить раньше
                  </Typography>
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' }, textAlign: 'center', p: { xs: 1, md: 2 } }}>
                  <Assessment sx={{ fontSize: { xs: 36, md: 48 }, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    Персональный отчет
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                    Уникальный глиф и профиль кандидата
                  </Typography>
                </Box>
              </Box>

              <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 3, md: 4 }, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                  <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                  Как это работает:
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                  • ИИ задаст вам 10 открытых вопросов о вашем опыте и навыках
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                  • Каждый ответ анализируется в реальном времени
                </Typography>
                <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
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
                    px: { xs: 4, md: 6 }, 
                    py: { xs: 1.5, md: 2 },
                    fontSize: { xs: '1rem', md: '1.2rem' },
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
          <Card elevation={8} sx={{ borderRadius: { xs: 2, md: 4 } }}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 6, md: 8 } }}>
              <CircularProgress size={isMobile ? 60 : 80} sx={{ mb: { xs: 3, md: 4 }, color: 'primary.main' }} />
              <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                Подготовка интервью...
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                ИИ создает персональную сессию и загружает вопросы
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* В процессе интервью */}
        {sessionState === 'in_progress' && currentQuestion && (
          <Card elevation={8} sx={{ borderRadius: { xs: 2, md: 4 } }}>
            <Box sx={{ 
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              p: { xs: 2, md: 3 },
              color: 'white'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 1, sm: 0 } }}>
                <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                  Вопрос {currentQuestionIndex + 1} из {totalQuestions}
                </Typography>
                <Chip
                  icon={<TimerOutlined />}
                  label={formatTime(timer.timeLeft)}
                  color={timer.timeLeft <= 10 ? 'error' : timer.timeLeft <= 30 ? 'warning' : 'default'}
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={((currentQuestionIndex + 1) / totalQuestions) * 100}
                sx={{ 
                  height: { xs: 6, md: 8 }, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'white'
                  }
                }}
              />
            </Box>

            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Typography variant="h5" gutterBottom sx={{ mb: { xs: 3, md: 4 }, lineHeight: 1.4, fontWeight: 500, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                {currentQuestion.text}
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={isMobile ? 6 : 8}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Поделитесь своими мыслями и опытом..."
                variant="outlined"
                sx={{ 
                  mb: { xs: 3, md: 4 },
                  '& .MuiOutlinedInput-root': {
                    fontSize: { xs: '1rem', md: '1.1rem' },
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
                    minWidth: { xs: 120, md: 180 },
                    py: { xs: 1.2, md: 1.5 },
                    fontSize: { xs: '0.9rem', md: '1rem' },
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
          <Card elevation={12} sx={{ borderRadius: { xs: 2, md: 4 }, overflow: 'hidden' }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: { xs: 3, md: 4 },
              color: 'white',
              textAlign: 'center'
            }}>
              <CheckCircle sx={{ fontSize: { xs: 80, md: 100 }, mb: { xs: 1, md: 2 } }} />
              <Typography variant="h3" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                Интервью завершено!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                Ваш персональный профиль готов
              </Typography>
            </Box>

            <CardContent sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
              {/* Глиф */}
              <Paper 
                elevation={6} 
                sx={{ 
                  p: { xs: 4, md: 6 }, 
                  mb: { xs: 3, md: 4 }, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  borderRadius: { xs: 3, md: 4 }
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ opacity: 0.9, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                  Ваш персональный глиф
                </Typography>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontSize: { xs: '3rem', md: '4rem' },
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
                  p: { xs: 3, md: 4 }, 
                  mb: { xs: 3, md: 4 },
                  borderRadius: 3,
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  borderLeft: '6px solid #667eea'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                  📊 Анализ профиля кандидата
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: { xs: '1rem', md: '1.1rem' },
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
                  p: { xs: 3, md: 4 }, 
                  mb: { xs: 3, md: 4 },
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.02)'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                  <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                  📈 Подробная статистика интервью
                </Typography>
                
                {/* Основные метрики */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 3 }, mb: { xs: 3, md: 4 } }}>
                  <Box sx={{ textAlign: 'center', minWidth: { xs: 120, md: 140 }, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' } }}>
                    <Speed sx={{ fontSize: { xs: 32, md: 40 }, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" color="primary.main" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                      {formatDuration(getSafeNumber(sessionResults.result?.total_time))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                      Общее время
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: { xs: 120, md: 140 }, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' } }}>
                    <EmojiEvents sx={{ fontSize: { xs: 32, md: 40 }, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" color="success.main" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                      {Math.round(getSafePercentage(sessionResults.result?.completion_rate || (answers.length / totalQuestions) * 100))}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                      Завершено
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: { xs: 120, md: 140 }, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' } }}>
                    <TimerOutlined sx={{ fontSize: { xs: 32, md: 40 }, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" color="warning.main" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                      {formatDuration(getSafeNumber(sessionResults.result?.average_time_per_question) || 
                        (sessionResults.answerTimes.length > 0 ? 
                          sessionResults.answerTimes.reduce((sum, time) => sum + time, 0) / sessionResults.answerTimes.length : 
                          0))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                      Среднее время
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: { xs: 120, md: 140 }, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' } }}>
                    <QuestionAnswer sx={{ fontSize: { xs: 32, md: 40 }, color: 'info.main', mb: 1 }} />
                    <Typography variant="h4" color="info.main" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                      {getSafeNumber(sessionResults.result?.questions_answered) || answers.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                      Ответов дано
                    </Typography>
                  </Box>
                </Box>

                {/* График времени по вопросам */}
                {sessionResults.answerTimes.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontSize: { xs: '1rem', md: '1.25rem' } }}>
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
                          sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>

              {/* Кнопки действий */}
              <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 }, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Download />}
                  onClick={downloadReport}
                  sx={{ 
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.2, md: 1.5 },
                    fontSize: { xs: '0.9rem', md: '1rem' },
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
                                      onClick={() => restart()}
                  sx={{ 
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.2, md: 1.5 },
                    fontSize: { xs: '0.9rem', md: '1rem' },
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
      </Box>
    </Box>
  );
};

export default HRBotPage; 