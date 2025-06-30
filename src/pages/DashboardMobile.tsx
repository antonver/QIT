import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Avatar, Badge, Divider, Paper, InputBase, Button, Chip, ListItemButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WarningIcon from '@mui/icons-material/Warning';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import GroupIcon from '@mui/icons-material/Group';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const sections = [
  { label: 'Новости', icon: <NewspaperIcon color="primary" /> },
  { label: 'DevLog', icon: <ShowChartIcon sx={{ color: 'red' }} /> },
  { label: 'Temporary', icon: <WarningIcon sx={{ color: '#ff9800' }} /> },
  { label: 'Маркетинг', icon: <StarIcon sx={{ color: '#e040fb' }} /> },
  { label: 'Дропы', icon: <LocalFireDepartmentIcon sx={{ color: '#ff3d00' }} /> },
  { label: 'General', icon: <GroupIcon color="info" /> },
  { label: 'Новая тема', icon: <AddCircleOutlineIcon color="success" /> },
];

const mockMessages = [
  {
    id: 1,
    user: { name: 'Temporary', avatar: '', color: '#607d8b' },
    text: '2 года не играл, а руки помнят ❤️',
    time: '18:05',
    image: 'https://i.imgur.com/0y8Ftya.jpg',
    reactions: [
      { emoji: '🔥', count: 1 },
      { emoji: '👨‍🎤', count: 2 },
    ],
  },
  // Можно добавить больше моков
];

const DashboardMobile: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('General');

  return (
    <Box sx={{ bgcolor: '#181c27', minHeight: '100vh', color: 'white' }}>
      {/* Верхняя панель */}
      <AppBar position="fixed" sx={{ bgcolor: '#232b3b', boxShadow: 'none' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Avatar sx={{ width: 36, height: 36, mr: 2 }}>С</Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Сименс и друзья <span style={{ fontSize: 18 }}>🌵</span></Typography>
            <Typography variant="caption" color="#b0bec5">49 участников</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Боковое меню */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, bgcolor: '#232b3b', height: '100%', color: 'white' }}>
          <List>
            {sections.map((section) => (
              <ListItem disablePadding key={section.label}>
                <ListItemButton selected={selectedSection === section.label} onClick={() => { setSelectedSection(section.label); setDrawerOpen(false); }}>
                  <ListItemIcon sx={{ color: 'inherit' }}>{section.icon}</ListItemIcon>
                  <ListItemText primary={section.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Основной контент */}
      <Box sx={{ pt: 8, pb: 7, maxWidth: 480, mx: 'auto' }}>
        {/* Лента сообщений */}
        {mockMessages.map((msg) => (
          <Paper key={msg.id} sx={{ mb: 2, p: 2, bgcolor: '#232b3b', borderRadius: 3, boxShadow: '0 2px 8px #0002', position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: msg.user.color, width: 32, height: 32, mr: 1 }}>{msg.user.name[0]}</Avatar>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#90caf9' }}>{msg.user.name}</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="caption" color="#b0bec5">{msg.time}</Typography>
            </Box>
            {msg.image && (
              <Box sx={{ mb: 1, borderRadius: 2, overflow: 'hidden', border: '1px solid #26324a' }}>
                <img src={msg.image} alt="attachment" style={{ width: '100%', borderRadius: 8 }} />
              </Box>
            )}
            <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>{msg.text}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {msg.reactions.map((r, i) => (
                <Chip key={i} label={`${r.emoji} ${r.count}`} size="small" sx={{ bgcolor: '#26324a', color: 'white' }} />
              ))}
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Фиксированная строка ввода */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#232b3b', p: 1, borderTop: '1px solid #26324a', display: 'flex', alignItems: 'center', maxWidth: 480, mx: 'auto' }}>
        <InputBase placeholder="Написать в General" sx={{ flex: 1, color: 'white', pl: 2 }} />
        <Button variant="contained" sx={{ ml: 1, bgcolor: '#40C4FF', color: 'white', borderRadius: 2, fontWeight: 'bold' }}>Отправить</Button>
      </Box>
    </Box>
  );
};

export default DashboardMobile; 