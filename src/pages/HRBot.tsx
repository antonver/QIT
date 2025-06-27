import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Container, CircularProgress, TextField, Button, Alert, Tabs, Tab } from '@mui/material';
import TestRunner from '../components/TestRunner';
import GlyphCanvas from '../components/GlyphCanvas';
import HRPanel from '../components/HRPanel';
import AeonBadge from '../components/AeonBadge';
import { useAuth } from '../hooks/useAuth';
import { getSession, createTokenByEmail } from '../services/api';

// Main HRBot page component
const HRBot: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, user } = useAuth();
  const [currentView, setCurrentView] = useState<'test' | 'result' | 'glyph' | 'hr-panel'>('test');
  const [testResult, setTestResult] = useState<any>(null);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is HR and redirect accordingly
  useEffect(() => {
    const checkUserRole = async () => {
      if (isAuthenticated && user) {
        try {
          const session = await getSession();
          if (session.role === 'hr' && location.pathname === '/hr/bot/panel') {
            setCurrentView('hr-panel');
          } else if (session.role === 'hr' && location.pathname === '/hr/bot') {
            navigate('/hr/bot/panel');
          }
        } catch (error) {
          console.error('Failed to check user role:', error);
        }
      }
      setIsLoading(false);
    };

    checkUserRole();
  }, [isAuthenticated, user, location.pathname, navigate]);

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

  // Show loading state
  if (isLoading) {
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

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
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
            <button onClick={handleGlyphGenerated}>
              Generate Glyph
            </button>
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

// Login form component
const LoginForm: React.FC<{ onLogin: (token: string) => void }> = ({ onLogin }) => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Check if running in Telegram WebApp
      if (window.Telegram?.WebApp) {
        const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id;
        if (userId) {
          // Send POST /session with Telegram user ID
          const response = await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramUserId: userId })
          });
          const data = await response.json();
          onLogin(data.token);
          return;
        }
      }
      
      // Regular token-based login
      onLogin(token);
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please check your token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await createTokenByEmail(email);
      setSuccess('Token has been sent to your email. Please check your inbox.');
    } catch (error) {
      console.error('Failed to send token:', error);
      setError('Failed to send token. Please check your email address.');
    } finally {
      setIsLoading(false);
    }
  };

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
        minWidth: 400
      }}>
        <Typography variant="h5" gutterBottom align="center">
          HRBot Access
        </Typography>
        
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Token Login" />
          <Tab label="Get Token" />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {tabValue === 0 && (
          <form onSubmit={handleSubmit}>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Enter your access token to sign in to HRBot
            </Typography>
            <TextField
              fullWidth
              label="Access Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Enter your access token"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !token}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        )}

        {tabValue === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Enter your email to receive an access token
            </Typography>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="your.email@example.com"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Token'}
            </Button>
          </form>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>How to get access token:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            1. Contact your HR administrator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            2. Use the "Get Token" tab to receive via email
          </Typography>
          <Typography variant="body2" color="text.secondary">
            3. If using Telegram, token is generated automatically
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default HRBot; 