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
  Divider
} from '@mui/material';
import {
  Work as WorkIcon,
  QuestionAnswer as QuestionIcon
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

const HrBot: React.FC = () => {
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

  // Загрузка позиций при монтировании
  useEffect(() => {
    const loadPositions = async () => {
      try {
        setLoading(true);
        console.log('Загружаем позиции...');
        console.log('Текущий пользователь:', currentUser);
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

  const getGlyphForPosition = (positionTitle: string): string => {
    const glyphMap: { [key: string]: string } = {
      'Frontend Developer': '🎨',
      'Backend Developer': '⚙️',
      'Full Stack Developer': '🔄',
      'DevOps Engineer': '🚀',
      'Data Scientist': '📊',
      'Product Manager': '📋',
      'UI/UX Designer': '🎭',
      'QA Engineer': '🔍'
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
    <Container maxWidth="md" sx={{ mt: 4 }}>
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
        <Box sx={{
          minHeight: '100vh',
          bgcolor: '#181820',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2
        }}>
          <Box sx={{
            width: '100%',
            maxWidth: 420,
            bgcolor: 'rgba(35, 43, 59, 0.95)',
            borderRadius: 4,
            p: { xs: 3, sm: 5 },
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '2px solid #7C3AED',
            mb: 4
          }}>
            <Typography variant="h4" align="center" sx={{
              color: 'white',
              fontWeight: 700,
              mb: 3,
              letterSpacing: 0.5
            }}>
              Выберите вакансию
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : positions.length === 0 ? (
              <Box textAlign="center" sx={{ py: 4 }}>
                <Typography variant="h6" color="#B0B0C3" gutterBottom>
                  Нет доступных позиций
                </Typography>
                <Typography variant="body2" color="#B0B0C3">
                  Обратитесь к администратору для добавления позиций
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ width: '100%', mb: 4 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500, mb: 1 }}>
                      Должность
                    </Typography>
                  </Box>
                  <Box sx={{
                    position: 'relative',
                    borderRadius: 2,
                    border: '2px solid #7C3AED',
                    bgcolor: '#232B3B',
                    mb: 2,
                    overflow: 'hidden',
                  }}>
                    <select
                      value={selectedPosition ? selectedPosition.id : ''}
                      onChange={e => {
                        const pos = positions.find(p => p.id === Number(e.target.value));
                        setSelectedPosition(pos || null);
                      }}
                      style={{
                        width: '100%',
                        padding: '18px 16px',
                        border: 'none',
                        background: 'transparent',
                        color: 'white',
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        outline: 'none',
                        appearance: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        boxShadow: 'none',
                      }}
                    >
                      <option value="" disabled>Выберите...</option>
                      {positions.map(position => (
                        <option key={position.id} value={position.id} style={{ color: '#232B3B', background: 'white', fontWeight: 500 }}>
                          {position.title}
                        </option>
                      ))}
                    </select>
                    {/* Кастомная стрелка */}
                    <Box sx={{
                      position: 'absolute',
                      right: 18,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: '#7C3AED',
                      fontSize: 24
                    }}>
                      ▼
                    </Box>
                  </Box>
                  {selectedPosition && selectedPosition.qualities && selectedPosition.qualities.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedPosition.qualities.map(quality => (
                        <Chip
                          key={quality.id}
                          label={quality.name}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.8rem', bgcolor: '#232B3B', color: 'white', borderColor: '#7C3AED', fontWeight: 500 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={!selectedPosition}
                  startIcon={<QuestionIcon />}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.15rem',
                    borderRadius: '16px',
                    py: 2,
                    boxShadow: 'none',
                    textTransform: 'none',
                    letterSpacing: 0.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #6D28D9 0%, #7C3AED 100%)',
                      boxShadow: '0 6px 32px rgba(139, 92, 246, 0.22)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => selectedPosition && handlePositionSelect(selectedPosition)}
                >
                  Начать интервью
                </Button>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Шаг 2: Интервью */}
      {activeStep === 1 && currentInterview && selectedPosition && (
        <Box>
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
            Интервью: {selectedPosition.title}
          </Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Вопрос {currentQuestionIndex + 1} из {currentInterview.questions.length}
              </Typography>
              <Chip 
                label={`${Math.round(((currentQuestionIndex + 1) / currentInterview.questions.length) * 100)}%`}
                color="primary"
                size="small"
              />
            </Box>
            
            <Typography variant="h6" sx={{ mb: 3 }}>
              {currentInterview.questions[currentQuestionIndex]?.text}
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Введите ваш ответ..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Box display="flex" justifyContent="space-between">
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                disabled={loading}
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

export default HrBot; 