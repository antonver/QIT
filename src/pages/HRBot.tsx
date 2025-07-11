import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, LinearProgress, Fade, Slide } from '@mui/material';
import { keyframes } from '@mui/system';

// Circular glyph component for branding
const CircularGlyph: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: size * 0.6,
        height: size * 0.6,
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.3)',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: size * 0.3,
        height: size * 0.3,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.8)',
      }
    }}
  />
);

// Floating animation for background elements
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
`;

// Glow animation
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(123, 66, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(32, 246, 210, 0.5), 0 0 60px rgba(123, 66, 246, 0.3); }
`;

// Background decoration component
const BackgroundDecoration: React.FC = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}
  >
    {[...Array(6)].map((_, i) => (
      <Box
        key={i}
        sx={{
          position: 'absolute',
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: i % 2 === 0 ? '#7B42F6' : '#20F6D2',
          opacity: 0.4,
          animation: `${float} ${3 + i}s ease-in-out infinite`,
          left: `${20 + i * 15}%`,
          top: `${10 + i * 10}%`,
        }}
      />
    ))}
  </Box>
);

// Welcome Screen Component
const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: 3,
      position: 'relative',
    }}
  >
    <BackgroundDecoration />

    <Fade in timeout={800}>
      <Box sx={{ textAlign: 'center', zIndex: 1, maxWidth: 450 }}>
        <Box sx={{ mb: 4 }}>
          <CircularGlyph size={120} />
        </Box>

        <Typography
          variant="h3"
          sx={{
            color: 'white',
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #20F6D2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          Welcome to HR Bot
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: '#AAA',
            mb: 4,
            fontWeight: 400,
            lineHeight: 1.6,
          }}
        >
          Simplify hiring and evaluate candidates with AI-powered insights
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={onStart}
          sx={{
            background: 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.1rem',
            borderRadius: '16px',
            px: 6,
            py: 2,
            textTransform: 'none',
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
            animation: `${glow} 3s ease-in-out infinite`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px) scale(1.02)',
              boxShadow: '0 20px 40px rgba(123, 66, 246, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0) scale(0.98)',
            }
          }}
        >
          Get Started
        </Button>

        <Typography
          variant="caption"
          sx={{
            color: '#666',
            mt: 6,
            display: 'block',
            fontSize: '0.75rem',
          }}
        >
          powered by Quantum Insight Ecosystem
        </Typography>
      </Box>
    </Fade>
  </Box>
);

// Survey Info Screen Component
const SurveyInfoScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: 3,
      position: 'relative',
    }}
  >
    <BackgroundDecoration />

    <Slide direction="up" in timeout={600}>
      <Paper
        sx={{
          p: 4,
          borderRadius: '24px',
          bgcolor: 'rgba(15, 15, 15, 0.95)',
          border: '1px solid rgba(123, 66, 246, 0.2)',
          backdropFilter: 'blur(20px)',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          '&:hover': {
            borderColor: 'rgba(32, 246, 210, 0.4)',
            transition: 'border-color 0.3s ease',
          }
        }}
      >
        <CircularGlyph size={60} />

        <Typography
          variant="h5"
          sx={{
            color: 'white',
            mb: 2,
            mt: 3,
            fontWeight: 600,
          }}
        >
          Quick Survey
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: '#7B42F6',
            mb: 1,
            fontWeight: 500,
          }}
        >
          Product Manager at QInsight
        </Typography>

        <Box sx={{ my: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ color: '#20F6D2', fontSize: '0.9rem' }}>
              ⏱ Duration: 5-7 minutes
            </Typography>
            <Typography sx={{ color: '#20F6D2', fontSize: '0.9rem' }}>
              📋 Questions: 10
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={onStart}
          sx={{
            background: 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.1rem',
            borderRadius: '16px',
            py: 2.5,
            textTransform: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 24px rgba(123, 66, 246, 0.4)',
            }
          }}
        >
          Start Survey
        </Button>
      </Paper>
    </Slide>
  </Box>
);

// Question Screen Component
const QuestionScreen: React.FC<{
  questionIdx: number;
  question: string;
  answer: string;
  onAnswerChange: (value: string) => void;
  onNext: () => void;
  timeLeft: string;
}> = ({ questionIdx, question, answer, onAnswerChange, onNext, timeLeft }) => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: 3,
      position: 'relative',
    }}
  >
    <BackgroundDecoration />

    <Slide direction="left" in timeout={500}>
      <Paper
        sx={{
          p: 4,
          borderRadius: '24px',
          bgcolor: 'rgba(15, 15, 15, 0.95)',
          border: '1px solid rgba(123, 66, 246, 0.2)',
          backdropFilter: 'blur(20px)',
          maxWidth: 500,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Progress and Timer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ color: '#20F6D2', fontWeight: 500 }}>
            Question {questionIdx + 1}/10
          </Typography>
          <Typography sx={{ color: '#7B42F6', fontWeight: 500 }}>
            ⏱ {timeLeft}
          </Typography>
        </Box>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={(questionIdx + 1) * 10}
          sx={{
            mb: 4,
            height: 6,
            borderRadius: 3,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #7B42F6 0%, #20F6D2 100%)',
              borderRadius: 3,
            }
          }}
        />

        <Typography
          variant="h6"
          sx={{
            color: 'white',
            mb: 3,
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {question}
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              color: 'white',
              fontSize: '1rem',
              '& fieldset': {
                borderColor: 'rgba(123, 66, 246, 0.3)',
                borderWidth: 1,
              },
              '&:hover fieldset': {
                borderColor: 'rgba(32, 246, 210, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#20F6D2',
                borderWidth: 2,
              },
            },
            '& .MuiOutlinedInput-input': {
              color: 'white',
              '&::placeholder': {
                color: '#AAA',
                opacity: 1,
              },
            },
          }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={onNext}
          disabled={!answer.trim()}
          sx={{
            background: answer.trim()
              ? 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)'
              : 'rgba(255, 255, 255, 0.1)',
            color: answer.trim() ? 'white' : '#666',
            fontWeight: 600,
            fontSize: '1.1rem',
            borderRadius: '16px',
            py: 2.5,
            textTransform: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: answer.trim() ? 'translateY(-2px)' : 'none',
              boxShadow: answer.trim() ? '0 12px 24px rgba(123, 66, 246, 0.4)' : 'none',
            },
            '&:disabled': {
              color: '#666',
            }
          }}
        >
          Next Question
        </Button>
      </Paper>
    </Slide>
  </Box>
);

// End Screen Component
const EndScreen: React.FC<{ onRestart: () => void }> = ({ onRestart }) => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: 3,
      position: 'relative',
    }}
  >
    <BackgroundDecoration />

    <Fade in timeout={800}>
      <Paper
        sx={{
          p: 5,
          borderRadius: '24px',
          bgcolor: 'rgba(15, 15, 15, 0.95)',
          border: '1px solid rgba(32, 246, 210, 0.3)',
          backdropFilter: 'blur(20px)',
          maxWidth: 450,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <CircularGlyph size={80} />
        </Box>

        <Typography
          variant="h4"
          sx={{
            color: 'white',
            mb: 2,
            fontWeight: 600,
          }}
        >
          Thank You!
        </Typography>

        <Typography
          sx={{
            color: '#AAA',
            mb: 4,
            lineHeight: 1.6,
            fontSize: '1rem',
          }}
        >
          Your responses have been submitted to our recruitment team.
          If you're a good fit, we'll contact you via Telegram or email.
        </Typography>

        <Box sx={{
          p: 3,
          borderRadius: '16px',
          bgcolor: 'rgba(123, 66, 246, 0.1)',
          border: '1px solid rgba(123, 66, 246, 0.2)',
          mb: 4,
        }}>
          <Typography
            sx={{
              color: '#7B42F6',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Responses analyzed by
            <span style={{
              textDecoration: 'underline',
              cursor: 'pointer',
              color: '#20F6D2',
              marginLeft: '4px',
            }}>
              ÆEON AI System
            </span>
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={onRestart}
          sx={{
            background: 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.1rem',
            borderRadius: '16px',
            py: 2.5,
            textTransform: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 24px rgba(123, 66, 246, 0.4)',
            }
          }}
        >
          Close Application
        </Button>

        <Typography
          variant="caption"
          sx={{
            color: '#666',
            mt: 3,
            display: 'block',
            fontSize: '0.75rem',
          }}
        >
          powered by Quantum Insight Ecosystem
        </Typography>
      </Paper>
    </Fade>
  </Box>
);

// Main HRBot Component
const HRBot: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'survey' | 'question' | 'finish'>('welcome');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState('05:00');

  const questions = [
    'What would you do if you couldn\'t complete a task on time and your team lead didn\'t get in touch?',
    'Describe a situation where you had to work with a difficult team member. How did you handle it?',
    'How do you prioritize tasks when everything seems urgent?',
    'Tell us about a time when you had to learn a new skill quickly for a project.',
    'What motivates you to do your best work?',
    'How do you handle constructive criticism?',
    'Describe your ideal work environment.',
    'What would you do if you disagreed with your manager\'s decision?',
    'How do you stay updated with industry trends?',
    'What are your long-term career goals?'
  ];

  // Timer effect
  useEffect(() => {
    if (step === 'question') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const [minutes, seconds] = prev.split(':').map(Number);
          const totalSeconds = minutes * 60 + seconds;
          if (totalSeconds <= 1) {
            clearInterval(timer);
            return '00:00';
          }
          const newTotal = totalSeconds - 1;
          const newMinutes = Math.floor(newTotal / 60);
          const newSeconds = newTotal % 60;
          return `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const handleNextQuestion = () => {
    if (questionIdx < questions.length - 1) {
      setQuestionIdx(prev => prev + 1);
      setAnswer('');
    } else {
      setStep('finish');
    }
  };

  const handleRestart = () => {
    setStep('welcome');
    setQuestionIdx(0);
    setAnswer('');
    setTimeLeft('05:00');
  };

  switch (step) {
    case 'welcome':
      return <WelcomeScreen onStart={() => setStep('survey')} />;
    case 'survey':
      return <SurveyInfoScreen onStart={() => setStep('question')} />;
    case 'question':
      return (
        <QuestionScreen
          questionIdx={questionIdx}
          question={questions[questionIdx]}
          answer={answer}
          onAnswerChange={setAnswer}
          onNext={handleNextQuestion}
          timeLeft={timeLeft}
        />
      );
    case 'finish':
      return <EndScreen onRestart={handleRestart} />;
    default:
      return null;
  }
};

export default HRBot;

