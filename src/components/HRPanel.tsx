import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Sort,
  Download,
  Refresh
} from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { getStats } from '../services/api';

interface Candidate {
  id: string;
  name: string;
  email: string;
  score: number;
  status: 'completed' | 'in_progress';
  completedAt?: string;
  startedAt: string;
}

interface Filters {
  dateFrom: string;
  dateTo: string;
  minScore: number;
  status: string;
}

const HRPanel: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [filters, setFilters] = useState<Filters>({
    dateFrom: '',
    dateTo: '',
    minScore: 0,
    status: 'all'
  });
  const [sortBy, setSortBy] = useState<'score' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Load candidates data
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setIsLoading(true);
        const stats = await getStats();
        setCandidates(stats.candidates || []);
        setFilteredCandidates(stats.candidates || []);
      } catch (err) {
        setError('Failed to load candidates data');
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...candidates];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    // Apply score filter
    if (filters.minScore > 0) {
      filtered = filtered.filter(c => c.score >= filters.minScore);
    }

    // Apply date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(c => new Date(c.startedAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(c => new Date(c.startedAt) <= new Date(filters.dateTo));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortBy === 'score') {
        aValue = a.score;
        bValue = b.score;
      } else {
        aValue = new Date(a.startedAt);
        bValue = new Date(b.startedAt);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCandidates(filtered);
  }, [candidates, filters, sortBy, sortOrder]);

  // Handle filter changes
  const handleFilterChange = (field: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Handle sort change
  const handleSortChange = (field: 'score' | 'date') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Export data
  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Score', 'Status', 'Started At', 'Completed At'],
      ...filteredCandidates.map(c => [
        c.name,
        c.email,
        c.score.toString(),
        c.status,
        new Date(c.startedAt).toLocaleDateString(),
        c.completedAt ? new Date(c.completedAt).toLocaleDateString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Refresh data
  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <Box sx={{ 
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          p: 4,
          textAlign: 'center'
        }}>
          <Typography>Loading candidates data...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <Box sx={{ 
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          p: 4,
          textAlign: 'center'
        }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={handleRefresh}>
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundImage: 'url(/background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
      py: 3,
      px: 2
    }}>
      <Box sx={{ 
        maxWidth: '1200px', 
        mx: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        p: 3,
        minHeight: 'calc(100vh - 48px)' // 48px для padding
      }}>
        <Typography variant="h4" gutterBottom>
          HR Panel - Candidate Management
        </Typography>

        {/* Filters */}
        <Card sx={{ mb: 3, bgcolor: 'rgba(35, 43, 59, 0.95)', borderRadius: 4, border: '2px solid #7C3AED', boxShadow: 'none' }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <TextField
                  label="Date From"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{
                    bgcolor: '#181820',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#7C3AED' },
                      '&:hover fieldset': { borderColor: '#8B5CF6' },
                      '&.Mui-focused fieldset': { borderColor: '#8B5CF6' },
                    },
                    input: { color: 'white' },
                    label: { color: '#B0B0C3' },
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <TextField
                  label="Date To"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{
                    bgcolor: '#181820',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#7C3AED' },
                      '&:hover fieldset': { borderColor: '#8B5CF6' },
                      '&.Mui-focused fieldset': { borderColor: '#8B5CF6' },
                    },
                    input: { color: 'white' },
                    label: { color: '#B0B0C3' },
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
                <TextField
                  label="Min Score"
                  type="number"
                  value={filters.minScore}
                  onChange={(e) => handleFilterChange('minScore', Number(e.target.value))}
                  fullWidth
                  sx={{
                    bgcolor: '#181820',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#7C3AED' },
                      '&:hover fieldset': { borderColor: '#8B5CF6' },
                      '&.Mui-focused fieldset': { borderColor: '#8B5CF6' },
                    },
                    input: { color: 'white' },
                    label: { color: '#B0B0C3' },
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
                <FormControl fullWidth sx={{ bgcolor: '#181820', borderRadius: 2 }}>
                  <InputLabel sx={{ color: '#B0B0C3' }}>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      color: 'white',
                      borderRadius: 2,
                      '.MuiOutlinedInput-notchedOutline': { borderColor: '#7C3AED' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8B5CF6' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8B5CF6' },
                      bgcolor: '#181820',
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: '#232B3B',
                          color: 'white',
                          borderRadius: 2,
                        },
                      },
                    }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Export Data">
                  <Button onClick={handleExport} sx={{
                    bgcolor: 'linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)',
                    color: 'white',
                    borderRadius: 2,
                    px: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'linear-gradient(90deg, #6D28D9 0%, #7C3AED 100%)' }
                  }}>Export</Button>
                </Tooltip>
                <Tooltip title="Refresh">
                  <Button onClick={handleRefresh} sx={{
                    bgcolor: 'linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)',
                    color: 'white',
                    borderRadius: 2,
                    px: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'linear-gradient(90deg, #6D28D9 0%, #7C3AED 100%)' }
                  }}>Refresh</Button>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </Typography>
        </Box>

        {/* Candidates Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                       onClick={() => handleSortChange('score')}>
                    Score
                    <Sort sx={{ ml: 1, transform: sortBy === 'score' && sortOrder === 'asc' ? 'rotate(180deg)' : 'none' }} />
                  </Box>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                       onClick={() => handleSortChange('date')}>
                    Started At
                    <Sort sx={{ ml: 1, transform: sortBy === 'date' && sortOrder === 'asc' ? 'rotate(180deg)' : 'none' }} />
                  </Box>
                </TableCell>
                <TableCell>Completed At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id}
                  sx={{
                    bgcolor: 'rgba(124, 58, 237, 0.08)',
                    boxShadow: '0 2px 12px 0 rgba(124, 58, 237, 0.10)',
                    transition: 'background 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(139, 92, 246, 0.18)',
                    },
                  }}
                >
                  <TableCell sx={{ borderTopLeftRadius: 12, borderBottomLeftRadius: 12, bgcolor: 'inherit' }}>{candidate.name}</TableCell>
                  <TableCell sx={{ bgcolor: 'inherit' }}>{candidate.email}</TableCell>
                  <TableCell sx={{ bgcolor: 'inherit' }}>
                    <Chip 
                      label={`${candidate.score}%`}
                      color={candidate.score >= 80 ? 'success' : candidate.score >= 60 ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'inherit' }}>
                    <Chip 
                      label={candidate.status === 'completed' ? 'Completed' : 'In Progress'}
                      color={candidate.status === 'completed' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'inherit' }}>{new Date(candidate.startedAt).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ borderTopRightRadius: 12, borderBottomRightRadius: 12, bgcolor: 'inherit' }}>
                    {candidate.completedAt 
                      ? new Date(candidate.completedAt).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredCandidates.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No candidates match the current filters
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HRPanel; 