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
    useMediaQuery
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
import NewTheme from '../pages/NewTheme.tsx';
import Design from '../pages/Design.tsx';
import HRBot from '../pages/HRBot.tsx';
import TestPage from '../pages/TestPage.tsx';
import MenuIcon from '@mui/icons-material/Menu';
import PageTransition from './PageTransition.tsx';

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
    {
        segment: 'test',
        title: 'Test Page',
        icon: <div style={{ width: '2em', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5em' }}>🧪</span>
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        <Box sx={{ 
            display: 'flex', 
            height: '100vh', 
            backgroundColor: 'transparent', 
            overflowY: 'hidden',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    zIndex: 1201,
                    backgroundColor: 'rgba(18, 18, 18, 0.8)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Toolbar sx={{ minHeight: isMobile ? '56px' : '64px' }}>
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
            <Drawer
                variant="temporary"
                open={isClosing}
                onClose={() => setIsClosing(false)}
                sx={{
                    width: isMobile ? '100%' : 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: isMobile ? '100%' : 240,
                        boxSizing: 'border-box',
                        backgroundColor: 'rgba(18, 18, 18, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        overflowY: 'auto',
                        scrollBehavior: 'smooth',
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '3px',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.5)',
                            },
                        },
                    },
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    pt: isMobile ? 8 : 0
                }}>
                    <List sx={{ flexGrow: 1, pt: 2 }}>
                        {NAVIGATION.map((item, index) => {
                            if (item.kind === 'header') {
                                return (
                                    <Box key={index} sx={{ 
                                        p: 2, 
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                        mb: 2
                                    }}>
                                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                            Navigation
                                        </Typography>
                                    </Box>
                                );
                            }

                            const isActive = location.pathname === `/${item.segment}`;
                            
                            return (
                                <Button
                                    key={item.segment}
                                    onClick={() => {
                                        navigate(`/${item.segment}`);
                                        if (isMobile) {
                                            setIsClosing(false);
                                        }
                                    }}
                                    sx={{
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        px: 3,
                                        py: 2,
                                        mb: 1,
                                        mx: 1,
                                        borderRadius: 2,
                                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                            transform: 'translateX(4px)',
                                            transition: 'all 0.2s ease-in-out'
                                        },
                                        transition: 'all 0.2s ease-in-out',
                                        border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        {item.icon}
                                        <Typography sx={{ ml: 2, fontSize: isMobile ? '1rem' : '0.9rem' }}>
                                            {item.title}
                                        </Typography>
                                    </Box>
                                </Button>
                            );
                        })}
                    </List>
                    <SidebarFooter />
                </Box>
            </Drawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    pt: isMobile ? '56px' : '64px',
                    height: '100vh',
                    overflow: 'hidden',
                    position: 'relative'
                }}
                onClick={handleMainClick}
            >
                <PageTransition>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/drops" element={<Drops />} />
                        <Route path="/temporary" element={<Temporary />} />
                        <Route path="/devlog" element={<DevLog />} />
                        <Route path="/marketing" element={<Marketing />} />
                        <Route path="/music" element={<Music />} />
                        <Route path="/design" element={<Design />} />
                        <Route path="/general" element={<General />} />
                        <Route path="/politics" element={<Politics />} />
                        <Route path="/newtheme" element={<NewTheme />} />
                        <Route path="/hrbot" element={<HRBot />} />
                        <Route path="/test" element={<TestPage />} />
                        <Route path="/profile" element={<ProfileCard />} />
                        <Route path="/routine" element={<RoutineTracker />} />
                    </Routes>
                </PageTransition>
            </Box>
        </Box>
    );
}