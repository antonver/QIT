import { useState, useEffect, useCallback } from 'react';
import { getTest, submitTestAnswer, autosaveTest } from '../services/api';

interface TestQuestion {
  id: string;
  number: number;
  text: string;
  description?: string;
  options: Array<{
    id: string;
    text: string;
  }>;
}

interface Test {
  id: string;
  totalQuestions: number;
  timeLimit: number; // in seconds
  currentQuestion: TestQuestion;
}

interface TestAnswer {
  questionId: string;
  answerId: string;
  timestamp: string;
}

interface TestState {
  test: Test | null;
  currentQuestion: TestQuestion | null;
  answers: TestAnswer[];
  progress: number;
  timeLeft: number;
  isLoading: boolean;
  error: string | null;
}

export const useTest = () => {
  const [testState, setTestState] = useState<TestState>({
    test: null,
    currentQuestion: null,
    answers: [],
    progress: 0,
    timeLeft: 1200, // 20 minutes default
    isLoading: false,
    error: null
  });

  // Start test
  const startTest = useCallback(async () => {
    try {
      setTestState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const testData = await getTest();
      
      setTestState(prev => ({
        ...prev,
        test: testData,
        currentQuestion: testData.currentQuestion,
        timeLeft: testData.timeLimit || 1200,
        isLoading: false
      }));
    } catch (error) {
      setTestState(prev => ({
        ...prev,
        error: 'Failed to load test',
        isLoading: false
      }));
      console.error('Failed to start test:', error);
    }
  }, []);

  // Submit answer
  const submitAnswer = useCallback(async (answerId: string): Promise<any> => {
    if (!testState.currentQuestion) {
      throw new Error('No current question');
    }

    try {
      const answer: TestAnswer = {
        questionId: testState.currentQuestion.id,
        answerId,
        timestamp: new Date().toISOString()
      };

      // Add answer to local state
      setTestState(prev => ({
        ...prev,
        answers: [...prev.answers, answer]
      }));

      // Submit to backend
      const result = await submitTestAnswer(testState.test!.id, answer);

      // Check if test is complete
      if (result.isComplete) {
        return result;
      }

      // Move to next question
      if (result.nextQuestion) {
        setTestState(prev => ({
          ...prev,
          currentQuestion: result.nextQuestion,
          progress: ((prev.answers.length + 1) / prev.test!.totalQuestions) * 100
        }));
      }

      return result;
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw error;
    }
  }, [testState.currentQuestion, testState.test, testState.answers]);

  // Autosave function
  const autosave = useCallback(async () => {
    if (!testState.test || testState.answers.length === 0) return;

    try {
      await autosaveTest(testState.test.id, {
        answers: testState.answers,
        currentQuestion: testState.currentQuestion
      });
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  }, [testState.test, testState.answers, testState.currentQuestion]);

  // Countdown timer
  useEffect(() => {
    if (!testState.test || testState.timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTestState(prev => ({
        ...prev,
        timeLeft: prev.timeLeft - 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [testState.test, testState.timeLeft]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (testState.timeLeft <= 0 && testState.test) {
      // Auto-submit current test
      console.log('Time ran out, auto-submitting test');
      // You can implement auto-submission logic here
    }
  }, [testState.timeLeft, testState.test]);

  // Calculate progress
  useEffect(() => {
    if (testState.test && testState.answers.length > 0) {
      const progress = (testState.answers.length / testState.test.totalQuestions) * 100;
      setTestState(prev => ({ ...prev, progress }));
    }
  }, [testState.answers.length, testState.test]);

  return {
    ...testState,
    startTest,
    submitAnswer,
    autosave
  };
}; 