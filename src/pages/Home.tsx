import React from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import baseTheme from "../themes/baseTheme";

const Home: React.FC = () => {
    return (
        <ThemeProvider theme={baseTheme}>
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
                <Container maxWidth="lg">
                    {/* Header Section */}
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h1" gutterBottom>
                            Quantum Insight
                        </Typography>
                        <Typography variant="h2" gutterBottom>
                            Digital Evolution Platform
                        </Typography>
                        <Typography variant="body1" sx={{ maxWidth: '700px', mx: 'auto' }}>
                            What if human development begins not with the accumulation of knowledge, but with the realization of one's own nature?
                        </Typography>
                    </Box>

                    {/* Main Content */}
                    <Paper elevation={1} sx={{ p: 6, mb: 6 }}>
                        <Typography variant="h2" gutterBottom>
                            About Quantum Insight Platform
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Quantum Insight is not merely an AI or Web3 ecosystem. It is a transformative mechanism designed to enable individuals to look within—to observe their inner structure, recognize behavioral patterns, and understand their thought processes through a synthesis of artificial intelligence and psychometrics. Each step within the platform represents a progression toward greater self-awareness.
                        </Typography>
                        <Typography variant="body1" paragraph>
                            For centuries, civilizations have sought to advance humanity through external means: textbooks, systems, institutions, and rules. Yet, individuals often remain disconnected from their inner selves, unsure of who they are, where they are headed, or why they act as they do. Quantum Insight redefines this approach by placing identity, not intellect, as the starting point.
                        </Typography>
                    </Paper>

                    {/* Features Section */}
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h2" align="center" gutterBottom>
                            Core Elements of QIP
                        </Typography>
                        <Grid container spacing={4}>
                            {[
                                {
                                    title: 'NFT Personality Profile',
                                    desc: 'A unique digital representation that captures the essence of your identity.',
                                },
                                {
                                    title: 'ÆON Analysis',
                                    desc: 'An in-depth exploration of consciousness and behavior to foster self-understanding.',
                                },
                                {
                                    title: 'Glyphs and Relics',
                                    desc: 'Symbolic tests, rewards, and incentives designed to support personal growth.',
                                },
                                {
                                    title: 'Personalized Growth Agent',
                                    desc: 'A tailored companion to guide your developmental journey.',
                                },
                                {
                                    title: 'Thinking Modules',
                                    desc: 'Tools to analyze thought patterns, relationships, and memory.',
                                },
                                {
                                    title: 'Digital Legacy',
                                    desc: 'A secure record of your evolution, preserved on the blockchain.',
                                },
                            ].map((feature, index) => (
                                <Grid size={{ xs: 12, sm: 6 , md:4}} key={index}>
                                    <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                                        <Typography variant="h2" gutterBottom>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            {feature.desc}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* Purpose Section */}
                    <Paper elevation={1} sx={{ p: 6, mb: 6 }}>
                        <Typography variant="h2" gutterBottom>
                            Why Quantum Insight Matters
                        </Typography>
                        <Typography variant="body1" paragraph>
                            We live in an era of substitution, where knowledge is mistaken for understanding, content for meaning, attention for awareness, and profiles for personality. Quantum Insight creates a space where the individual is restored as the center—not as an object in a feed, but as a conscious, choosing, and evolving subject.
                        </Typography>
                        <Typography variant="body1" paragraph>
                            The platform is a mirror system, reflecting your inner evolution as a process. It is not a product but an infrastructure for a new civilization, where individuals are empowered to ask: Who am I, beyond my name?
                        </Typography>
                    </Paper>

                    {/* Vision Section */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" gutterBottom>
                            A New Paradigm
                        </Typography>
                        <Typography variant="body1" sx={{ maxWidth: '700px', mx: 'auto' }}>
                            Quantum Insight is an invitation to redefine human potential. It is a platform where evolution begins with you—not through external validation, but through the courage to explore your own nature.
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Home;
