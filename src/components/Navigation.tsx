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
    Typography
} from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import ProfileCard from './ProfileCard.tsx';
import Grid from '@mui/material/Grid';
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
import NewTheme from '../pages/NewTheme.tsx';
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
        segment: 'newtheme',
        title: 'Новая тема',
        icon: <div style={{ width: '2em' }}><ControlPointIcon style={{ color: 'rgba(39, 168, 245, 0.8)' }} /></div>,
    },
    {
        segment: 'hrbot',
        title: 'HR Bot',
        icon: <div style={{ width: '2em', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5em' }}>🤖</span>
        </div>,
    },
];

function SidebarFooter() {
    const navigate = useNavigate();
    return (
        <Box sx={{ justifyContent: 'left', display: 'flex', alignItems: 'center', padding: '1em' }}>
            <Button onClick={() => navigate('/profile')}>
                <Avatar sx={{ bgcolor: deepPurple[500] }}>OP</Avatar>
            </Button>
        </Box>
    );
}

export default function DashboardLayoutBasic() {
    const [brand, setBrand] = useState<string>('QIP mini');
    const [logo, setLogo] = useState<React.ReactNode>('');
    const location = useLocation();
    const navigate = useNavigate();
    const [isClosing, setIsClosing] = React.useState(false);
    const handleDrawerToggle = () => {
            setIsClosing(!isClosing);
    };

    const handleMainClick = () => {
        if (isClosing) {
            setIsClosing(false);
        }
    };

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

    return (
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'transparent', overflowY: 'hidden' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    zIndex: 1201,
                    backgroundColor: 'background.paper',
                    boxShadow: 'none',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    {logo}
                    <Box sx={{ ml: 2, color: 'white', fontSize: '1.5rem' }}>{brand}</Box>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="temporary"
                open={isClosing}
                onClose={() => setIsClosing(false)}
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 240,
                        boxSizing: 'border-box',
                        backgroundColor: 'background.paper',
                    },
                }}
            >
                <Toolbar /> {/* Spacer for AppBar */}
                <List
                    sx={{
                        '& .MuiListItem-root': {
                            transition: 'border-left 0.3s ease',
                            '&:hover': {
                                borderLeft: '4px solid #40C4FF',
                            },
                        },
                    }}
                >
                    {NAVIGATION.map((item, index) =>
                        item.kind === 'header' ? null : (
                            <Box
                                key={index}
                                onClick={() => navigate(`/${item.segment}`)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    maxHeight: '50px',
                                    borderLeft: location.pathname === `/${item.segment}` ? '4px solid #40C4FF' : '4px solid transparent',
                                    backgroundColor: location.pathname === `/${item.segment}` ? 'rgba(64,196,255,0.08)' : 'transparent',
                                    transition: 'border-left 0.3s ease, background-color 0.3s ease',
                                    '&:hover': {
                                        borderLeft: '4px solid #40C4FF',
                                        backgroundColor: 'rgba(64,196,255,0.04)',
                                    },
                                }}
                            >
                                <Box sx={{ marginRight: 2 }}>{item.icon}</Box>
                                <Typography>{item.title}</Typography>
                            </Box>
                        )
                    )}
                </List>
                <Box sx={{ flexGrow: 1 }} />
                <SidebarFooter />
            </Drawer>
            <Box
                component="main"
                onClick={handleMainClick}
                sx={{
                    flexGrow: 1,
                    pt: '64px',
                    minHeight: '100vh',
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    overflowY: 'auto',
                }}
            >
                <Routes>
                    <Route
                        path="/profile"
                        element={
                            <Grid container direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Grid size={{ xs: 12, sm: 8 }}>
                                    <ProfileCard />
                                </Grid>
                            </Grid>
                        }
                    />
                    <Route path="/" element={<Home />} />
                    <Route path="/routine" element={<RoutineTracker />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/drops" element={<Drops />} />
                    <Route path="/temporary" element={<Temporary />} />
                    <Route path="/devlog" element={<DevLog />} />
                    <Route path="/marketing" element={<Marketing />} />
                    <Route path="/music" element={<Music />} />
                    <Route path="/general" element={<General />} />
                    <Route path="/politics" element={<Politics />} />
                    <Route path="/newtheme" element={<NewTheme />} />
                    <Route path="/design" element={<Design />} />
                    <Route path="/hrbot" element={<HRBot />} />
                    <Route path="/hr/bot" element={<HRBot />} />
                    <Route path="/hr/bot/panel" element={<HRBot />} />
                </Routes>
            </Box>
        </Box>
    );
}