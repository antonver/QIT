import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  Telegram as TelegramIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  Language as LanguageIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useTelegram } from '../hooks/useTelegram';

const Profile: React.FC = () => {
  const theme = useTheme();
  const { currentUser, isUserLoading, userError } = useSelector((state: RootState) => state.aeonChat);
  const { telegramUser, isTelegramWebApp } = useTelegram();

  // Логирование для отладки
  console.log('🔍 Profile component - currentUser:', currentUser);
  console.log('🔍 Profile component - currentUser.subordinates:', currentUser?.subordinates);
  console.log('🔍 Profile component - currentUser.managers:', currentUser?.managers);

  // Дополнительная проверка и нормализация данных
  const safeCurrentUser = currentUser ? {
    ...currentUser,
    subordinates: Array.isArray(currentUser.subordinates) ? currentUser.subordinates : [],
    managers: Array.isArray(currentUser.managers) ? currentUser.managers : [],
  } : null;

  if (isUserLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Загрузка профиля...</Typography>
      </Box>
    );
  }

  if (userError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{userError}</Typography>
      </Box>
    );
  }

  if (!safeCurrentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Пользователь не найден</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Профиль пользователя
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Основная информация */}
        <Box sx={{ flex: 1 }}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={safeCurrentUser.profile_photo_url || telegramUser?.photo_url}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mr: 2,
                    bgcolor: theme.palette.primary.main 
                  }}
                >
                  {safeCurrentUser.first_name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {safeCurrentUser.first_name} {safeCurrentUser.last_name || ''}
                  </Typography>
                  {safeCurrentUser.username && (
                    <Typography variant="body2" color="text.secondary">
                      @{safeCurrentUser.username}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <List>
                <ListItem>
                  <ListItemIcon>
                    <TelegramIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Telegram ID"
                    secondary={safeCurrentUser.telegram_id}
                  />
                </ListItem>

                {safeCurrentUser.language_code && (
                  <ListItem>
                    <ListItemIcon>
                      <LanguageIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Язык"
                      secondary={safeCurrentUser.language_code?.toUpperCase()}
                    />
                  </ListItem>
                )}

                {safeCurrentUser.is_premium && (
                  <ListItem>
                    <ListItemIcon>
                      <StarIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Премиум"
                      secondary="Активен"
                    />
                  </ListItem>
                )}

                {safeCurrentUser.bio && (
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="О себе"
                      secondary={safeCurrentUser.bio}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Статус и роли */}
        <Box sx={{ flex: 1 }}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статус и роли
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={safeCurrentUser.is_admin ? <AdminIcon /> : <PersonIcon />}
                  label={safeCurrentUser.is_admin ? 'Администратор' : 'Пользователь'}
                  color={safeCurrentUser.is_admin ? 'primary' : 'default'}
                  sx={{ mb: 1 }}
                />
                <Chip
                  icon={<GroupIcon />}
                  label={`${safeCurrentUser.subordinates ? safeCurrentUser.subordinates.length : 0} подчиненных`}
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {safeCurrentUser.is_admin && safeCurrentUser.subordinates && safeCurrentUser.subordinates.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Подчиненные:
                  </Typography>
                  <List dense>
                    {safeCurrentUser.subordinates.map((subordinate) => (
                      <ListItem key={subordinate.id}>
                        <ListItemText
                          primary={`${subordinate.first_name} ${subordinate.last_name || ''}`}
                          secondary={subordinate.username ? `@${subordinate.username}` : ''}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {safeCurrentUser.managers && safeCurrentUser.managers.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Руководители:
                  </Typography>
                  <List dense>
                    {safeCurrentUser.managers.map((manager) => (
                      <ListItem key={manager.id}>
                        <ListItemText
                          primary={`${manager.first_name} ${manager.last_name || ''}`}
                          secondary={manager.username ? `@${manager.username}` : ''}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Информация о Telegram WebApp */}
      {isTelegramWebApp() && (
        <Box sx={{ mt: 3 }}>
          <Paper elevation={2} sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Telegram WebApp
            </Typography>
            <Typography variant="body2">
              Приложение запущено в Telegram WebApp
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Profile; 