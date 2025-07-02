import { motion } from "framer-motion";
import ChatBar from "../components/ChatBar.tsx";
import { Box, Typography, Card, CardContent } from "@mui/material";

const Home = () => {
    return (
        <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ height: '100%' }}
        >
            <Box sx={{
                justifyContent: "flex-end",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: '92vh',
                position: 'relative',
            }}>
                {/* Приветственное сообщение */}
                <motion.div
                    initial={{ y: -30 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ 
                        position: 'absolute', 
                        top: '20%', 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        zIndex: 1,
                        width: '90%',
                        maxWidth: '400px'
                    }}
                >
                    <Card sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <Typography variant="h5" sx={{ 
                                color: 'white', 
                                fontWeight: 600,
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                mb: 1
                            }}>
                                Добро пожаловать!
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'rgba(255, 255, 255, 0.8)',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}>
                                Начните общение с помощью чата ниже
                            </Typography>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Анимированный ChatBar */}
                <motion.div
                    initial={{ y: 50 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                >
                    <ChatBar onAttachmentClick={function(): void {
                        throw new Error("Function not implemented.");
                    }} />
                </motion.div>
            </Box>
        </motion.div>
    );
};

export default Home;