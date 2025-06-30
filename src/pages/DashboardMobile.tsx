import React, { useState } from 'react';
import { Box, List, ListItem, ListItemIcon, AppBar, Toolbar, Typography, Avatar, Paper, InputBase, Button, Chip, ListItemButton, Tooltip } from '@mui/material';
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

const SIDEBAR_WIDTH = 56;

const DashboardMobile: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('General');

  return (
    <Box sx={{ bgcolor: '#181c27', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'row' }}>
      {/* Always-visible thin vertical sidebar */}
      <Box sx={{
        width: SIDEBAR_WIDTH,
        bgcolor: '#232b3b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 1,
        borderRight: '1.5px solid #26324a',
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 10,
        boxShadow: '2px 0 8px 0 #0001',
      }}>
        <Avatar sx={{ width: 36, height: 36, mb: 2, mt: 1 }}>С</Avatar>
        <List sx={{ p: 0 }}>
          {sections.map((section) => (
            <Tooltip title={section.label} placement="right" key={section.label} arrow>
              <ListItem disablePadding sx={{ justifyContent: 'center' }}>
                <ListItemButton
                  selected={selectedSection === section.label}
                  onClick={() => setSelectedSection(section.label)}
                  sx={{
                    minWidth: 0,
                    px: 0.5,
                    py: 1.2,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: selectedSection === section.label ? 'rgba(64,196,255,0.12)' : 'transparent',
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 0, justifyContent: 'center' }}>
                    {section.icon}
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Box>

      {/* Main content to the right of sidebar */}
      <Box sx={{ flex: 1, ml: `${SIDEBAR_WIDTH}px`, minWidth: 0 }}>
        {/* Top bar */}
        <AppBar position="fixed" sx={{ bgcolor: '#232b3b', boxShadow: 'none', left: SIDEBAR_WIDTH, width: `calc(100% - ${SIDEBAR_WIDTH}px)` }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Сименс и друзья <span style={{ fontSize: 18 }}>🌵</span></Typography>
              <Typography variant="caption" color="#b0bec5">49 участников</Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box sx={{ pt: 8, pb: 7, maxWidth: 480, mx: 'auto' }}>
          {/* Message feed */}
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

        {/* Fixed input bar */}
        <Box sx={{ position: 'fixed', bottom: 0, left: SIDEBAR_WIDTH, right: 0, bgcolor: '#232b3b', p: 1, borderTop: '1px solid #26324a', display: 'flex', alignItems: 'center', maxWidth: 480, mx: 'auto', zIndex: 20 }}>
          <InputBase placeholder="Написать в General" sx={{ flex: 1, color: 'white', pl: 2 }} />
          <Button variant="contained" sx={{ ml: 1, bgcolor: '#40C4FF', color: 'white', borderRadius: 2, fontWeight: 'bold' }}>Отправить</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardMobile; 