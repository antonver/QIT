import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import HRBotTest from '../components/HRBotTest';

const TestPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          HRBot Тест
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Пройдите тест для оценки ваших навыков и компетенций
        </Typography>
      </Box>
      
      <HRBotTest testId={1} lang="ru" />
    </Container>
  );
};

export default TestPage; 