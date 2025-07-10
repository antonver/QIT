import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { makeUserAdminByUsername, createQuality, createPosition, getQualities, getPositions } from '../services/aeonMessengerApi';

interface Position {
  id: number;
  title: string;
  qualities?: Quality[];
  is_active: boolean;
  created_at: string;
}

interface Quality {
  id: number;
  name: string;
}

interface Interview {
  id: number;
  user_id: number;
  position_id: number;
  status: string;
  score?: number;
  max_score: number;
  started_at: string;
  completed_at?: string;
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  position: {
    id: number;
    title: string;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminPanel: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.aeonChat);
  const [tabValue, setTabValue] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [interviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);

  // Диалоги
  const [positionDialog, setPositionDialog] = useState(false);
  const [qualityDialog, setQualityDialog] = useState(false);
  const [adminDialog, setAdminDialog] = useState(false);
  const [newPosition, setNewPosition] = useState({ title: '', selectedQualities: [] as number[] });
  const [newQuality, setNewQuality] = useState({ name: '' });
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [adminMessage, setAdminMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Проверяем права администратора
  if (!currentUser?.is_admin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          У вас нет прав для доступа к админ-панели
        </Alert>
      </Container>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreatePosition = async () => {
    try {
      setLoading(true);
      const createdPosition = await createPosition({
        title: newPosition.title,
        quality_ids: newPosition.selectedQualities
      });
      
      // Обновляем список позиций
      setPositions(prev => [...prev, createdPosition]);
      setPositionDialog(false);
      setNewPosition({ title: '', selectedQualities: [] });
    } catch (error) {
      console.error('Error creating position:', error);
      alert('Ошибка при создании позиции');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuality = async () => {
    try {
      setLoading(true);
      const createdQuality = await createQuality({
        name: newQuality.name
      });
      
      // Обновляем список качеств
      setQualities(prev => [...prev, createdQuality]);
      setQualityDialog(false);
      setNewQuality({ name: '' });
    } catch (error) {
      console.error('Error creating quality:', error);
      alert('Ошибка при создании качества');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [qualitiesData, positionsData] = await Promise.all([
          getQualities(),
          getPositions()
        ]);
        setQualities(qualitiesData);
        setPositions(positionsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleMakeAdmin = async () => {
    try {
      if (!newAdminUsername.trim()) return;
      
      const username = newAdminUsername.trim().replace(/^@/, '');
      await makeUserAdminByUsername(username);
      
      setAdminMessage({
        type: 'success',
        message: `Пользователь @${username} успешно назначен администратором!`
      });
      
      setNewAdminUsername('');
      setTimeout(() => {
        setAdminDialog(false);
        setAdminMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Error making user admin:', error);
      setAdminMessage({
        type: 'error',
        message: 'Ошибка при назначении администратора. Проверьте username и попробуйте снова.'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Админ-панель HR системы
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Позиции" icon={<WorkIcon />} />
          <Tab label="Качества" icon={<AssessmentIcon />} />
          <Tab label="Интервью" icon={<PersonIcon />} />
          <Tab label="Пользователи" icon={<PeopleIcon />} />
          <Tab label="Админы" icon={<AdminIcon />} />
        </Tabs>
      </Box>

      {/* Позиции */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Позиции (вакансии)</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setPositionDialog(true)}
          >
            Добавить позицию
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {positions.map((position) => (
            <Box key={position.id} sx={{ width: { xs: '100%', md: 'calc(50% - 8px)' } }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <Box>
                    <Typography variant="h6">{position.title}</Typography>
                    {position.qualities && position.qualities.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Качества:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {position.qualities.map((quality) => (
                            <Chip
                              key={quality.id}
                              label={quality.name}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    <Chip
                      label={position.is_active ? 'Активна' : 'Неактивна'}
                      color={position.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                    <Box>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* Качества */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Качества для оценки</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setQualityDialog(true)}
          >
            Добавить качество
          </Button>
        </Box>

        <List>
          {qualities.map((quality) => (
            <React.Fragment key={quality.id}>
              <ListItem>
                <ListItemText
                  primary={quality.name}
                />
                <ListItemSecondaryAction>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </TabPanel>

      {/* Интервью */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Результаты интервью
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Кандидат</TableCell>
                <TableCell>Позиция</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Балл</TableCell>
                <TableCell>Дата</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell>
                    {interview.user.first_name} {interview.user.last_name}
                    {interview.user.username && ` (@${interview.user.username})`}
                  </TableCell>
                  <TableCell>{interview.position.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={interview.status === 'completed' ? 'Завершено' : 'В процессе'}
                      color={interview.status === 'completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {interview.score ? `${interview.score}/${interview.max_score}` : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(interview.started_at).toLocaleDateString('ru-RU')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Пользователи */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Управление пользователями
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Здесь будет список пользователей с возможностью назначения администраторов
        </Typography>
      </TabPanel>

      {/* Админы */}
      <TabPanel value={tabValue} index={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Управление администраторами</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAdminDialog(true)}
          >
            Назначить админа
          </Button>
        </Box>

        {adminMessage && (
          <Alert 
            severity={adminMessage.type} 
            sx={{ mb: 2 }}
            onClose={() => setAdminMessage(null)}
          >
            {adminMessage.message}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Введите Telegram username пользователя (без @) для назначения администратором
        </Typography>

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Пример использования:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Введите "AntonioDaVinchi" для пользователя @AntonioDaVinchi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • Или "antonver" для пользователя @antonver
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Пользователь получит права администратора при следующем входе в приложение
          </Typography>
        </Paper>
      </TabPanel>

      {/* Диалог создания позиции */}
      <Dialog open={positionDialog} onClose={() => setPositionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новую позицию</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название позиции"
            fullWidth
            variant="outlined"
            value={newPosition.title}
            onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Выберите качества для оценки:
          </Typography>
          <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
            {qualities.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                Сначала создайте качества в разделе "Качества"
              </Typography>
            ) : (
              qualities.map((quality) => (
              <FormControlLabel
                key={quality.id}
                control={
                  <Checkbox
                    checked={newPosition.selectedQualities.includes(quality.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewPosition({
                          ...newPosition,
                          selectedQualities: [...newPosition.selectedQualities, quality.id]
                        });
                      } else {
                        setNewPosition({
                          ...newPosition,
                          selectedQualities: newPosition.selectedQualities.filter(id => id !== quality.id)
                        });
                      }
                    }}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">
                    {quality.name}
                  </Typography>
                }
                sx={{ width: '100%', margin: 0, mb: 1 }}
              />
            ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPositionDialog(false)} disabled={loading}>Отмена</Button>
          <Button onClick={handleCreatePosition} variant="contained" disabled={!newPosition.title.trim() || loading}>
            {loading ? 'Создание...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог создания качества */}
      <Dialog open={qualityDialog} onClose={() => setQualityDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новое качество</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название качества"
            fullWidth
            variant="outlined"
            value={newQuality.name}
            onChange={(e) => setNewQuality({ ...newQuality, name: e.target.value })}
            placeholder="Например: Коммуникабельность, Лидерство, Аналитическое мышление"
            helperText="Введите название качества для оценки кандидатов"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQualityDialog(false)} disabled={loading}>Отмена</Button>
          <Button onClick={handleCreateQuality} variant="contained" disabled={!newQuality.name.trim() || loading}>
            {loading ? 'Создание...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог назначения админа */}
      <Dialog open={adminDialog} onClose={() => setAdminDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Назначить администратора</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Telegram username"
            placeholder="AntonioDaVinchi"
            fullWidth
            variant="outlined"
            value={newAdminUsername}
            onChange={(e) => setNewAdminUsername(e.target.value)}
            helperText="Введите username без символа @"
            sx={{ mb: 2 }}
          />
          <Alert severity="info" sx={{ mb: 2 }}>
            Пользователь получит права администратора при следующем входе в приложение
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleMakeAdmin} 
            variant="contained"
            disabled={!newAdminUsername.trim()}
          >
            Назначить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 