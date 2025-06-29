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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  aeonNextQuestion, 
  aeonSummary, 
  generateGlyph,
  saveAnswer,
  completeSession
} from '../services/api';
import type { AeonQuestion, AeonSummary, GlyphData } from '../types/api';

interface AeonTestProps {
  sessionToken: string;
  onComplete?: (summary: AeonSummary, glyph: GlyphData) => void;
}

const AeonTest: React.FC<AeonTestProps> = ({ sessionToken, onComplete }) => {
  const questionRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);
  
  // State management
  const [currentQuestion, setCurrentQuestion] = useState<AeonQuestion | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [summary, setSummary] = useState<AeonSummary | null>(null);
  const [glyphData, setGlyphData] = useState<GlyphData | null>(null);
  const [showGlyph, setShowGlyph] = useState(false);
  const [showRules, setShowRules] = useState(false);
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

  // Get next question
  const fetchNextQuestion = useCallback(async () => {
    try {
      setIsLoadingQuestion(true);
      setError('');
      
      // Check if we've reached 10 questions
      if (questionNumber > 10) {
        await handleGenerateSummary();
        return;
      }
      
      const questionData = await aeonNextQuestion({
        session_token: sessionToken,
        current_answers: answers
      });
      
      setCurrentQuestion(questionData);
      setCurrentAnswer(''); // Clear the form
      setTimeLeft(90); // Reset timer
      setIsTimerRunning(true); // Start timer
      
      // Focus on the text field
      setTimeout(() => {
        if (textFieldRef.current) {
          textFieldRef.current.focus();
        }
      }, 100);
      
    } catch (err) {
      // If no more questions or endpoint not available, generate summary
      if (String(err).includes('No more questions') || 
          (err as any)?.response?.status === 404 ||
          (err as any)?.response?.status === 500) {
        await handleGenerateSummary();
      } else {
        console.error('Failed to fetch question:', err);
        setError('Failed to load question. Please try again.');
      }
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [sessionToken, answers, questionNumber]);

  // Save answer
  const saveCurrentAnswer = useCallback(async (answer: string) => {
    if (!currentQuestion) return;
    
    try {
      setIsSavingAnswer(true);
      setIsTimerRunning(false); // Stop timer
      
      // Try to save to backend, but continue even if it fails
      try {
        await saveAnswer(sessionToken, {
          question: currentQuestion.question,
          answer: answer
        });
      } catch (saveError) {
        console.error('Failed to save answer to backend:', saveError);
        // Continue with local storage even if backend save fails
      }
      
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.question]: answer
      }));
      
      // Clear the form
      setCurrentAnswer('');
      
      // Increment question number
      setQuestionNumber(prev => prev + 1);
      
      // Get next question after saving
      setTimeout(() => {
        fetchNextQuestion();
      }, 500);
      
    } catch (err) {
      console.error('Failed to save answer:', err);
      // Continue with next question even if save fails
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.question]: answer
      }));
      setCurrentAnswer('');
      setQuestionNumber(prev => prev + 1);
      setTimeout(() => {
        fetchNextQuestion();
      }, 500);
    } finally {
      setIsSavingAnswer(false);
    }
  }, [currentQuestion, sessionToken, fetchNextQuestion]);

  // Generate summary
  const handleGenerateSummary = useCallback(async () => {
    try {
      setError('');
      setIsTimerRunning(false); // Stop timer
      const summaryData = await aeonSummary({
        session_token: sessionToken,
        answers: answers
      });
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to generate summary:', err);
      // Create a mock summary if the endpoint fails
      setSummary({
        summary: `Based on your responses, you've completed the ÆON assessment. You answered ${Object.keys(answers).length} questions thoughtfully. Your unique profile has been analyzed and your ÆON glyph is ready to be generated.`
      });
    }
  }, [sessionToken, answers]);

  // Generate glyph
  const handleGenerateGlyph = useCallback(async () => {
    if (!summary) return;
    try {
      setIsGeneratingGlyph(true);
      const glyph = await generateGlyph({ 
        session_token: sessionToken,
        summary: summary.summary 
      });
      setGlyphData(glyph);
      setShowGlyph(true);
    } catch (err) {
      console.error('Failed to generate glyph:', err);
      // Create a mock glyph if the endpoint fails
      setGlyphData({
        svg: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#40C4FF" stroke-width="3"/>
          <path d="M60 100 L90 130 L140 70" stroke="#40C4FF" stroke-width="3" fill="none"/>
          <text x="100" y="110" text-anchor="middle" fill="#40C4FF" font-size="12">ÆON</text>
        </svg>`
      });
      setShowGlyph(true);
    } finally {
      setIsGeneratingGlyph(false);
    }
  }, [summary, sessionToken]);

  // Complete session
  const handleCompleteSession = useCallback(async () => {
    try {
      setIsCompleting(true);
      await completeSession(sessionToken);
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
      const blob = new Blob([glyphData.svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aeon-glyph-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download glyph:', err);
      setError('Failed to download glyph');
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

  // Show summary and results
  if (summary) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          ÆON Assessment Complete
        </Typography>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Summary
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {summary.summary}
            </Typography>
          </CardContent>
        </Card>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleGenerateGlyph}
            disabled={isGeneratingGlyph}
            startIcon={isGeneratingGlyph ? <CircularProgress size={20} /> : null}
          >
            Generate ÆON Glyph
          </Button>
          <Button
            variant="outlined"
            onClick={handleCompleteSession}
            disabled={isCompleting}
          >
            Complete Session
          </Button>
        </Box>
        {glyphData && showGlyph && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Your ÆON Glyph
            </Typography>
            <Box sx={{ mb: 2 }}>
              <div dangerouslySetInnerHTML={{ __html: glyphData.svg }} />
            </Box>
            <Button
              variant="outlined"
              onClick={handleDownloadGlyph}
              sx={{ mt: 2 }}
            >
              Download Glyph
            </Button>
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    );
  }

  // Show current question
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          onClick={() => setShowRules(true)}
          sx={{ mb: 2 }}
        >
          View Test Rules
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={(questionNumber - 1) / 10 * 100} 
            sx={{ flexGrow: 1, mr: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: '60px' }}>
            {questionNumber - 1}/10
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Question {questionNumber} of 10
          </Typography>
          <Typography 
            variant="body2" 
            color={timeLeft <= 10 ? 'error' : 'text.secondary'}
            sx={{ fontWeight: timeLeft <= 10 ? 'bold' : 'normal' }}
          >
            Time: {formatTime(timeLeft)}
          </Typography>
        </Box>
      </Box>

      {currentQuestion && (
        <Card ref={questionRef} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {currentQuestion.question}
            </Typography>
            <TextField
              inputRef={textFieldRef}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Type your answer here..."
              disabled={isSavingAnswer}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSubmitAnswer(currentAnswer);
                }
              }}
              sx={{ mt: 2 }}
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => handleSubmitAnswer(currentAnswer)}
                disabled={isSavingAnswer || !currentAnswer.trim()}
                startIcon={isSavingAnswer ? <CircularProgress size={20} /> : null}
              >
                Submit Answer
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Rules Dialog */}
      <Dialog open={showRules} onClose={() => setShowRules(false)} maxWidth="md" fullWidth>
        <DialogTitle>ÆON Test Rules</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Welcome to the ÆON Assessment - an AI-powered evaluation of your professional capabilities.
          </Typography>
          <Typography variant="h6" gutterBottom>
            How it works:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="10 Questions" 
                secondary="You will answer exactly 10 open-ended questions."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="90-Second Timer" 
                secondary="Each question has a 90-second time limit. Answer will auto-submit when time runs out."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Open Questions" 
                secondary="Answer questions in your own words. Be honest and detailed."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="AI Analysis" 
                secondary="Our AI analyzes your responses to understand your skills and personality."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Personalized Results" 
                secondary="Get a detailed summary and unique ÆON glyph representing your profile."
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="No Right/Wrong" 
                secondary="There are no correct answers. Just be yourself."
              />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Tip: Use Ctrl+Enter to quickly submit your answer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRules(false)}>Got it</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AeonTest; 