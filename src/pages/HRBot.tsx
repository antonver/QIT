import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Container, CircularProgress, Button, Alert } from '@mui/material';
import TestRunner from '../components/TestRunner';
import GlyphCanvas from '../components/GlyphCanvas';
import HRPanel from '../components/HRPanel';
import AeonBadge from '../components/AeonBadge';
import { useAuth } from '../hooks/useAuth';

// Main HRBot page component
const HRBot: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, createNewSession, user, initializing } = useAuth();
  const [currentView, setCurrentView] = useState<'test' | 'result' | 'glyph' | 'hr-panel'>('test');
  const [testResult, setTestResult] = useState<any>(null);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Handle start test
  const handleStartTest = async () => {
    try {
      setError('');
      await createNewSession();
      setCurrentView('test');
    } catch (error) {
      console.error('Failed to start test:', error);
      setError('Failed to start test. Please try again.');
    }
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
    return <WelcomeScreen onStart={handleStartTest} error={error} />;
  }

  // Render appropriate view based on current state
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {currentView === 'test' && (
        <TestRunner onComplete={handleTestComplete} />
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
          sx={{ minWidth: 200 }}
        >
          Start Test
        </Button>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>What to expect:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            • Multiple choice questions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Personalized results
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • ÆON badge generation
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default HRBot; 