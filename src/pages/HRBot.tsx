import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Check as CheckIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';


interface Position {
  id: number;
  title: string;
  description?: string;
}

interface Question {
  id: number;
  text: string;
  type: string;
  max_length: number;
}

interface Interview {
  id: number;
  position_id: number;
  status: string;
  score?: number;
  max_score: number;
  questions: Question[];
  answers: Record<string, string>;
}

const HrBot: React.FC = () => {
  const [positions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ score: number; max_score: number; percentage: number } | null>(null);

  // Проверяем, есть ли активное интервью
  useEffect(() => {
    checkCurrentInterview();
  }, []);

  const checkCurrentInterview = async () => {
    try {
      setLoading(true);
      // Здесь будет API вызов для проверки активного интервью
      // const response = await fetch('/api/v1/hr/interviews/current');
      // if (response.ok) {
      //   const interview = await response.json();
      //   setCurrentInterview(interview);
      //   setActiveStep(interview.questions.length);
      // }
    } catch (error) {
      console.error('Error checking current interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async () => {
    try {
      setLoading(true);
      // Здесь будет API вызов для загрузки позиций
      // const response = await fetch('/api/v1/hr/positions');
      // const data = await response.json();
      // setPositions(data);
    } catch (error) {
      console.error('Error loading positions:', error);
      setError('Ошибка загрузки позиций');
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async (position: Position) => {
    try {
      setLoading(true);
      setError(null);
      
      // Здесь будет API вызов для создания интервью
      // const response = await fetch('/api/v1/hr/interviews', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ position_id: position.id })
      // });
      // const interview = await response.json();
      
      // Мок данные для демонстрации
      const mockInterview: Interview = {
        id: 1,
        position_id: position.id,
        status: 'in_progress',
        max_score: 100,
        questions: [
          { id: 0, text: 'Расскажите о своем опыте работы в данной области', type: 'text', max_length: 500 },
          { id: 1, text: 'Какие у вас есть сильные стороны?', type: 'text', max_length: 500 },
          { id: 2, text: 'Как вы справляетесь со стрессовыми ситуациями?', type: 'text', max_length: 500 },
          { id: 3, text: 'Расскажите о проекте, которым вы гордитесь', type: 'text', max_length: 500 },
          { id: 4, text: 'Как вы планируете свое время?', type: 'text', max_length: 500 },
        ],
        answers: {}
      };
      
      setCurrentInterview(mockInterview);
      setSelectedPosition(position);
      setActiveStep(0);
    } catch (error) {
      console.error('Error starting interview:', error);
      setError('Ошибка запуска интервью');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionIndex: number, answer: string) => {
    try {
      setAnswers(prev => ({ ...prev, [questionIndex.toString()]: answer }));
      
      // Здесь будет API вызов для сохранения ответа
      // await fetch(`/api/v1/hr/interviews/${currentInterview?.id}/answer`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ question_index: questionIndex, answer })
      // });
      
      if (questionIndex < (currentInterview?.questions.length || 0) - 1) {
        setActiveStep(questionIndex + 1);
      } else {
        // Интервью завершено
        await completeInterview();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Ошибка сохранения ответа');
    }
  };

  const completeInterview = async () => {
    try {
      setLoading(true);
      
      // Здесь будет API вызов для завершения интервью
      // const response = await fetch(`/api/v1/hr/interviews/${currentInterview?.id}/complete`, {
      //   method: 'POST'
      // });
      // const results = await response.json();
      
      // Мок результаты
      const mockResults = {
        score: Math.floor(Math.random() * 40) + 60, // 60-100 баллов
        max_score: 100,
        percentage: Math.floor(Math.random() * 40) + 60
      };
      
      setResults(mockResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error completing interview:', error);
      setError('Ошибка завершения интервью');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const currentAnswer = answers[activeStep.toString()];
    if (currentAnswer && currentAnswer.trim()) {
      submitAnswer(activeStep, currentAnswer);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setCurrentInterview(null);
    setSelectedPosition(null);
    setActiveStep(0);
    setAnswers({});
    setShowResults(false);
    setResults(null);
    setError(null);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Загрузка...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={handleReset} variant="contained">
          Попробовать снова
        </Button>
      </Container>
    );
  }

  if (showResults && results) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Интервью завершено!
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Ваш результат: {results.score}/{results.max_score} ({results.percentage}%)
          </Typography>
          <Chip
            label={results.percentage >= 80 ? 'Отлично!' : results.percentage >= 60 ? 'Хорошо' : 'Требует улучшения'}
            color={results.percentage >= 80 ? 'success' : results.percentage >= 60 ? 'warning' : 'error'}
            sx={{ mb: 3 }}
          />
          <Button onClick={handleReset} variant="contained" size="large">
            Пройти еще раз
          </Button>
        </Paper>
      </Container>
    );
  }

  if (currentInterview) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AssignmentIcon sx={{ mr: 2, fontSize: 30 }} />
            <Box>
              <Typography variant="h5">
                Интервью: {selectedPosition?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Вопрос {activeStep + 1} из {currentInterview.questions.length}
              </Typography>
            </Box>
          </Box>

          <Stepper activeStep={activeStep} orientation="vertical">
            {currentInterview.questions.map((question, index) => (
              <Step key={question.id}>
                <StepLabel>
                  <Typography variant="h6">
                    {question.text}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    placeholder="Введите ваш ответ..."
                    value={answers[index.toString()] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [index.toString()]: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!answers[index.toString()]?.trim()}
                      sx={{ mr: 1 }}
                    >
                      {index === currentInterview.questions.length - 1 ? 'Завершить' : 'Следующий вопрос'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                    >
                      Назад
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        HR Bot - Система интервью
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Выберите позицию для интервью:
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {positions.map((position) => (
            <Box key={position.id} sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {position.title}
                  </Typography>
                  {position.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {position.description}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={() => startInterview(position)}
                    fullWidth
                  >
                    Начать интервью
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {positions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Нет доступных позиций для интервью
            </Typography>
            <Button onClick={loadPositions} variant="outlined" sx={{ mt: 2 }}>
              Обновить список
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default HrBot; 