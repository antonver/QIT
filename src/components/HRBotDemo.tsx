import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import HRBot from './HRBot';

const HRBotDemo: React.FC = () => {
  const [testId, setTestId] = useState<number>(1);
  const [lang, setLang] = useState<string>('ru');
  const [showTest, setShowTest] = useState<boolean>(false);

  const handleStartTest = () => {
    setShowTest(true);
  };

  const handleReset = () => {
    setShowTest(false);
  };

  if (showTest) {
    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">HRBot Test Demo</Typography>
          <Button variant="outlined" onClick={handleReset}>
            Back to Demo
          </Button>
        </Box>
        <HRBot testId={testId} lang={lang} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        HRBot Component Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Configure test parameters and start the assessment
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Test ID"
                type="number"
                value={testId}
                onChange={(e) => setTestId(parseInt(e.target.value) || 1)}
                helperText="Enter the test ID to load"
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={lang}
                  label="Language"
                  onChange={(e) => setLang(e.target.value)}
                >
                  <MenuItem value="ru">Russian (ru)</MenuItem>
                  <MenuItem value="en">English (en)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Test ID: {testId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Language: {lang === 'ru' ? 'Russian' : 'English'}
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleStartTest}
          sx={{ minWidth: 200 }}
        >
          Start Test
        </Button>
      </Box>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Features Demo
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This demo showcases the HRBot component with the following features:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              Dynamic test loading based on ID and language
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Step-by-step question navigation
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Auto-save functionality every 30 seconds
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Progress tracking and visual feedback
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Error handling and loading states
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Results display with score and details
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HRBotDemo; 