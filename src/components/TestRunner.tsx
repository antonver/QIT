import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  LinearProgress, 
  RadioGroup, 
  FormControlLabel, 
  Radio,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { getTest, submitTestAnswer } from '../services/api';
import type { Test, Answer } from '../types/api';

interface TestRunnerProps {
  onComplete: (result: any) => void;
}

const TestRunner: React.FC<TestRunnerProps> = ({ onComplete }) => {
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load test data
  useEffect(() => {
    const loadTest = async () => {
      try {
        setIsLoading(true);
        // Use test ID 1 - you can make this configurable
        const testData = await getTest(1);
        setTest(testData);
      } catch (error) {
        console.error('Failed to load test:', error);
        setError('Failed to load test. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTest();
  }, []);

  const currentQuestion = test?.questions[currentQuestionIndex];

  const handleAnswerSelect = (answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion!.id]: parseInt(answerId)
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (test?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!test) return;

    try {
      setIsSubmitting(true);
      
      // Convert answers to the format expected by the API
      const answersArray = Object.entries(answers).map(([questionId, answerId]) => ({
        question_id: parseInt(questionId),
        answer_id: answerId
      }));

      // Submit answers using the API service
      const result = await submitTestAnswer(test.id, answersArray);
      onComplete(result);
    } catch (error) {
      console.error('Failed to submit test:', error);
      setError('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = test ? ((currentQuestionIndex + 1) / test.questions.length) * 100 : 0;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading test...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!test || !currentQuestion) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography>No test available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {test.title}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            Question {currentQuestionIndex + 1} of {test.questions.length}
          </Typography>
          <Chip label={`