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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>Loading candidates data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={handleRefresh}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        HR Panel - Candidate Management
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
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
              />
            </Box>
            <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
              <TextField
                label="Min Score"
                type="number"
                value={filters.minScore}
                onChange={(e) => handleFilterChange('minScore', Number(e.target.value))}
                fullWidth
              />
            </Box>
            <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Export Data">
                <IconButton onClick={handleExport}>
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh}>
                  <Refresh />
                </IconButton>
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
              <TableRow key={candidate.id}>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={`${candidate.score}%`}
                    color={candidate.score >= 80 ? 'success' : candidate.score >= 60 ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={candidate.status === 'completed' ? 'Completed' : 'In Progress'}
                    color={candidate.status === 'completed' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(candidate.startedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
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
  );
};

export default HRPanel; 