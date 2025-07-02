import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowForward, NewReleases } from '@mui/icons-material';

interface HRBotTestProps {
  testId?: number;
  lang?: string;
}

const HRBotTest: React.FC<HRBotTestProps> = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <NewReleases sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
          
          <Typography variant="h4" gutterBottom>
            Новая версия HR Bot доступна!
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body1" gutterBottom>
              <strong>Этот компонент устарел.</strong> Мы создали новую улучшенную версию HR Bot интервью с:
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 1 }}>
              <li>90-секундными таймерами для каждого вопроса</li>
              <li>Автоматической отправкой ответов</li>
              <li>Генерацией персональных глифов</li>
              <li>Современным UI и плавными анимациями</li>
              <li>Полной мобильной поддержкой</li>
            </Box>
          </Alert>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Новая версия включает все API эндпоинты из OpenAPI спецификации и работает 
            как с реальным бэкендом, так и с демо-данными.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ArrowForward />}
              onClick={() => navigate('/hrbot')}
              sx={{ minWidth: 200 }}
            >
              Перейти к новому HR Bot
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
            >
              На главную
            </Button>
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Совет:</strong> Новая версия автоматически использует демо-данные 
              если API не настроен, так что вы можете протестировать её прямо сейчас!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default HRBotTest; 