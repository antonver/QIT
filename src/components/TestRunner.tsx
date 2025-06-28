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

interface TestRunnerProps {
  onComplete: (result: any) => void;
}

interface TestOption {
  id: number;
  text: string;
}

interface TestQuestion {
  id: number;
  text: string;
  options: TestOption[];
}

interface Test {
  id: number;
  title: string;
  questions: TestQuestion[];
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
        // For now, use test ID 1 - you can make this configurable
        const testData = await fetch('/api/test/1?lang=ru');
        const testJson = await testData.json();
        setTest(testJson);
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

      // Submit answers
      const response = await fetch(`/api/test/${test.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: answersArray })
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      const result = await response.json();
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
          <Chip label={`${Math.round(progress)}%`} color="primary" size="small" />
        </Box>
        <LinearProgress variant="determinate" value={progress} />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentQuestion.text}
          </Typography>

          <RadioGroup
            value={answers[currentQuestion.id]?.toString() || ''}
            onChange={(e) => handleAnswerSelect(e.target.value)}
          >
            {currentQuestion.options.map((option: TestOption) => (
              <FormControlLabel
                key={option.id}
                value={option.id.toString()}
                control={<Radio />}
                label={option.text}
                sx={{ 
                  mb: 1, 
                  p: 2, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1,
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              />
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        {currentQuestionIndex === test.questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length < test.questions.length}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
          >
            Next
          </Button>
        )}
      </Box>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {Object.keys(answers).length} of {test.questions.length} questions answered
        </Typography>
      </Box>
    </Box>
  );
};

export default TestRunner; 