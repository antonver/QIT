import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Drawer,
    List,
    Box,
    Button,
    Avatar,
    CssBaseline,
    IconButton,
    Typography,
    useTheme,
    useMediaQuery,
    ListItemButton,
    ListItemIcon,
    Tooltip,
    ListItem
} from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import ProfileCard from './ProfileCard.tsx';
import Home from '../pages/Home';
import RoutineTracker from '../pages/RoutineTracker.tsx';
import backgroundImage from '../assets/background.png';
import Lottie from 'lottie-react';
import startAnimation from '../assets/star.json';
import speech from '../assets/Speech.json';
import chemistry from '../assets/chemistry.json';
import crown from '../assets/Crown.json';
import film from '../assets/film.json';
import dev from '../assets/devlogs.json';
import tresor from '../assets/tresor.json';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import Messages from '../pages/Messages.tsx';
import Drops from '../pages/Drops.tsx';
import Temporary from '../pages/Temporary.tsx';
import DevLog from '../pages/DevLog.tsx';
import Marketing from '../pages/Marketing.tsx';
import Music from '../pages/Music.tsx';
import General from '../pages/General.tsx';
import Politics from '../pages/Politics.tsx';
import Design from '../pages/Design.tsx';
import HRBot from '../pages/HRBot.tsx';
import MenuIcon from '@mui/icons-material/Menu';

const NAVIGATION = [
    {
        kind: 'header',
        title: '',
    },
    {
        segment: 'messages',
        title: 'Все',
        icon: <div style={{ width: '2em' }}><Lottie animationData={speech} /></div>,
    },
    {
        segment: 'drops',
        title: 'Дропы',
        icon: <div style={{ width: '2em' }}><Lottie animationData={startAnimation} /></div>,
    },
    {
        segment: 'temporary',
        title: 'Temporary',
        icon: <div style={{ width: '2em', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p >❗</p>
        </div>,
    },
    {
        segment: 'devlog',
        title: 'DevLog',
        icon: <div style={{ width: '2em' }}><Lottie animationData={dev} /></div>,
    },
    {
        segment: 'marketing',
        title: 'Маркетинг',
        icon: <div style={{ width: '2em' }}><Lottie animationData={chemistry} /></div>,
    },
    {
        segment: 'music',
        title: 'Музыка',
        icon: <div style={{ width: '2em' }}><Lottie animationData={tresor} /></div>,
    },
    {
        segment: 'design',
        title: 'Дизайн',
        icon: <div style={{ width: '2em' }}><Lottie animationData={crown} /></div>,
    },
    {
        segment: 'general',
        title: 'General',
        icon: <div style={{ width: '2em', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow:"hidden" }}>
            <p style={{ fontSize: '1.7em' }}>#</p>
        </div>,
    },
    {
        segment: 'politics',
        title: 'Политика',
        icon: <div style={{ width: '2em' }}><Lottie animationData={film} /></div>,
    },
    {
        segment: 'hrbot',
        title: 'HR Bot',
        icon: <div style={{ width: '2em', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5em' }}>🤖</span>
        </div>,
    },
];

const SIDEBAR_WIDTH = 88;

const drawerFooter = {
    position: 'relative',
    top: 'auto',
    bottom: 0,
    boxSizing: 'border-box'
};

export default function DashboardLayoutBasic() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [brand, setBrand] = useState<string>('QIP mini');
    const [logo, setLogo] = useState<React.ReactNode>('');
    const location = useLocation();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        const pathname = location.pathname.replace('/', '');
        const currentNavItem = NAVIGATION.find(
            (item): item is typeof item & { segment: string; icon: React.ReactNode } => 'segment' in item && item.segment === pathname
        );

        if (currentNavItem) {
            setBrand(currentNavItem.title);
            setLogo(currentNavItem.icon);
        } else {
            switch (location.pathname) {
                case '/profile':
                    setBrand('Profile Page');
                    setLogo('');
                    break;
                case '/routine':
                    setBrand('Routine Tracker');
                    setLogo('');
                    break;
                case '/':
                    setBrand('Chat');
                    setLogo('');
                    break;
                default:
                    setBrand('QIP mini');
                    setLogo('');
            }
        }
    }, [location.pathname]);

    const navList = (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            minHeight: 0,
            p: 0
        }}>
            {/* Основное меню */}
            <List sx={{ p: 0 }}>
                {NAVIGATION.filter(item => item.segment && item.segment !== 'hrbot').map((item) => (
                    <ListItem disablePadding sx={{ flexDirection: 'column', alignItems: 'center', mb: 0.5 }} key={item.segment}>
                        <ListItemButton
                            selected={location.pathname.replace('/', '') === item.segment}
                            onClick={() => { navigate(`/${item.segment}`); setDrawerOpen(false); }}
                            sx={{
                                minWidth: 0,
                                flexDirection: 'column',
                                alignItems: 'center',
                                borderRadius: 3,
                                bgcolor: location.pathname.replace('/', '') === item.segment ? 'rgba(64,196,255,0.12)' : 'transparent',
                                py: 1,
                                px: 0,
                                width: '100%',
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 0, justifyContent: 'center', mb: 0.2 }}>
                                <Box sx={{
                                    fontSize: { xs: 18, sm: 22, md: 26 },
                                    width: { xs: 22, sm: 26, md: 32 },
                                    height: { xs: 22, sm: 26, md: 32 },
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>{item.icon}</Box>
                            </ListItemIcon>
                            <Typography variant="caption" sx={{
                                color: '#b0bec5',
                                fontSize: { xs: 8, sm: 9, md: 10 },
                                mt: 0.1,
                                textAlign: 'center',
                                lineHeight: 1.1
                            }}>{item.title}</Typography>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            {/* Футер с аватаром строго внизу */}
            <List sx={{ mt: 'auto', alignSelf: 'stretch', mb: 0, p: 0 }}>
                <ListItem disablePadding sx={{ mt: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <ListItemButton
                        onClick={() => { navigate('/profile'); setDrawerOpen(false); }}
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}
                    >
                        <Avatar sx={{ width: 44, height: 44, bgcolor: deepPurple[500], cursor: 'pointer' }}>OP</Avatar>
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{
            display: 'flex',
            height: '100vh',
            backgroundColor: 'transparent',
            overflowY: 'hidden',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
        }}>
            <CssBaseline />
            {/* Sidebar for desktop */}
            {!isMobile && (
                <Box sx={{
                    width: SIDEBAR_WIDTH,
                    bgcolor: '#232b3b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRight: '1.5px solid #26324a',
                    minHeight: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: 1201,
                    boxShadow: '2px 0 8px 0 #0001',
                    py: 0,
                }}>
                    {navList}
                </Box>
            )}
            {/* Drawer for mobile */}
            {isMobile && (
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    PaperProps={{
                        sx: {
                            width: SIDEBAR_WIDTH + 32,
                            bgcolor: '#232b3b',
                            pt: 0,
                            top: '56px',
                            height: 'calc(100% - 56px)'
                        }
                    }}
                >
                    {navList}
                </Drawer>
            )}
            <Box sx={{ flex: 1, ml: !isMobile ? `${SIDEBAR_WIDTH}px` : 0, minWidth: 0 }}>
                <AppBar
                    position="fixed"
                    sx={{
                        zIndex: 1200,
                        backgroundColor: 'background.paper',
                        boxShadow: 'none',
                        left: !isMobile ? SIDEBAR_WIDTH : 0,
                        width: !isMobile ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%'
                    }}
                >
                    <Toolbar sx={{ minHeight: isMobile ? '56px' : '64px' }}>
                        {isMobile && (
                            <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
                                <MenuIcon />
                            </IconButton>
                        )}
                        {logo}
                        <Box sx={{
                            ml: 2,
                            color: 'white',
                            fontSize: isMobile ? '1.2rem' : '1.5rem',
                            fontWeight: 500
                        }}>
                            {brand}
                        </Box>
                    </Toolbar>
                </AppBar>
                {/* Контент приложения */}
                <Box sx={{ pt: isMobile ? 7 : 8, pl: 0, pr: 0, height: '100vh', overflowY: 'auto' }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/routine" element={<RoutineTracker />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/drops" element={<Drops />} />
                        <Route path="/temporary" element={<Temporary />} />
                        <Route path="/devlog" element={<DevLog />} />
                        <Route path="/marketing" element={<Marketing />} />
                        <Route path="/music" element={<Music />} />
                        <Route path="/design" element={<Design />} />
                        <Route path="/general" element={<General />} />
                        <Route path="/politics" element={<Politics />} />
                        <Route path="/hrbot" element={<HRBot />} />
                    </Routes>
                </Box>
            </Box>
        </Box>
    );
}