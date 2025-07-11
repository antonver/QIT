import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Work as WorkIcon,
  QuestionAnswer as QuestionIcon,
  Assessment as AssessmentIcon,
  EmojiEvents as TrophyIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  School as SchoolIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { getHrPositions, createInterview, submitAnswer, completeInterview } from '../services/aeonMessengerApi';

interface Position {
  id: number;
  title: string;
  qualities?: Quality[];
  is_active: boolean;
}

interface Quality {
  id: number;
  name: string;
}

interface Question {
  id: number;
  text: string;
  type: 'text' | 'scale' | 'choice';
  category?: string;
  scale?: { min: number; max: number };
}

interface Interview {
  id: number;
  position_id: number;
  questions: Question[];
  answers: { [key: string]: string };
  status: 'in_progress' | 'completed';
  score?: number;
  max_score: number;
}

interface AnalysisResult {
  glyph: string;
  title: string;
  description: string;
  status: string;
  score: number;
  max_score: number;
  recommendations: string[];
}

const HRBotNew: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.aeonChat);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90); // 90 секунд на вопрос
  const [timerActive, setTimerActive] = useState(false);

  // Таймер для вопросов
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            handleAnswerSubmit(); // Автоотправка ответа
            return 90;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Загрузка позиций при монтировании
  useEffect(() => {
    const loadPositions = async () => {
      try {
        setLoading(true);
        console.log('Загружаем позиции...');
        const positionsData = await getHrPositions();
        console.log('Полученные позиции:', positionsData);
        setPositions(positionsData.filter(p => p.is_active));
      } catch (error) {
        console.error('Error loading positions:', error);
        setError('Ошибка при загрузке позиций: ' + (error as any)?.message || 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    loadPositions();
  }, [currentUser]);

  const handlePositionSelect = async (position: Position) => {
    try {
      setLoading(true);
      setError(null);
      
      // Создаем новое интервью
      const interview = await createInterview({
        position_id: position.id
      });
      
      setSelectedPosition(position);
      setCurrentInterview(interview);
      setActiveStep(1);
      setCurrentQuestionIndex(0);
      setAnswer('');
      setTimeLeft(90);
      setTimerActive(true);
    } catch (error) {
      console.error('Error creating interview:', error);
      setError('Ошибка при создании интервью');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentInterview || !answer.trim()) return;

    try {
      setLoading(true);
      setTimerActive(false);
      
      // Сохраняем ответ
      await submitAnswer(currentInterview.id, currentQuestionIndex, answer);
      
      // Обновляем интервью
      setCurrentInterview(prev => prev ? {
        ...prev,
        answers: {
          ...prev.answers,
          [currentQuestionIndex.toString()]: answer
        }
      } : null);

      // Переходим к следующему вопросу или завершаем
      if (currentQuestionIndex < currentInterview.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setAnswer('');
        setTimeLeft(90);
        setTimerActive(true);
      } else {
        // Завершаем интервью
        const result = await completeInterview(currentInterview.id);
        setAnalysisResult({
          glyph: getGlyphForPosition(selectedPosition?.title || ''),
          title: `Анализ интервью: ${selectedPosition?.title}`,
          description: generateAnalysisDescription(result.score, result.max_score),
          status: getStatusForScore(result.score, result.max_score),
          score: result.score,
          max_score: result.max_score,
          recommendations: generateRecommendations(result.score, result.max_score, selectedPosition?.qualities || [])
        });
        setActiveStep(2);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Ошибка при сохранении ответа');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      const positionsData = await getHrPositions();
      setPositions(positionsData.filter(p => p.is_active));
    } catch (error) {
      console.error('Error refreshing positions:', error);
      setError('Ошибка при обновлении списка позиций');
    } finally {
      setLoading(false);
    }
  };

  const getGlyphForPosition = (positionTitle: string): string => {
    const glyphMap: { [key: string]: string } = {
      'Frontend Developer': '🎨',
      'Backend Developer': '⚙️',
      'Full Stack Developer': '🔄',
      'DevOps Engineer': '🚀',
      'Data Scientist': '📊',
      'Product Manager': '📋',
      'UI/UX Designer': '🎭',
      'QA Engineer': '🔍',
      'Mobile Developer': '📱',
      'System Administrator': '🖥️',
      'Network Engineer': '🌐',
      'Security Engineer': '🔒'
    };
    return glyphMap[positionTitle] || '💼';
  };

  const generateAnalysisDescription = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) {
      return 'Отличные результаты! Вы показали высокий уровень компетенций и готовы к работе в данной позиции.';
    } else if (percentage >= 60) {
      return 'Хорошие результаты. Есть потенциал для развития и роста в данной области.';
    } else {
      return 'Результаты требуют улучшения. Рекомендуется дополнительное обучение и практика.';
    }
  };

  const getStatusForScore = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'Высокий уровень';
    if (percentage >= 60) return 'Средний уровень';
    return 'Требует развития';
  };

  const generateRecommendations = (score: number, maxScore: number, qualities: Quality[]): string[] => {
    const percentage = (score / maxScore) * 100;
    const recommendations: string[] = [];

    if (percentage < 80) {
      recommendations.push('Продолжайте развивать ключевые навыки для данной позиции');
      recommendations.push('Изучите современные технологии и инструменты в вашей области');
    }

    if (percentage < 60) {
      recommendations.push('Рассмотрите возможность дополнительного обучения или курсов');
      recommendations.push('Практикуйтесь в решении реальных задач и проектов');
    }

    if (qualities.length > 0) {
      recommendations.push(`Особое внимание уделите развитию: ${qualities.map(q => q.name).join(', ')}`);
    }

    return recommendations;
  };

  const handleRestart = () => {
    setSelectedPosition(null);
    setCurrentInterview(null);
    setCurrentQuestionIndex(0);
    setAnswer('');
    setAnalysisResult(null);
    setActiveStep(0);
    setError(null);
    setTimeLeft(90);
    setTimerActive(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const steps = ['Выбор позиции', 'Интервью', 'Результаты'];

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Для прохождения интервью необходимо авторизоваться
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        🤖 HR Bot - Умное интервью
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Шаг 1: Выбор позиции */}
      {activeStep === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Выберите позицию для интервью
            </Typography>
            <Tooltip title="Обновить список позиций">
              <IconButton onClick={handleRefreshPositions} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Box>
          ) : positions.length === 0 ? (
            <Box textAlign="center" sx={{ py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Нет доступных позиций
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Обратитесь к администратору для добавления позиций
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {positions.map((position) => (
                <Card 
                  key={position.id}
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => handlePositionSelect(position)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: 'primary.main'
                      }}
                    >
                      <WorkIcon />
                    </Avatar>
                    
                    <Typography variant="h6" gutterBottom>
                      {position.title}
                    </Typography>
                    
                    {position.qualities && position.qualities.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Ключевые качества:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                          {position.qualities.map((quality) => (
                            <Chip
                              key={quality.id}
                              label={quality.name}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<QuestionIcon />}
                      sx={{ mt: 2 }}
                    >
                      Начать интервью
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Шаг 2: Интервью */}
      {activeStep === 1 && currentInterview && selectedPosition && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => setActiveStep(0)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" gutterBottom>
              Интервью: {selectedPosition.title}
            </Typography>
          </Box>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Прогресс и таймер */}
            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Вопрос {currentQuestionIndex + 1} из {currentInterview.questions.length}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <TimerIcon color="primary" />
                  <Typography variant="body2" color={timeLeft < 30 ? 'error' : 'text.secondary'}>
                    {formatTime(timeLeft)}
                  </Typography>
                </Box>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={((currentQuestionIndex + 1) / currentInterview.questions.length) * 100}
                sx={{ mb: 1 }}
              />
              
              <LinearProgress 
                variant="determinate" 
                value={(timeLeft / 90) * 100}
                color={timeLeft < 30 ? 'error' : 'primary'}
                sx={{ height: 4 }}
              />
            </Box>
            
            <Typography variant="h6" sx={{ mb: 3 }}>
              {currentInterview.questions[currentQuestionIndex]?.text}
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              placeholder="Введите ваш ответ..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <Box display="flex" justifyContent="space-between">
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                disabled={loading}
                startIcon={<ArrowBackIcon />}
              >
                Назад
              </Button>
              
              <Button
                variant="contained"
                onClick={handleAnswerSubmit}
                disabled={!answer.trim() || loading}
                endIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {currentQuestionIndex === currentInterview.questions.length - 1 ? 'Завершить' : 'Следующий вопрос'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Шаг 3: Результаты */}
      {activeStep === 2 && analysisResult && (
        <Box>
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
            🎯 Результаты интервью
          </Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
              <Avatar sx={{ width: 60, height: 60, fontSize: '2rem', mr: 2 }}>
                {analysisResult.glyph}
              </Avatar>
              <Box>
                <Typography variant="h6">{analysisResult.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Статус: {analysisResult.status}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              {analysisResult.description}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📊 Оценка: {analysisResult.score}/{analysisResult.max_score} 
                ({Math.round((analysisResult.score / analysisResult.max_score) * 100)}%)
              </Typography>
              
              <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${(analysisResult.score / analysisResult.max_score) * 100}%`,
                    height: 8,
                    bgcolor: 'primary.main',
                    transition: 'width 0.5s ease-in-out'
                  }}
                />
              </Box>
            </Box>
            
            {analysisResult.recommendations.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  💡 Рекомендации:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {analysisResult.recommendations.map((rec, index) => (
                    <Typography key={index} component="li" variant="body2" sx={{ mb: 1 }}>
                      {rec}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
          
          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              variant="contained"
              onClick={handleRestart}
              startIcon={<WorkIcon />}
            >
              Пройти другое интервью
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default HRBotNew; 