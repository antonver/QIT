import React, { useEffect, useState, lazy, memo } from 'react';
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
import { motion } from 'framer-motion';
import LazyPageLoader from './LazyPageLoader';
import ProfileCard from './ProfileCard.tsx';
import backgroundImage from '../assets/background.png';
import MenuIcon from '@mui/icons-material/Menu';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PsychologyIcon from '@mui/icons-material/Psychology';
import useOptimizedPerformance from '../hooks/useOptimizedPerformance';

// Lazy load страниц для лучшей производительности
const Home = lazy(() => import('../pages/Home'));
const HRBot = lazy(() => import('../pages/HRBot'));
const HRBotPage = lazy(() => import('../pages/HRBotPage'));
const TestPage = lazy(() => import('../pages/TestPage'));
const AeonChat = lazy(() => import('../pages/AeonChat'));

const NAVIGATION = [
    {
        kind: 'header',
        title: '',
    },
    {
        segment: 'hrbot-test',
        title: 'HR Bot',
        icon: <SmartToyIcon sx={{ color: '#40C4FF' }} />,
    },
    {
        segment: 'aeon',
        title: 'ÆON',
        icon: <PsychologyIcon sx={{ color: '#FF6B6B' }} />,
    },
];

const SIDEBAR_WIDTH = 88;

const drawerFooter = {
    position: 'relative',
    top: 'auto',
    bottom: 0,
    boxSizing: 'border-box'
};

const DashboardLayoutBasic = memo(() => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [brand, setBrand] = useState<string>('QIP mini');
    const [logo, setLogo] = useState<React.ReactNode>('');
    const location = useLocation();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    // Хук для оптимизации производительности
    useOptimizedPerformance();

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
            p: 0,
            pt: isMobile ? { xs: 7, sm: 8 } : 0, // Added top padding for mobile Drawer
        }}>
            {/* Основное меню */}
            <List sx={{ p: 0 }}>
                {NAVIGATION.filter(item => item.segment).map((item) => (
                    <ListItem 
                        disablePadding 
                        sx={{ 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            mb: 0.5,
                            position: 'relative' // Added for blue line positioning
                        }} 
                        key={item.segment}
                    >
                        <motion.div
                            whileHover={{ 
                                scale: 1.05,
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.95 }}
                            style={{ width: '100%' }}
                        >
                            <ListItemButton
                                selected={location.pathname.replace('/', '') === item.segment}
                                onClick={() => {
                                    navigate(`/${item.segment}`);
                                    setDrawerOpen(false);
                                }}
                                sx={{
                                    minWidth: 0,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    borderRadius: 3,
                                    bgcolor: location.pathname.replace('/', '') === item.segment ? 'rgba(64,196,255,0.12)' : 'transparent',
                                    py: 1,
                                    px: 0,
                                    width: '100%',
                                    transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0)',
                                    '&:hover': {
                                        bgcolor: location.pathname.replace('/', '') === item.segment 
                                            ? 'rgba(64,196,255,0.18)' 
                                            : 'rgba(255,255,255,0.05)',
                                        backdropFilter: 'blur(10px)',
                                    }
                                }}
                            >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 0, justifyContent: 'center', mb: 0.2 }}>
                                <Box sx={{
                                    fontSize: { xs: 18, sm: 22, md: 26 },
                                    width: { xs: 22, sm: 26, md: 32 },
                                    height: { xs: 22, sm: 26, md: 32 },
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center'
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
                        </motion.div>
                        {/* Blue line indicator for active item */}
                        {location.pathname.replace('/', '') === item.segment && (
                            <motion.div
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                exit={{ scaleY: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '4px',
                                    height: '32px',
                                    backgroundColor: '#40c4ff',
                                    borderRadius: '0 4px 4px 0',
                                    transformOrigin: 'center'
                                }}
                            />
                        )}
                    </ListItem>
                ))}
            </List>
            {/* Футер с аватаром строго внизу */}
            <List sx={{ mt: 'auto', alignSelf: 'stretch', mb: 0, p: 0 }}>
                <ListItem disablePadding sx={{ mt: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <motion.div
                        whileHover={{ 
                            scale: 1.1,
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItemButton
                            onClick={() => { navigate('/profile'); setDrawerOpen(false); }}
                            sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                py: 1,
                                borderRadius: 3,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                }
                            }}
                        >
                            <Avatar sx={{ 
                                width: 44, 
                                height: 44, 
                                bgcolor: deepPurple[500], 
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(103, 58, 183, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(103, 58, 183, 0.4)',
                                }
                            }}>
                                OP
                            </Avatar>
                        </ListItemButton>
                    </motion.div>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ height: '100vh' }}
        >
            <Box sx={{
                display: 'flex',
                height: '100vh',
                backgroundColor: 'transparent',
                overflowY: 'hidden',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    pointerEvents: 'none',
                    zIndex: 0
                }
            }}>
            <CssBaseline />
            {/* Sidebar for desktop */}
            {!isMobile && (
                <motion.div
                    initial={{ x: -SIDEBAR_WIDTH }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                        width: SIDEBAR_WIDTH,
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        zIndex: 1201,
                        height: '100vh'
                    }}
                >
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        bgcolor: 'rgba(35, 43, 59, 0.95)',
                        backdropFilter: 'blur(20px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRight: '1.5px solid rgba(38, 50, 74, 0.8)',
                        boxShadow: '2px 0 20px 0 rgba(0,0,0,0.15)',
                        py: 0,
                    }}>
                        {navList}
                    </Box>
                </motion.div>
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
                            bgcolor: 'rgba(35, 43, 59, 0.95)',
                            backdropFilter: 'blur(20px)',
                            pt: 0,
                            top: isMobile ? '56px' : 0,
                            height: isMobile ? 'calc(100% - 56px)' : '100%',
                            borderRight: '1.5px solid rgba(38, 50, 74, 0.8)',
                        }
                    }}
                    ModalProps={{
                        BackdropProps: {
                            sx: {
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                backdropFilter: 'blur(5px)',
                            }
                        }
                    }}
                    SlideProps={{
                        timeout: { enter: 300, exit: 250 }
                    }}
                >
                    <motion.div
                        initial={{ x: -20 }}
                        animate={{ x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        {navList}
                    </motion.div>
                </Drawer>
            )}
            <Box sx={{ flex: 1, ml: !isMobile ? `${SIDEBAR_WIDTH}px` : 0, minWidth: 0 }}>
                <AppBar
                    position="fixed"
                    sx={{
                        zIndex: 1200,
                        backgroundColor: 'rgba(35, 43, 59, 0.8)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
                        left: !isMobile ? SIDEBAR_WIDTH : 0,
                        width: !isMobile ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0)'
                    }}
                >
                    <Toolbar sx={{ minHeight: isMobile ? '56px' : '64px' }}>
                        {isMobile && (
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <IconButton 
                                    color="inherit" 
                                    edge="start" 
                                    onClick={() => setDrawerOpen(true)} 
                                    sx={{ 
                                        mr: 2,
                                        transition: 'transform 0.2s ease',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.1)'
                                        }
                                    }}
                                >
                                    <MenuIcon />
                                </IconButton>
                            </motion.div>
                        )}
                        <motion.div
                            key={location.pathname}
                            initial={{ x: -10 }}
                            animate={{ x: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            {logo}
                        </motion.div>
                        <motion.div
                            key={brand}
                            initial={{ x: 10 }}
                            animate={{ x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <Box sx={{
                                ml: 2,
                                color: 'white',
                                fontSize: isMobile ? '1.2rem' : '1.5rem',
                                fontWeight: 500,
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}>
                                {brand}
                            </Box>
                        </motion.div>
                    </Toolbar>
                </AppBar>
                {/* Контент приложения */}
                <Box sx={{ pt: isMobile ? 7 : 8, pl: 0, pr: 0, height: '100vh', overflowY: 'auto' }}>
                    <LazyPageLoader>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/hrbot-test" element={<HRBotPage />} />
                            <Route path="/hrbot" element={<HRBot />} />
                            <Route path="/aeon" element={<AeonChat />} />
                            <Route path="/test" element={<TestPage />} />
                        </Routes>
                    </LazyPageLoader>
                </Box>
            </Box>
        </Box>
        </motion.div>
    );
});

DashboardLayoutBasic.displayName = 'DashboardLayoutBasic';

export default DashboardLayoutBasic;