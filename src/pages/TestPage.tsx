import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import HRBot from '../components/HRBot';

const TestPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        HR Assessment Test
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Complete the assessment to receive your personalized results and ÆON badge.
        </Typography>
      </Box>
      
      <HRBot testId={1} lang="ru" />
    </Container>
  );
};

export default TestPage; 