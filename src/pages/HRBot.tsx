import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Container, CircularProgress, Button, Alert } from '@mui/material';
import TestRunner from '../components/TestRunner';
import GlyphCanvas from '../components/GlyphCanvas';
import HRPanel from '../components/HRPanel';
import AeonBadge from '../components/AeonBadge';
import HRBotComponent from '../components/HRBot';
import { useAuth } from '../hooks/useAuth';

// Main HRBot page component
const HRBot: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, initializing } = useAuth();
  const [currentView, setCurrentView] = useState<'welcome' | 'test' | 'result' | 'glyph' | 'hr-panel' | 'new-test'>('welcome');
  const [testResult, setTestResult] = useState<any>(null);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState('');

  // Check if user is HR and redirect accordingly
  useEffect(() => {
    const checkUserRole = async () => {
      // Wait for auth to finish initializing
      if (initializing) {
        return;
      }

      if (isAuthenticated && user) {
        // Use user data from auth state instead of making additional API calls
        if (user.role === 'hr' && location.pathname === '/hr/bot/panel') {
          setCurrentView('hr-panel');
        } else if (user.role === 'hr' && location.pathname === '/hr/bot') {
          navigate('/hr/bot/panel');
        }
      }
      setIsLoading(false);
    };

    checkUserRole();
  }, [isAuthenticated, user, location.pathname, navigate, initializing]);

  // Handle test completion
  const handleTestComplete = (result: any) => {
    setTestResult(result);
    setScore(result.score || 0);
    setCurrentView('result');
  };

  // Handle glyph generation
  const handleGlyphGenerated = () => {
    setCurrentView('glyph');
  };

  // Handle start new test
  const handleStartNewTest = () => {
    setCurrentView('new-test');
  };

  // Handle back to welcome
  const handleBackToWelcome = () => {
    setCurrentView('welcome');
    setTestResult(null);
    setScore(0);
  };

  // Show loading state during initialization
  if (initializing || isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show welcome screen if not authenticated
  if (!isAuthenticated) {
    return <WelcomeScreen onStart={handleStartNewTest} error={error} />;
  }

  // Render appropriate view based on current state
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {currentView === 'welcome' && (
        <WelcomeScreen onStart={handleStartNewTest} error={error} />
      )}
      
      {currentView === 'test' && (
        <TestRunner onComplete={handleTestComplete} />
      )}
      
      {currentView === 'new-test' && (
        <Box>
          <Button 
            variant="outlined" 
            onClick={handleBackToWelcome}
            sx={{ mb: 3 }}
          >
            ← Back to Welcome
          </Button>
          <HRBotComponent testId={1} lang="ru" />
        </Box>
      )}
      
      {currentView === 'result' && testResult && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Test Results
          </Typography>
          <AeonBadge score={score} />
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleGlyphGenerated}>
              Generate Glyph
            </Button>
          </Box>
        </Box>
      )}
      
      {currentView === 'glyph' && (
        <GlyphCanvas score={score} />
      )}
      
      {currentView === 'hr-panel' && (
        <HRPanel />
      )}
    </Container>
  );
};

// Welcome screen component
const WelcomeScreen: React.FC<{ onStart: () => void; error: string }> = ({ onStart, error }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundImage: 'url(/background.png)',
      backgroundSize: 'cover'
    }}>
      <Box sx={{ 
        p: 4, 
        bgcolor: 'background.paper', 
        borderRadius: 2, 
        boxShadow: 3,
        minWidth: 400,
        textAlign: 'center'
      }}>
        <Typography variant="h4" gutterBottom>
          Welcome to HRBot
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Take the assessment test to get your personalized results and ÆON badge.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Button
          variant="contained"
          size="large"
          onClick={onStart}
          sx={{ minWidth: 200, mb: 3 }}
        >
          Start Test
        </Button>

        <Box sx={{ 
          p: 2, 
          bgcolor: 'rgba(18, 18, 18, 0.8)', 
          borderRadius: 1,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Typography variant="body2" color="white" sx={{ fontWeight: 600, mb: 1 }}>
            What to expect:
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.8)" sx={{ mb: 0.5 }}>
            • Multiple choice questions
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.8)" sx={{ mb: 0.5 }}>
            • Personalized results
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.8)" sx={{ mb: 0.5 }}>
            • ÆON badge generation
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default HRBot; 