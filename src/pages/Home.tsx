import { motion } from "framer-motion";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PsychologyIcon from '@mui/icons-material/Psychology';

const Home = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ height: '100%' }}
        >
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: '100vh',
                bgcolor: 'rgba(35, 43, 59, 0.95)', // Унифицированный цвет как у Drawer
                px: { xs: 2, sm: 3, md: 4 }, // Адаптивные отступы вместо Container
                py: 4,
            }}>
                {/* Главный заголовок */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <Typography 
                        variant="h2" 
                        component="h1"
                        sx={{ 
                            color: 'white', 
                            fontWeight: 700,
                            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                            mb: 2,
                            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }
                        }}
                    >
                        QIP mini
                    </Typography>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            fontWeight: 400,
                            fontSize: { xs: '1.2rem', sm: '1.5rem' }
                        }}
                    >
                        Интеллектуальная платформа для интервью
                    </Typography>
                </motion.div>

                {/* Карточки сервисов */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 4, 
                    maxWidth: '800px', 
                    width: '100%' 
                }}>
                    {/* HR Bot карточка */}
                    <Box sx={{ flex: 1 }}>
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            whileHover={{ 
                                scale: 1.05,
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card sx={{
                                bgcolor: 'rgba(64, 196, 255, 0.15)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(64, 196, 255, 0.3)',
                                borderRadius: 4,
                                boxShadow: '0 12px 40px rgba(64, 196, 255, 0.2)',
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 16px 50px rgba(64, 196, 255, 0.3)',
                                    border: '1px solid rgba(64, 196, 255, 0.5)',
                                }
                            }}>
                                <CardContent sx={{ 
                                    textAlign: 'center', 
                                    p: 4,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    <SmartToyIcon sx={{ 
                                        fontSize: 80, 
                                        color: '#40C4FF', 
                                        mb: 2,
                                        filter: 'drop-shadow(0 4px 8px rgba(64, 196, 255, 0.3))'
                                    }} />
                                    <Typography variant="h4" sx={{ 
                                        color: 'white', 
                                        fontWeight: 600,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                        mb: 2
                                    }}>
                                        HR Bot
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                        mb: 3,
                                        lineHeight: 1.6
                                    }}>
                                        Умный HR-ассистент для проведения интервью с анализом ответов и генерацией персонального профиля
                                    </Typography>
                                    <Button 
                                        variant="contained"
                                        size="large"
                                        onClick={() => navigate('/hrbot-test')}
                                        sx={{
                                            bgcolor: '#40C4FF',
                                            color: 'white',
                                            fontWeight: 600,
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                            boxShadow: '0 4px 16px rgba(64, 196, 255, 0.4)',
                                            '&:hover': {
                                                bgcolor: '#29B6F6',
                                                boxShadow: '0 6px 20px rgba(64, 196, 255, 0.5)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        Начать интервью
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Box>

                    {/* ÆON карточка */}
                    <Box sx={{ flex: 1 }}>
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            whileHover={{ 
                                scale: 1.05,
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card sx={{
                                bgcolor: 'rgba(255, 107, 107, 0.15)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 107, 107, 0.3)',
                                borderRadius: 4,
                                boxShadow: '0 12px 40px rgba(255, 107, 107, 0.2)',
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 16px 50px rgba(255, 107, 107, 0.3)',
                                    border: '1px solid rgba(255, 107, 107, 0.5)',
                                }
                            }}>
                                <CardContent sx={{ 
                                    textAlign: 'center', 
                                    p: 4,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    <PsychologyIcon sx={{ 
                                        fontSize: 80, 
                                        color: '#FF6B6B', 
                                        mb: 2,
                                        filter: 'drop-shadow(0 4px 8px rgba(255, 107, 107, 0.3))'
                                    }} />
                                    <Typography variant="h4" sx={{ 
                                        color: 'white', 
                                        fontWeight: 600,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                        mb: 2
                                    }}>
                                        ÆON
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                        mb: 3,
                                        lineHeight: 1.6
                                    }}>
                                        Продвинутый ИИ-собеседник для глубокого анализа личности и профессиональных качеств
                                    </Typography>
                                    <Button 
                                        variant="contained"
                                        size="large"
                                        onClick={() => navigate('/aeon')}
                                        sx={{
                                            bgcolor: '#FF6B6B',
                                            color: 'white',
                                            fontWeight: 600,
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                            boxShadow: '0 4px 16px rgba(255, 107, 107, 0.4)',
                                            '&:hover': {
                                                bgcolor: '#FF5252',
                                                boxShadow: '0 6px 20px rgba(255, 107, 107, 0.5)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        Открыть чат
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Box>
                </Box>

                {/* Дополнительная информация */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    style={{ 
                        textAlign: 'center', 
                        marginTop: '3rem',
                        maxWidth: '600px'
                    }}
                >
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            lineHeight: 1.8,
                            fontSize: '1.1rem'
                        }}
                    >
                        Выберите один из сервисов для начала работы. HR Bot проведет с вами структурированное интервью, 
                        а ÆON предложит свободное общение с глубоким анализом личности.
                    </Typography>
                </motion.div>
            </Box>
        </motion.div>
    );
};

export default Home;