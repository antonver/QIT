import React, { useState } from 'react';
import { Box, Typography, Button, Paper, TextField } from '@mui/material';

const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: '#181820',
      backgroundImage: 'url(/src/assets/background.png)',
      backgroundSize: 'cover',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
    }}
  >
    <Box sx={{ mb: 4 }}>
      <img src="/public/vite.svg" alt="logo" style={{ width: 120, marginBottom: 24 }} />
    </Box>
    <Typography variant="h4" align="center" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
      Welcome to HR Assistant Bot
    </Typography>
    <Typography variant="body1" align="center" sx={{ color: '#B0B0C3', mb: 4 }}>
      This bot will help you simplify hiring and evaluating candidates in one click
    </Typography>
    <Button
      variant="contained"
      size="large"
      sx={{
        background: 'linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)',
        color: 'white',
        fontWeight: 700,
        fontSize: '1.15rem',
        borderRadius: '16px',
        px: 6,
        py: 2,
        boxShadow: 'none',
        textTransform: 'none',
        letterSpacing: 0.5,
        transition: 'all 0.2s',
        '&:hover': {
          background: 'linear-gradient(90deg, #6D28D9 0%, #7C3AED 100%)',
          boxShadow: '0 6px 32px rgba(139, 92, 246, 0.22)',
          transform: 'translateY(-2px)'
        }
      }}
      onClick={onStart}
      endIcon={<span style={{ fontSize: 22, marginLeft: 8 }}>↗</span>}
    >
      Get started
    </Button>
  </Box>
);

const HRBot: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'survey' | 'question' | 'finish'>('welcome');
  const [questionIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const questions = [
    'What would you do if you couldn\'t complete a task on time and your team lead didn\'t get in touch?',
    // ... другие вопросы
  ];

  if (step === 'welcome') {
    return <WelcomeScreen onStart={() => setStep('survey')} />;
  }

  if (step === 'survey') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#181820',
          backgroundImage: 'url(/src/assets/background.png)',
          backgroundSize: 'cover',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(35, 43, 59, 0.95)', minWidth: 340, maxWidth: 400 }}>
          <Typography variant="h5" align="center" sx={{ color: 'white', mb: 2 }}>
            Hello! This is a quick survey for a job vacancy.
          </Typography>
          <Typography align="center" sx={{ color: '#A78BFA', mb: 2 }}>
            Product Manager at QInsight
          </Typography>
          <Typography align="center" sx={{ color: '#F472B6', mb: 1 }}>
            Time: 5-7 minutes
          </Typography>
          <Typography align="center" sx={{ color: '#34D399', mb: 3 }}>
            Number of questions: 10
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{
              background: 'linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.15rem',
              borderRadius: '16px',
              py: 2,
              boxShadow: 'none',
              textTransform: 'none',
              letterSpacing: 0.5,
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #6D28D9 0%, #7C3AED 100%)',
                boxShadow: '0 6px 32px rgba(139, 92, 246, 0.22)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => setStep('question')}
          >
            Start survey
          </Button>
        </Paper>
      </Box>
    );
  }

  if (step === 'question') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#181820',
          backgroundImage: 'url(/src/assets/background.png)',
          backgroundSize: 'cover',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(35, 43, 59, 0.95)', minWidth: 340, maxWidth: 400 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ color: '#34D399' }}>Question {questionIdx + 1}/10</Typography>
            <Typography sx={{ color: '#F472B6' }}>Time: 05:10</Typography>
          </Box>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            Question {questionIdx + 1}
          </Typography>
          <Typography sx={{ color: '#B0B0C3', mb: 2 }}>
            {questions[questionIdx]}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write your answer here"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            sx={{
              mb: 3,
              bgcolor: '#181820',
              borderRadius: 2,
              input: { color: 'white' },
              textarea: { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#7C3AED',
                },
                '&:hover fieldset': {
                  borderColor: '#8B5CF6',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#8B5CF6',
                },
              },
            }}
          />
          <Button
            variant="contained"
            fullWidth
            sx={{
              background: 'linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.15rem',
              borderRadius: '16px',
              py: 2,
              boxShadow: 'none',
              textTransform: 'none',
              letterSpacing: 0.5,
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #6D28D9 0%, #7C3AED 100%)',
                boxShadow: '0 6px 32px rgba(139, 92, 246, 0.22)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => setStep('finish')}
            disabled={!answer.trim()}
          >
            Next
          </Button>
        </Paper>
      </Box>
    );
  }

  if (step === 'finish') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#181820',
          backgroundImage: 'url(/src/assets/background.png)',
          backgroundSize: 'cover',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(35, 43, 59, 0.95)', minWidth: 340, maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
            Thank you for participating!
          </Typography>
          <Typography sx={{ color: '#B0B0C3', mb: 3 }}>
            Your answers have been sent to the recruitment team. If you are suitable, you will be contacted via Telegram or email.
          </Typography>
          <Typography sx={{ color: '#A78BFA', mb: 2, fontSize: 13 }}>
            The responses were analyzed by the <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>ÆON system</span>.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{
              background: 'linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.15rem',
              borderRadius: '16px',
              py: 2,
              boxShadow: 'none',
              textTransform: 'none',
              letterSpacing: 0.5,
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #6D28D9 0%, #7C3AED 100%)',
                boxShadow: '0 6px 32px rgba(139, 92, 246, 0.22)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => setStep('welcome')}
          >
            Close app
          </Button>
        </Paper>
      </Box>
    );
  }

  return null;
};

export default HRBot; 