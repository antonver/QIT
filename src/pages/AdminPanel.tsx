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
  Collapse,
  Fade,
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
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { makeUserAdminByUsername, createQuality, createPosition, getQualities, getPositions, updateQuality, deleteQuality, updatePosition, deletePosition, getAllInterviews } from '../services/aeonMessengerApi';
import { keyframes } from '@mui/system';

// Circular glyph component for branding (same as HRBot)
const CircularGlyph: React.FC<{ size?: number }> = ({ size = 60 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: size * 0.6,
        height: size * 0.6,
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.3)',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: size * 0.3,
        height: size * 0.3,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.8)',
      }
    }}
  />
);

// Glow animation
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 10px rgba(123, 66, 246, 0.2); }
  50% { box-shadow: 0 0 20px rgba(32, 246, 210, 0.3), 0 0 30px rgba(123, 66, 246, 0.2); }
`;

// Background decoration component
const BackgroundDecoration: React.FC = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}
  >
    {[...Array(8)].map((_, i) => (
      <Box
        key={i}
        sx={{
          position: 'absolute',
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: i % 2 === 0 ? '#7B42F6' : '#20F6D2',
          opacity: 0.3,
          left: `${10 + i * 12}%`,
          top: `${5 + i * 8}%`,
        }}
      />
    ))}
  </Box>
);

// Collapsible Card Component
const CollapsibleCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}> = ({ title, icon, children, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card
      sx={{
        bgcolor: 'rgba(15, 15, 15, 0.95)',
        border: '1px solid rgba(123, 66, 246, 0.2)',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: 'rgba(32, 246, 210, 0.4)',
          animation: `${glow} 2s ease-in-out infinite`,
        }
      }}
    >
      <CardContent
        sx={{
          cursor: 'pointer',
          '&:last-child': { pb: expanded ? 2 : 2 }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ color: '#7B42F6' }}>{icon}</Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          {expanded ?
            <ExpandLessIcon sx={{ color: '#20F6D2' }} /> :
            <ExpandMoreIcon sx={{ color: '#20F6D2' }} />
          }
        </Box>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ px: 3, pb: 3 }}>
          <Divider sx={{ bgcolor: 'rgba(123, 66, 246, 0.2)', mb: 3 }} />
          {children}
        </Box>
      </Collapse>
    </Card>
  );
};

// Custom Button Component
const ModernButton: React.FC<{
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  startIcon,
  onClick,
  children
}) => {
  const getButtonStyles = () => {
    const baseStyles = {
      fontWeight: 600,
      borderRadius: '12px',
      textTransform: 'none' as const,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: 'none',
    };

    const sizeStyles = {
      small: { px: 2, py: 1, fontSize: '0.875rem' },
      medium: { px: 3, py: 1.5, fontSize: '0.95rem' },
      large: { px: 4, py: 2, fontSize: '1.1rem' },
    };

    const variantStyles = {
      primary: {
        background: 'linear-gradient(135deg, #7B42F6 0%, #20F6D2 100%)',
        color: 'white',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(123, 66, 246, 0.4)',
        }
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.1)',
        color: '#20F6D2',
        border: '1px solid rgba(32, 246, 210, 0.3)',
        '&:hover': {
          background: 'rgba(32, 246, 210, 0.1)',
          borderColor: 'rgba(32, 246, 210, 0.5)',
        }
      },
      danger: {
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#FF6B6B',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        '&:hover': {
          background: 'rgba(239, 68, 68, 0.25)',
          borderColor: 'rgba(239, 68, 68, 0.5)',
        }
      }
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
    };
  };

  return (
    <Button
      onClick={onClick}
      startIcon={startIcon}
      sx={getButtonStyles()}
    >
      {children}
    </Button>
  );
};

// Modern TextField Component
const ModernTextField: React.FC<{
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
}> = ({ label, placeholder, value, onChange, multiline = false, rows = 1, fullWidth = true }) => (
  <Box sx={{ mb: 2 }}>
    {label && (
      <Typography sx={{ color: '#AAA', mb: 1, fontSize: '0.9rem', fontWeight: 500 }}>
        {label}
      </Typography>
    )}
    <TextField
      fullWidth={fullWidth}
      multiline={multiline}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          color: 'white',
          '& fieldset': {
            borderColor: 'rgba(123, 66, 246, 0.3)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(32, 246, 210, 0.5)',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#20F6D2',
            borderWidth: 2,
          },
        },
        '& .MuiOutlinedInput-input': {
          color: 'white',
          '&::placeholder': {
            color: '#666',
            opacity: 1,
          },
        },
      }}
    />
  </Box>
);

// Modern Dialog Component
const ModernDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ open, onClose, title, children, actions }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      sx: {
        bgcolor: 'rgba(15, 15, 15, 0.98)',
        border: '1px solid rgba(123, 66, 246, 0.3)',
        borderRadius: '20px',
        backdropFilter: 'blur(20px)',
      }
    }}
  >
    <DialogTitle sx={{
      color: 'white',
      borderBottom: '1px solid rgba(123, 66, 246, 0.2)',
      fontWeight: 600,
    }}>
      {title}
    </DialogTitle>
    <DialogContent sx={{ pt: 3 }}>
      {children}
    </DialogContent>
    {actions && (
      <DialogActions sx={{ p: 3, pt: 2 }}>
        {actions}
      </DialogActions>
    )}
  </Dialog>
);

// Types (keeping the existing interfaces)
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
  answers: { [key: string]: string };
  questions: Array<{
    id: number;
    text: string;
    type: 'text' | 'scale' | 'choice';
    category?: string;
  }>;
  user?: {
    id: number;
    telegram_id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  position?: {
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
      {value === index && <Box sx={{ py: 4 }}>{children}</Box>}
    </div>
  );
}

const AdminPanel: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.aeonChat);
  const [tabValue, setTabValue] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [positionDialog, setPositionDialog] = useState(false);
  const [positionEditDialog, setPositionEditDialog] = useState(false);
  const [qualityDialog, setQualityDialog] = useState(false);
  const [qualityEditDialog, setQualityEditDialog] = useState(false);
  const [adminDialog, setAdminDialog] = useState(false);
  const [newPosition, setNewPosition] = useState({ title: '', selectedQualities: [] as number[] });
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [newQuality, setNewQuality] = useState({ name: '' });
  const [editingQuality, setEditingQuality] = useState<Quality | null>(null);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [adminMessage, setAdminMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Load data function
  const loadData = async () => {
    try {
      setLoading(true);
      const [qualitiesData, positionsData, interviewsData] = await Promise.all([
        getQualities(),
        getPositions(),
        getAllInterviews()
      ]);
      setQualities(qualitiesData);
      setPositions(positionsData);
      setInterviews(interviewsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Check admin rights
  if (!currentUser?.is_admin) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <BackgroundDecoration />
        <Paper
          sx={{
            p: 4,
            borderRadius: '20px',
            bgcolor: 'rgba(15, 15, 15, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <Typography variant="h5" sx={{ color: '#FF6B6B', mb: 2, fontWeight: 600 }}>
            Access Denied
          </Typography>
          <Typography sx={{ color: '#AAA' }}>
            You don't have administrator privileges to access this panel.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreatePosition = async () => {
    try {
      setLoading(true);
      await createPosition({
        title: newPosition.title,
        quality_ids: newPosition.selectedQualities
      });
      
      const [qualitiesData, positionsData] = await Promise.all([
        getQualities(),
        getPositions()
      ]);
      setQualities(qualitiesData);
      setPositions(positionsData);
      
      setPositionDialog(false);
      setNewPosition({ title: '', selectedQualities: [] });
    } catch (error) {
      console.error('Error creating position:', error);
      alert('Error creating position');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPosition = async () => {
    if (!editingPosition) return;
    
    try {
      setLoading(true);
      await updatePosition(editingPosition.id, {
        title: editingPosition.title,
        quality_ids: editingPosition.qualities?.map(q => q.id) || []
      });
      
      const [qualitiesData, positionsData] = await Promise.all([
        getQualities(),
        getPositions()
      ]);
      setQualities(qualitiesData);
      setPositions(positionsData);
      
      setPositionEditDialog(false);
      setEditingPosition(null);
    } catch (error) {
      console.error('Error updating position:', error);
      alert('Error updating position');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePosition = async (positionId: number) => {
    if (!window.confirm('Are you sure you want to delete this position?')) return;

    try {
      setLoading(true);
      await deletePosition(positionId);
      
      const [qualitiesData, positionsData] = await Promise.all([
        getQualities(),
        getPositions()
      ]);
      setQualities(qualitiesData);
      setPositions(positionsData);
    } catch (error) {
      console.error('Error deleting position:', error);
      alert('Error deleting position');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditPosition = (position: Position) => {
    const fullQualities = (position.qualities || []).map(q =>
      qualities.find(qual => qual.id === q.id) || q
    );
    setEditingPosition({ ...position, qualities: fullQualities });
    setPositionEditDialog(true);
  };

  const handleCreateQuality = async () => {
    try {
      setLoading(true);
      await createQuality({
        name: newQuality.name
      });
      
      const [qualitiesData, positionsData] = await Promise.all([
        getQualities(),
        getPositions()
      ]);
      setQualities(qualitiesData);
      setPositions(positionsData);
      
      setQualityDialog(false);
      setNewQuality({ name: '' });
    } catch (error) {
      console.error('Error creating quality:', error);
      alert('Error creating quality');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuality = async () => {
    if (!editingQuality) return;
    
    try {
      setLoading(true);
      await updateQuality(editingQuality.id, {
        name: editingQuality.name
      });
      
      const [qualitiesData, positionsData] = await Promise.all([
        getQualities(),
        getPositions()
      ]);
      setQualities(qualitiesData);
      setPositions(positionsData);
      
      setQualityEditDialog(false);
      setEditingQuality(null);
    } catch (error) {
      console.error('Error updating quality:', error);
      alert('Error updating quality');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuality = async (qualityId: number) => {
    if (!window.confirm('Are you sure you want to delete this quality?')) return;

    try {
      setLoading(true);
      await deleteQuality(qualityId);
      
      const [qualitiesData, positionsData] = await Promise.all([
        getQualities(),
        getPositions()
      ]);
      setQualities(qualitiesData);
      setPositions(positionsData);
    } catch (error) {
      console.error('Error deleting quality:', error);
      alert('Error deleting quality');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditQuality = (quality: Quality) => {
    setEditingQuality(quality);
    setQualityEditDialog(true);
  };

  const handleMakeAdmin = async () => {
    try {
      if (!newAdminUsername.trim()) return;
      
      const username = newAdminUsername.trim().replace(/^@/, '');
      await makeUserAdminByUsername(username);
      
      setAdminMessage({
        type: 'success',
        message: `User @${username} has been successfully made an administrator!`
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
        message: 'Error making user admin. Please check the username and try again.'
      });
    }
  };

  const handleViewInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setDetailsDialogOpen(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#000000',
        position: 'relative',
      }}
    >
      <BackgroundDecoration />

      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <CircularGlyph size={80} />
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 700,
                mt: 3,
                mb: 1,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #20F6D2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography sx={{ color: '#AAA', fontSize: '1.1rem' }}>
              HR System Management Panel
            </Typography>
          </Box>
        </Fade>

        {/* Navigation Tabs */}
        <Paper
          sx={{
            bgcolor: 'rgba(15, 15, 15, 0.95)',
            border: '1px solid rgba(123, 66, 246, 0.2)',
            borderRadius: '16px',
            mb: 4,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: '#AAA',
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '1rem',
                '&.Mui-selected': {
                  color: '#20F6D2',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#20F6D2',
                height: 3,
              },
            }}
          >
            <Tab label="Positions" icon={<WorkIcon />} />
            <Tab label="Qualities" icon={<AssessmentIcon />} />
            <Tab label="Interviews" icon={<PersonIcon />} />
            <Tab label="Users" icon={<PeopleIcon />} />
            <Tab label="Admins" icon={<AdminIcon />} />
          </Tabs>
        </Paper>

        {/* Positions Tab */}
        <TabPanel value={tabValue} index={0}>
          <CollapsibleCard
            title="Vacancy Management"
            icon={<WorkIcon />}
            defaultExpanded={true}
          >
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <ModernButton
                variant="secondary"
                startIcon={<RefreshIcon />}
                onClick={loadData}
                disabled={loading}
              >
                Refresh
              </ModernButton>
              <ModernButton
                variant="primary"
                startIcon={<AddIcon />}
                onClick={() => setPositionDialog(true)}
              >
                Add Position
              </ModernButton>
            </Box>

            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {positions.map((position) => (
                <Card
                  key={position.id}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(123, 66, 246, 0.2)',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'rgba(32, 246, 210, 0.4)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        {position.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditPosition(position)}
                          disabled={loading}
                          sx={{ color: '#20F6D2' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePosition(position.id)}
                          disabled={loading}
                          sx={{ color: '#FF6B6B' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {position.qualities && position.qualities.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#AAA', mb: 1 }}>
                          Required Qualities:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {position.qualities.map((quality) => (
                            <Chip
                              key={quality.id}
                              label={quality.name}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(123, 66, 246, 0.2)',
                                color: '#7B42F6',
                                fontSize: '0.75rem',
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Chip
                      label={position.is_active ? 'Active' : 'Inactive'}
                      color={position.is_active ? 'success' : 'default'}
                      size="small"
                      sx={{
                        bgcolor: position.is_active ? 'rgba(32, 246, 210, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        color: position.is_active ? '#20F6D2' : '#AAA',
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CollapsibleCard>
        </TabPanel>

        {/* Qualities Tab */}
        <TabPanel value={tabValue} index={1}>
          <CollapsibleCard
            title="Quality Management"
            icon={<AssessmentIcon />}
            defaultExpanded={true}
          >
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <ModernButton
                variant="secondary"
                startIcon={<RefreshIcon />}
                onClick={loadData}
                disabled={loading}
              >
                Refresh
              </ModernButton>
              <ModernButton
                variant="primary"
                startIcon={<AddIcon />}
                onClick={() => setQualityDialog(true)}
              >
                Add Quality
              </ModernButton>
            </Box>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {qualities.map((quality) => (
                <Card
                  key={quality.id}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(123, 66, 246, 0.2)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'rgba(32, 246, 210, 0.4)',
                    }
                  }}
                >
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: 'white', fontWeight: 500 }}>
                      {quality.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditQuality(quality)}
                        sx={{ color: '#20F6D2' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteQuality(quality.id)}
                        sx={{ color: '#FF6B6B' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CollapsibleCard>
        </TabPanel>

        {/* Interviews Tab */}
        <TabPanel value={tabValue} index={2}>
          <CollapsibleCard title="Interview Management" icon={<PersonIcon />} defaultExpanded={true}>
            <Box sx={{ mb: 4 }}>
              <ModernButton
                variant="secondary"
                startIcon={<RefreshIcon />}
                onClick={loadData}
                disabled={loading}
              >
                Refresh Interviews
              </ModernButton>
            </Box>

            <TableContainer component={Paper} sx={{
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(123, 66, 246, 0.2)',
              borderRadius: '12px'
            }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#20F6D2', fontWeight: 600 }}>Candidate</TableCell>
                    <TableCell sx={{ color: '#20F6D2', fontWeight: 600 }}>Position</TableCell>
                    <TableCell sx={{ color: '#20F6D2', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: '#20F6D2', fontWeight: 600 }}>Score</TableCell>
                    <TableCell sx={{ color: '#20F6D2', fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ color: '#20F6D2', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {interviews.map((interview) => (
                    <TableRow key={interview.id} sx={{ '&:hover': { bgcolor: 'rgba(123, 66, 246, 0.1)' } }}>
                      <TableCell sx={{ color: 'white' }}>
                        {interview.user?.first_name} {interview.user?.last_name || ''}
                        {interview.user?.username && (
                          <Typography variant="caption" sx={{ color: '#AAA', display: 'block' }}>
                            @{interview.user.username}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>{interview.position?.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={interview.status}
                          size="small"
                          sx={{
                            bgcolor: interview.status === 'completed' ? 'rgba(32, 246, 210, 0.2)' : 'rgba(123, 66, 246, 0.2)',
                            color: interview.status === 'completed' ? '#20F6D2' : '#7B42F6',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>
                        {interview.score !== undefined ? `${interview.score}/${interview.max_score}` : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>
                        {new Date(interview.started_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewInterview(interview)}
                          sx={{ color: '#20F6D2' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CollapsibleCard>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={3}>
          <CollapsibleCard title="User Management" icon={<PeopleIcon />} defaultExpanded={true}>
            <Typography sx={{ color: '#AAA' }}>User management features will be implemented here.</Typography>
          </CollapsibleCard>
        </TabPanel>

        {/* Admins Tab */}
        <TabPanel value={tabValue} index={4}>
          <CollapsibleCard title="Administrator Management" icon={<AdminIcon />} defaultExpanded={true}>
            <ModernButton
              variant="primary"
              startIcon={<AddIcon />}
              onClick={() => setAdminDialog(true)}
            >
              Add Administrator
            </ModernButton>
          </CollapsibleCard>
        </TabPanel>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 8, pt: 4, borderTop: '1px solid rgba(123, 66, 246, 0.2)' }}>
          <Typography sx={{ color: '#666', fontSize: '0.875rem' }}>
            powered by Quantum Insight Ecosystem
          </Typography>
        </Box>
      </Container>

      {/* Dialogs */}
      <ModernDialog
        open={positionDialog}
        onClose={() => setPositionDialog(false)}
        title="Create New Position"
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ModernButton variant="secondary" onClick={() => setPositionDialog(false)}>
              Cancel
            </ModernButton>
            <ModernButton variant="primary" onClick={handleCreatePosition}>
              Create Position
            </ModernButton>
          </Box>
        }
      >
        <ModernTextField
          label="Position Title"
          placeholder="Enter position title"
          value={newPosition.title}
          onChange={(value) => setNewPosition(prev => ({ ...prev, title: value }))}
        />

        <Typography sx={{ color: '#AAA', mb: 2, fontSize: '0.9rem', fontWeight: 500 }}>
          Select Required Qualities:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {qualities.map((quality) => (
            <FormControlLabel
              key={quality.id}
              control={
                <Checkbox
                  checked={newPosition.selectedQualities.includes(quality.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setNewPosition(prev => ({
                        ...prev,
                        selectedQualities: [...prev.selectedQualities, quality.id]
                      }));
                    } else {
                      setNewPosition(prev => ({
                        ...prev,
                        selectedQualities: prev.selectedQualities.filter(id => id !== quality.id)
                      }));
                    }
                  }}
                  sx={{
                    color: '#7B42F6',
                    '&.Mui-checked': {
                      color: '#20F6D2',
                    },
                  }}
                />
              }
              label={<Typography sx={{ color: '#AAA', fontSize: '0.9rem' }}>{quality.name}</Typography>}
            />
          ))}
        </Box>
      </ModernDialog>

      {/* Edit Position Dialog */}
      <ModernDialog
        open={positionEditDialog}
        onClose={() => setPositionEditDialog(false)}
        title="Edit Position"
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ModernButton variant="secondary" onClick={() => setPositionEditDialog(false)}>
              Cancel
            </ModernButton>
            <ModernButton variant="primary" onClick={handleEditPosition}>
              Update Position
            </ModernButton>
          </Box>
        }
      >
        {editingPosition && (
          <>
            <ModernTextField
              label="Position Title"
              placeholder="Enter position title"
              value={editingPosition.title}
              onChange={(value) => setEditingPosition(prev => prev ? { ...prev, title: value } : null)}
            />

            <Typography sx={{ color: '#AAA', mb: 2, fontSize: '0.9rem', fontWeight: 500 }}>
              Select Required Qualities:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {qualities.map((quality) => (
                <FormControlLabel
                  key={quality.id}
                  control={
                    <Checkbox
                      checked={editingPosition.qualities?.some(q => q.id === quality.id) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingPosition(prev => prev ? {
                            ...prev,
                            qualities: [...(prev.qualities || []), quality]
                          } : null);
                        } else {
                          setEditingPosition(prev => prev ? {
                            ...prev,
                            qualities: (prev.qualities || []).filter(q => q.id !== quality.id)
                          } : null);
                        }
                      }}
                      sx={{
                        color: '#7B42F6',
                        '&.Mui-checked': {
                          color: '#20F6D2',
                        },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: '#AAA', fontSize: '0.9rem' }}>{quality.name}</Typography>}
                />
              ))}
            </Box>
          </>
        )}
      </ModernDialog>

      <ModernDialog
        open={qualityDialog}
        onClose={() => setQualityDialog(false)}
        title="Create New Quality"
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ModernButton variant="secondary" onClick={() => setQualityDialog(false)}>
              Cancel
            </ModernButton>
            <ModernButton variant="primary" onClick={handleCreateQuality}>
              Create Quality
            </ModernButton>
          </Box>
        }
      >
        <ModernTextField
          label="Quality Name"
          placeholder="Enter quality name"
          value={newQuality.name}
          onChange={(value) => setNewQuality({ name: value })}
        />
      </ModernDialog>

      {/* Edit Quality Dialog */}
      <ModernDialog
        open={qualityEditDialog}
        onClose={() => setQualityEditDialog(false)}
        title="Edit Quality"
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ModernButton variant="secondary" onClick={() => setQualityEditDialog(false)}>
              Cancel
            </ModernButton>
            <ModernButton variant="primary" onClick={handleEditQuality}>
              Update Quality
            </ModernButton>
          </Box>
        }
      >
        {editingQuality && (
          <ModernTextField
            label="Quality Name"
            placeholder="Enter quality name"
            value={editingQuality.name}
            onChange={(value) => setEditingQuality(prev => prev ? { ...prev, name: value } : null)}
          />
        )}
      </ModernDialog>

      <ModernDialog
        open={adminDialog}
        onClose={() => setAdminDialog(false)}
        title="Add Administrator"
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ModernButton variant="secondary" onClick={() => setAdminDialog(false)}>
              Cancel
            </ModernButton>
            <ModernButton variant="primary" onClick={handleMakeAdmin}>
              Add Administrator
            </ModernButton>
          </Box>
        }
      >
        <ModernTextField
          label="Username"
          placeholder="Enter username (without @)"
          value={newAdminUsername}
          onChange={setNewAdminUsername}
        />
        {adminMessage && (
          <Alert
            severity={adminMessage.type}
            sx={{
              mt: 2,
              bgcolor: adminMessage.type === 'success'
                ? 'rgba(32, 246, 210, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
              color: adminMessage.type === 'success' ? '#20F6D2' : '#FF6B6B',
              border: `1px solid ${adminMessage.type === 'success' ? 'rgba(32, 246, 210, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
          >
            {adminMessage.message}
          </Alert>
        )}
      </ModernDialog>

      {/* Interview Details Dialog */}
      <ModernDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        title="Interview Details"
        actions={
          <ModernButton variant="primary" onClick={() => setDetailsDialogOpen(false)}>
            Close
          </ModernButton>
        }
      >
        {selectedInterview && (
          <Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Candidate: {selectedInterview.user?.first_name} {selectedInterview.user?.last_name || ''}
            </Typography>
            <Typography sx={{ color: '#AAA', mb: 2 }}>
              Position: {selectedInterview.position?.title}
            </Typography>
            <Typography sx={{ color: '#AAA', mb: 2 }}>
              Status: {selectedInterview.status}
            </Typography>
            {selectedInterview.score !== undefined && (
              <Typography sx={{ color: '#AAA', mb: 2 }}>
                Score: {selectedInterview.score}/{selectedInterview.max_score}
              </Typography>
            )}
            <Typography sx={{ color: '#AAA', mb: 3 }}>
              Started: {new Date(selectedInterview.started_at).toLocaleString()}
            </Typography>

            {Object.keys(selectedInterview.answers).length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ color: '#20F6D2', mb: 2 }}>
                  Answers:
                </Typography>
                {Object.entries(selectedInterview.answers).map(([question, answer], index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography sx={{ color: '#7B42F6', mb: 1, fontSize: '0.9rem' }}>
                      Q{index + 1}: {question}
                    </Typography>
                    <Typography sx={{ color: '#AAA', fontSize: '0.9rem' }}>
                      {answer}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </ModernDialog>
    </Box>
  );
};

export default AdminPanel;

