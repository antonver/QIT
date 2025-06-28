import { useState, useEffect, useCallback } from 'react';
import { getTest, submitTestAnswer, autosaveTest } from '../services/api';

interface TestState {
  test: any | null;
  currentQuestion: any | null;
  answers: any[];
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
    timeLeft: 3600, // 1 hour
    isLoading: false,
    error: null
  });

  const startTest = useCallback(async (testId: number = 1) => {
    try {
      setTestState(prev => ({ ...prev, isLoading: true, error: null }));
      const testData = await getTest(testId);
      
      setTestState(prev => ({
        ...prev,
        test: testData,
        currentQuestion: testData.questions[0],
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to start test:', error);
      setTestState(prev => ({
        ...prev,
        error: 'Failed to load test',
        isLoading: false
      }));
    }
  }, []);

  const submitAnswer = useCallback(async (answer: any) => {
    if (!testState.test) return;

    try {
      const result = await submitTestAnswer(testState.test.id, answer);
      
      // Update answers
      const newAnswers = [...testState.answers, answer];
      const progress = (newAnswers.length / testState.test.questions.length) * 100;
      
      setTestState(prev => ({
        ...prev,
        answers: newAnswers,
        progress
      }));

      return result;
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw error;
    }
  }, [testState.test, testState.answers]);

  const saveProgress = useCallback(async () => {
    if (!testState.test) return;

    try {
      await autosaveTest(testState.test.id, testState.answers);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [testState.test, testState.answers]);

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
    saveProgress
  };
}; 