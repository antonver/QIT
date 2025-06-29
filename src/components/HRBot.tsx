import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { getTest, submitTestAnswer, autosaveTest, getTestResult } from '../services/api';
import type { Test, UserAnswer, SubmitAnswersResponse, GetResultResponse } from '../types/api';

interface HRBotProps {
  testId: number;
  lang?: string;
}

const HRBot: React.FC<HRBotProps> = ({ testId, lang = 'ru' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const questionRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [test, setTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: number]: number }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState<GetResultResponse | null>(null);
  
  // Loading states
  const [isLoadingTest, setIsLoadingTest] = useState(true);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  
  // Error states
  const [error, setError] = useState<string>('');

  // Smooth scroll to question
  const scrollToQuestion = useCallback(() => {
    if (questionRef.current) {
      questionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  // Fetch test details
  const fetchTest = useCallback(async () => {
    try {
      setIsLoadingTest(true);
      setError('');
      
      const testData = await getTest(testId, lang as 'ru' | 'en');
      setTest(testData);
    } catch (err) {
      console.error('Failed to fetch test:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load test');
      }
    } finally {
      setIsLoadingTest(false);
    }
  }, [testId, lang]);

  // Autosave answers
  const autosaveAnswers = useCallback(async () => {
    if (!test || Object.keys(answers).length === 0) return;
    
    try {
      setIsAutosaving(true);
      
      const answersArray: UserAnswer[] = Object.entries(answers).map(([questionId, answerId]) => ({
        question_id: parseInt(questionId),
        answer_id: answerId
      }));
      
      await autosaveTest(testId, answersArray);
    } catch (err) {
      console.error('Autosave error:', err);
      // Don't show error to user for autosave failures
    } finally {
      setIsAutosaving(false);
    }
  }, [test, answers, testId]);

  // Submit answers and get results
  const submitAnswers = useCallback(async () => {
    if (!test) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const answersArray: UserAnswer[] = Object.entries(answers).map(([questionId, answerId]) => ({
        question_id: parseInt(questionId),
        answer_id: answerId
      }));
      
      // Submit answers
      const submitData: SubmitAnswersResponse = await submitTestAnswer(testId, answersArray);
      
      // Fetch results
      setIsLoadingResult(true);
      const resultData: GetResultResponse = await getTestResult(submitData.result_id);
      setResult(resultData);
      
    } catch (err) {
      console.error('Submit error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to submit test');
      }
    } finally {
      setIsSubmitting(false);
      setIsLoadingResult(false);
    }
  }, [test, answers, testId]);

  // Handle answer selection
  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  // Handle navigation with smooth scroll
  const handleNext = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Smooth scroll to next question after state update
      setTimeout(scrollToQuestion, 100);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Smooth scroll to previous question after state update
      setTimeout(scrollToQuestion, 100);
    }
  };

  // Load test on mount
  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        autosaveAnswers();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autosaveAnswers]);

  // Calculate progress
  const progress = test ? ((currentQuestionIndex + 1) / test.questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  // Loading state
  if (isLoadingTest) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        minHeight: isMobile ? '60vh' : '50vh'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading test...</Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error && !test) {
    return (
      <Box sx={{ textAlign: 'center', p: isMobile ? 2 : 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={fetchTest}>
          Retry
        </Button>
      </Box>
    );
  }

  // Results display
  if (result) {
    return (
      <Box sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        p: isMobile ? 2 : 3,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom align="center">
          Test Results
        </Typography>
        
        <Card sx={{ mb: 3, mx: isMobile ? 0 : 'auto' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
              Score: {result.score}%
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {result.details}
            </Typography>
          </CardContent>
        </Card>
        
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary"
            size={isMobile ? "large" : "medium"}
            fullWidth={isMobile}
            onClick={() => {
              setResult(null);
              setAnswers({});
              setCurrentQuestionIndex(0);
              fetchTest();
            }}
            sx={{ 
              mt: 2,
              maxWidth: isMobile ? '100%' : 300
            }}
          >
            Начать тест заново
          </Button>
        </Box>
      </Box>
    );
  }

  // No test available
  if (!test) {
    return (
      <Box sx={{ textAlign: 'center', p: isMobile ? 2 : 3 }}>
        <Typography>No test available</Typography>
      </Box>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      p: isMobile ? 1 : 3,
      minHeight: '100vh'
    }}>
      {/* Test Header */}
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        gutterBottom 
        align="center"
        sx={{ mb: isMobile ? 2 : 3 }}
      >
        {test.title}
      </Typography>

      {/* Progress Bar */}
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 1,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0
        }}>
          <Typography variant="body2">
            Question {currentQuestionIndex + 1} of {test.questions.length}
          </Typography>
          <Chip 
            label={`${Math.round(progress)}%`} 
            color="primary" 
            size="small" 
            sx={{ alignSelf: isMobile ? 'flex-start' : 'center' }}
          />
        </Box>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {answeredCount} of {test.questions.length} questions answered
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: isMobile ? 2 : 3 }}>{error}</Alert>
      )}

      {/* Autosave Indicator */}
      {isAutosaving && (
        <Alert severity="info" sx={{ mb: isMobile ? 2 : 3 }}>
          Autosaving your progress...
        </Alert>
      )}

      {/* Question Card */}
      <Card 
        ref={questionRef}
        sx={{ 
          mb: isMobile ? 2 : 3,
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Typography 
            variant={isMobile ? "h6" : "h6"} 
            gutterBottom
            sx={{ mb: isMobile ? 2 : 3 }}
          >
            {currentQuestion.text}
          </Typography>

          <RadioGroup
            value={answers[currentQuestion.id]?.toString() || ''}
            onChange={(e) => handleAnswerSelect(currentQuestion.id, parseInt(e.target.value))}
          >
            {currentQuestion.answers.map((answer) => (
              <FormControlLabel
                key={answer.id}
                value={answer.id.toString()}
                control={<Radio />}
                label={answer.text}
                sx={{ 
                  mb: isMobile ? 1.5 : 1, 
                  p: isMobile ? 1.5 : 2, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1,
                  '&:hover': { 
                    backgroundColor: '#f5f5f5',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  '&.Mui-checked': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.light + '20'
                  }
                }}
              />
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: isMobile ? 2 : 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          fullWidth={isMobile}
          size={isMobile ? "large" : "medium"}
        >
          Previous
        </Button>

        {currentQuestionIndex === test.questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={submitAnswers}
            disabled={isSubmitting || isLoadingResult || answeredCount < test.questions.length}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            {isSubmitting ? 'Submitting...' : isLoadingResult ? 'Loading Results...' : 'Submit Test'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Next
          </Button>
        )}
      </Box>

      {/* Submit Progress */}
      {(isSubmitting || isLoadingResult) && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {isSubmitting ? 'Submitting your answers...' : 'Loading your results...'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HRBot; 