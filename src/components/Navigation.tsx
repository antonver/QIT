import React, { useEffect, useState, lazy, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    List,
    Box,
    Avatar,
    CssBaseline,
    Typography,
    useTheme,
    useMediaQuery,
    ListItemButton,
    ListItemIcon,
    ListItem
} from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import { motion } from 'framer-motion';
import LazyPageLoader from './LazyPageLoader';
import backgroundImage from '../assets/background.png';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PsychologyIcon from '@mui/icons-material/Psychology';
import useOptimizedPerformance from '../hooks/useOptimizedPerformance';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useTelegram } from '../hooks/useTelegram';

// Lazy load страниц для лучшей производительности
const Home = lazy(() => import('../pages/Home'));
const HRBot = lazy(() => import('../pages/HRBot'));
const AdminPanel = lazy(() => import('../pages/AdminPanel'));
const HRBotPage = lazy(() => import('../pages/HRBotPage'));
const TestPage = lazy(() => import('../pages/TestPage'));
const AeonChat = lazy(() => import('../pages/AeonChat'));
const AeonMessenger = lazy(() => import('../pages/AeonMessenger'));
const Profile = lazy(() => import('../pages/Profile'));

const NAVIGATION = [
    {
        kind: 'header',
        title: '',
    },
    {
        segment: 'hrbot',
        title: 'HR Bot',
        icon: <SmartToyIcon sx={{ color: '#40C4FF' }} />,
    },
    {
        segment: 'admin',
        title: 'Admin',
        icon: <PsychologyIcon sx={{ color: '#FF6B6B' }} />,
        adminOnly: true,
    },
    {
        segment: 'aeon',
        title: 'ÆON',
        icon: <PsychologyIcon sx={{ color: '#4a9eff' }} />,
    },
    {
        segment: 'aeon-messenger',
        title: 'ÆON Messenger',
        icon: <PsychologyIcon sx={{ color: '#4a9eff' }} />,
    },
];

const SIDEBAR_WIDTH = 80; // Увеличенная ширина для больших иконок
const SIDEBAR_WIDTH_MOBILE = 60; // Увеличенная ширина для мобильной версии

const DashboardLayoutBasic = memo(() => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [brand, setBrand] = useState<string>('QIP mini');
    const [logo, setLogo] = useState<React.ReactNode>('');
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state: RootState) => state.aeonChat);
    const { telegramUser } = useTelegram();
    
    // Хук для оптимизации производительности
    useOptimizedPerformance();

    // Динамическая ширина sidebar в зависимости от устройства
    const currentSidebarWidth = isMobile ? SIDEBAR_WIDTH_MOBILE : SIDEBAR_WIDTH;

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
            pt: isMobile ? { xs: 7, sm: 8 } : 0, // Added top padding for mobile  
        }}>
            {/* Основное меню */}
            <List sx={{ p: 0 }}>
                {NAVIGATION.filter(item => item.segment && (!item.adminOnly || currentUser?.is_admin)).map((item) => (
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
                                }}
                                sx={{
                                    minWidth: 0,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    borderRadius: 3,
                                    bgcolor: location.pathname.replace('/', '') === item.segment ? 'rgba(64,196,255,0.12)' : 'transparent',
                                    py: { xs: 2, md: 1.5 }, // Больше отступов для больших иконок
                                    px: { xs: 1, md: 0.5 },
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
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 0, justifyContent: 'center', mb: 0.5 }}>
                                <Box sx={{
                                    fontSize: { xs: 32, sm: 36, md: 40 }, // БОЛЬШИЕ иконки как запросил пользователь
                                    width: { xs: 32, sm: 36, md: 40 },
                                    height: { xs: 32, sm: 36, md: 40 },
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center'
                                }}>{item.icon}</Box>
                            </ListItemIcon>
                            <Typography variant="caption" sx={{
                                color: '#b0bec5',
                                fontSize: { xs: 8, sm: 9, md: 10 }, // Увеличенный текст под большими иконками
                                mt: 0.3,
                                textAlign: 'center',
                                lineHeight: 1.1,
                                fontWeight: 500
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
                                    top: 6,
                                    bottom: 6,
                                    width: '3px', // Тонкая синяя линия
                                    backgroundColor: '#40c4ff',
                                    borderRadius: '0 3px 3px 0',
                                    transformOrigin: 'center',
                                    boxShadow: '0 0 8px rgba(64, 196, 255, 0.6)' // Небольшое свечение
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
                            onClick={() => { navigate('/profile'); }}
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
                                width: { xs: 44, md: 50 }, // БОЛЬШОЙ аватар чтобы помещался на экран
                                height: { xs: 44, md: 50 }, 
                                bgcolor: deepPurple[500], 
                                cursor: 'pointer',
                                fontSize: { xs: '1rem', md: '1.2rem' }, // Увеличенный размер текста
                                boxShadow: '0 4px 12px rgba(103, 58, 183, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(103, 58, 183, 0.4)',
                                }
                            }}
                            src={currentUser?.profile_photo_url || telegramUser?.photo_url}
                            >
                                {currentUser?.first_name?.charAt(0) || telegramUser?.first_name?.charAt(0) || 'U'}
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
            {/* Sidebar - всегда открыт */}
            <motion.div
                initial={{ x: -currentSidebarWidth }}
                animate={{ x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                    width: currentSidebarWidth,
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: 1201,
                    height: '100vh',
                    overflow: 'hidden' // Предотвращаем выход анимации за границы
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

            <Box sx={{ flex: 1, ml: `${currentSidebarWidth}px`, minWidth: 0 }}>
                {/* Скрываем AppBar для AeonMessenger */}
                {location.pathname !== '/aeon-messenger' && (
                    <AppBar
                        position="fixed"
                        sx={{
                            zIndex: 1200,
                            backgroundColor: 'rgba(35, 43, 59, 0.95)', // Унифицированный цвет как у Drawer
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
                            left: currentSidebarWidth,
                            width: `calc(100% - ${currentSidebarWidth}px)`,
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0)'
                        }}
                    >
                        <Toolbar sx={{ minHeight: isMobile ? '56px' : '64px' }}>
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
                )}
                {/* Контент приложения */}
                <Box sx={{ 
                    pt: location.pathname === '/aeon-messenger' ? 0 : (isMobile ? 7 : 8), 
                    pl: 0, 
                    pr: 0, 
                    height: '100vh', 
                    overflowY: 'auto' 
                }}>
                    <LazyPageLoader>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/hrbot" element={<HRBot />} />
                            <Route path="/admin" element={<AdminPanel />} />
                            <Route path="/hrbot-test" element={<HRBotPage />} />
                            <Route path="/aeon" element={<AeonChat />} />
                            <Route path="/aeon-messenger" element={<AeonMessenger />} />
                            <Route path="/test" element={<TestPage />} />
                            <Route path="/profile" element={<Profile />} />
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