import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
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
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface Position {
  id: number;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface Quality {
  id: number;
  name: string;
  description?: string;
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
  const [positions] = useState<Position[]>([]);
  const [qualities] = useState<Quality[]>([]);
  const [interviews] = useState<Interview[]>([]);

  // Диалоги
  const [positionDialog, setPositionDialog] = useState(false);
  const [qualityDialog, setQualityDialog] = useState(false);
  const [newPosition, setNewPosition] = useState({ title: '', description: '' });
  const [newQuality, setNewQuality] = useState({ name: '', description: '' });

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
      // Здесь будет API вызов для создания позиции
      console.log('Creating position:', newPosition);
      setPositionDialog(false);
      setNewPosition({ title: '', description: '' });
    } catch (error) {
      console.error('Error creating position:', error);
    }
  };

  const handleCreateQuality = async () => {
    try {
      // Здесь будет API вызов для создания качества
      console.log('Creating quality:', newQuality);
      setQualityDialog(false);
      setNewQuality({ name: '', description: '' });
    } catch (error) {
      console.error('Error creating quality:', error);
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
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {position.description}
                      </Typography>
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
                  secondary={quality.description}
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
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newPosition.description}
            onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPositionDialog(false)}>Отмена</Button>
          <Button onClick={handleCreatePosition} variant="contained">
            Создать
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
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newQuality.description}
            onChange={(e) => setNewQuality({ ...newQuality, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQualityDialog(false)}>Отмена</Button>
          <Button onClick={handleCreateQuality} variant="contained">
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 