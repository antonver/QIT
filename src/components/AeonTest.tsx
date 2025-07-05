import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider
} from '@mui/material';
import { hrBotAPI } from '../services/hrBotApi';
import type { Question, GlyphResponse } from '../services/hrBotApi';
import type { AeonSummary } from '../types/api';

interface AeonTestProps {
  sessionToken: string;
  onComplete?: (summary: AeonSummary, glyph: GlyphResponse) => void;
}

const AeonTest: React.FC<AeonTestProps> = ({ sessionToken, onComplete }) => {
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  
  // State management
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [summary, setSummary] = useState<AeonSummary | null>(null);
  const [glyphData, setGlyphData] = useState<GlyphResponse | null>(null);
  const [showGlyph, setShowGlyph] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  
  // Loading states
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [isGeneratingGlyph, setIsGeneratingGlyph] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Error states
  const [error, setError] = useState<string>('');

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            // Auto-submit when time runs out
            if (currentAnswer.trim()) {
              handleSubmitAnswer(currentAnswer.trim());
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, timeLeft, currentAnswer]);

  // Get next question using improved API
  const fetchNextQuestion = useCallback(async () => {
    try {
      setIsLoadingQuestion(true);
      setError('');
      
      // Check if we've reached 10 questions
      if (questionNumber >= 10) {
        console.log('Reached 10 questions, generating summary...');
        await handleGenerateSummary();
        return;
      }
      
      console.log(`Fetching question ${questionNumber + 1}/10...`);
      
      // Use improved hrBotAPI instead of the old API
      const questionData = await hrBotAPI.getNextQuestion(sessionToken, {
        current_answers: answers,
        question_number: questionNumber
      });
      
      if (questionData) {
        setCurrentQuestion(questionData);
        setCurrentAnswer(''); // Clear the form
        setTimeLeft(90); // Reset timer
        setIsTimerRunning(true); // Start timer
        
        console.log(`Question ${questionNumber + 1} loaded:`, questionData.text.substring(0, 50) + '...');
        
        // Focus on the text field
        setTimeout(() => {
          if (textFieldRef.current) {
            textFieldRef.current.focus();
          }
        }, 100);
      } else {
        // No more questions, generate summary
        console.log('No more questions available, generating summary...');
        await handleGenerateSummary();
      }
      
    } catch (err) {
      console.error('Failed to fetch question:', err);
      setError('Не удалось загрузить вопрос. Попробуйте еще раз.');
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [sessionToken, answers, questionNumber]);

  // Save answer using improved API
  const saveCurrentAnswer = useCallback(async (answer: string) => {
    if (!currentQuestion) return;
    
    try {
      setIsSavingAnswer(true);
      setIsTimerRunning(false); // Stop timer
      
      console.log(`Saving answer for question ${questionNumber} (${currentQuestion.id})...`);
      
      // Use improved hrBotAPI
      await hrBotAPI.submitAnswer(sessionToken, {
        question_id: currentQuestion.id,
        answer: answer
      });
      
      // Save answer locally
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: answer
      }));
      
      // Clear the form
      setCurrentAnswer('');
      
      // Increment question number
      setQuestionNumber(prev => {
        const newNumber = prev + 1;
        console.log(`Question number incremented to ${newNumber}/10`);
        return newNumber;
      });
      
      // Get next question after saving
      setTimeout(() => {
        fetchNextQuestion();
      }, 500);
      
    } catch (err) {
      console.error('Failed to save answer:', err);
      setError('Не удалось сохранить ответ. Попробуйте еще раз.');
    } finally {
      setIsSavingAnswer(false);
    }
  }, [currentQuestion, sessionToken, fetchNextQuestion, questionNumber]);

  // Generate summary using improved API
  const handleGenerateSummary = useCallback(async () => {
    try {
      setError('');
      setIsTimerRunning(false); // Stop timer
      
      // Use improved hrBotAPI
      const summaryData = await hrBotAPI.getSummary(sessionToken);
      setSummary(summaryData);
      
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setError('Не удалось сгенерировать сводку. Попробуйте еще раз.');
    }
  }, [sessionToken]);

  // Generate glyph using improved API
  const handleGenerateGlyph = useCallback(async () => {
    try {
      setError('');
      setIsGeneratingGlyph(true);
      
      // Use improved hrBotAPI
      const glyphData = await hrBotAPI.generateGlyph(sessionToken, {
        answers: answers
      });
      setGlyphData(glyphData);
      setShowGlyph(true);
      
    } catch (err) {
      console.error('Failed to generate glyph:', err);
      setError('Не удалось сгенерировать глиф. Попробуйте еще раз.');
    } finally {
      setIsGeneratingGlyph(false);
    }
  }, [sessionToken, answers]);

  // Complete session using improved API
  const handleCompleteSession = useCallback(async () => {
    try {
      setIsCompleting(true);
      await hrBotAPI.completeSession(sessionToken);
      
      if (onComplete && summary && glyphData) {
        onComplete(summary, glyphData);
      }
    } catch (err) {
      console.error('Failed to complete session:', err);
      // Still complete locally even if backend fails
      if (onComplete && summary && glyphData) {
        onComplete(summary, glyphData);
      }
    } finally {
      setIsCompleting(false);
    }
  }, [sessionToken, onComplete, summary, glyphData]);

  // Download glyph
  const handleDownloadGlyph = useCallback(() => {
    if (!glyphData) return;
    try {
      // Create a proper SVG with all necessary attributes
      const svgContent = glyphData.svg || `<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
        <text x="150" y="150" text-anchor="middle" font-size="24" fill="#40C4FF">${glyphData.glyph}</text>
      </svg>`;
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `aeon-glyph-${Date.now()}.svg`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (err) {
      console.error('Failed to download glyph:', err);
      setError('Не удалось скачать глиф');
    }
  }, [glyphData]);

  // Handle answer submission
  const handleSubmitAnswer = (answer: string) => {
    if (!answer.trim()) return;
    saveCurrentAnswer(answer.trim());
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load initial question
  useEffect(() => {
    fetchNextQuestion();
  }, [fetchNextQuestion]);

  // Show loading state
  if (isLoadingQuestion && !currentQuestion && !summary) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error && !currentQuestion && !summary) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Перезагрузить страницу
        </Button>
      </Box>
    );
  }

  // Show summary and results
  if (summary) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ 
            background: 'linear-gradient(45deg, #40C4FF, #2196F3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            ÆON Assessment Complete
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Ваш профиль сознания проанализирован
          </Typography>
        </Box>

        {/* Summary Card */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #1e2a44 0%, #2c3e50 100%)', color: 'white' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 2 }}>
                📊 Анализ вашего профиля
              </Typography>
              <Chip label={`${Object.keys(answers).length} вопросов отвечено`} color="primary" />
            </Box>
            
            <Divider sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.2)' }} />
            
            <Typography variant="body1" sx={{ 
              whiteSpace: 'pre-wrap', 
              lineHeight: 1.8,
              fontSize: '1.1rem'
            }}>
              {summary.summary}
            </Typography>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateGlyph}
            disabled={isGeneratingGlyph}
            startIcon={isGeneratingGlyph ? <CircularProgress size={20} /> : null}
            sx={{
              background: 'linear-gradient(45deg, #40C4FF, #2196F3)',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                background: 'linear-gradient(45deg, #2196F3, #1976D2)',
              }
            }}
          >
            {isGeneratingGlyph ? 'Генерирую...' : 'Сгенерировать ÆON Глиф'}
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            onClick={handleCompleteSession}
            disabled={isCompleting}
            startIcon={isCompleting ? <CircularProgress size={20} /> : null}
            sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
          >
            {isCompleting ? 'Завершаю...' : 'Завершить сессию'}
          </Button>
        </Box>

        {/* Glyph Display */}
        {showGlyph && glyphData && (
          <Card sx={{ mt: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                🎯 Ваш ÆON Глиф
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 3,
                '& svg': {
                  maxWidth: '100%',
                  height: 'auto'
                }
              }}>
                {glyphData.svg ? (
                  <div dangerouslySetInnerHTML={{ __html: glyphData.svg }} />
                ) : (
                  <Typography variant="h2" sx={{ 
                    fontSize: '4rem', 
                    background: 'linear-gradient(45deg, #FFD700, #FF6B6B)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                  }}>
                    {glyphData.glyph}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                Профиль личности
              </Typography>
              
              <Typography variant="body1" sx={{ 
                fontSize: '1.1rem', 
                lineHeight: 1.6,
                mb: 3
              }}>
                {glyphData.profile}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleDownloadGlyph}
                  sx={{ 
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.8)',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  📥 Скачать глиф
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleCompleteSession}
                  disabled={isCompleting}
                  sx={{ 
                    background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #45a049, #3d8b40)',
                    }
                  }}
                >
                  {isCompleting ? 'Завершаю...' : 'Завершить интервью'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  }

  // Show question interface
  if (currentQuestion) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
        {/* Progress header */}
        <Card sx={{ mb: 3, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                Вопрос {questionNumber} из 10
              </Typography>
              <Chip
                label={formatTime(timeLeft)}
                color={timeLeft <= 10 ? 'error' : timeLeft <= 30 ? 'warning' : 'default'}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={(questionNumber / 10) * 100}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Question card */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 4, lineHeight: 1.4, fontWeight: 500 }}>
              {currentQuestion.text}
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={8}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Поделитесь своими мыслями и опытом..."
              variant="outlined"
              inputRef={textFieldRef}
              sx={{ 
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.1rem',
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

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleSubmitAnswer(currentAnswer)}
                disabled={isSavingAnswer || !currentAnswer.trim()}
                startIcon={isSavingAnswer ? <CircularProgress size={20} /> : null}
                sx={{ 
                  minWidth: 180,
                  py: 1.5,
                  fontSize: '1rem',
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
                {isSavingAnswer ? 'Сохраняю...' : 'Далее'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return null;
};

export default AeonTest; 