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
import { useTest } from '../hooks/useTest';
import { useAutosave } from '../hooks/useAutosave';

interface TestRunnerProps {
  onComplete: (result: any) => void;
}

interface TestOption {
  id: string;
  text: string;
}

const TestRunner: React.FC<TestRunnerProps> = ({ onComplete }) => {
  const { 
    test, 
    currentQuestion, 
    answers, 
    progress, 
    timeLeft, 
    isLoading, 
    error,
    submitAnswer, 
    startTest 
  } = useTest();
  
  const { saveProgress, loadProgress } = useAutosave();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  // Load saved progress on mount
  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      // Restore test state from localStorage
      console.log('Loaded saved progress:', saved);
    }
  }, [loadProgress]);

  // Start test on mount
  useEffect(() => {
    if (!test && !isLoading) {
      startTest();
    }
  }, [test, isLoading, startTest]);

  // Autosave every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (test && answers.length > 0) {
        saveProgress({ test, answers, currentQuestion });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [test, answers, currentQuestion, saveProgress]);

  // Handle answer selection
  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    // Autosave on answer change
    if (test) {
      saveProgress({ test, answers, currentQuestion });
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;

    try {
      const result = await submitAnswer(selectedAnswer);
      setSelectedAnswer('');
      
      // Check if test is complete
      if (result.isComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading test...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error" gutterBottom>
          Error loading test: {error}
        </Typography>
        <Button variant="contained" onClick={startTest}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!test || !currentQuestion) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>No test available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Header with progress and timer */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Question {currentQuestion.number} of {test.totalQuestions}
            </Typography>
            <Chip 
              label={formatTime(timeLeft)} 
              color={timeLeft < 300 ? 'error' : 'primary'}
              variant="outlined"
            />
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}% Complete
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {timeLeft < 300 ? 'Time running out!' : 'Time remaining'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Question */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {currentQuestion.text}
          </Typography>
          
          {currentQuestion.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {currentQuestion.description}
            </Typography>
          )}

          {/* Answer options */}
          <RadioGroup
            value={selectedAnswer}
            onChange={(e) => handleAnswerSelect(e.target.value)}
          >
            {currentQuestion.options.map((option: TestOption) => (
              <FormControlLabel
                key={option.id}
                value={option.id}
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

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          disabled={currentQuestion.number === 1}
          onClick={() => {/* Handle previous question */}}
        >
          Previous
        </Button>
        
        <Button 
          variant="contained" 
          disabled={!selectedAnswer}
          onClick={handleSubmitAnswer}
        >
          {currentQuestion.number === test.totalQuestions ? 'Finish Test' : 'Next Question'}
        </Button>
      </Box>
    </Box>
  );
};

export default TestRunner; 