import React from 'react';
import {Card, CardContent, Typography, List, ListItem, ListItemText, Box} from '@mui/material';
import WifiTetheringRoundedIcon from '@mui/icons-material/WifiTetheringRounded';

const ProfileCard: React.FC = () => {
    const profileData = {
        name: "John Doe",
        title: "Æon Architect C7",
        characteristics: {
            consciousnessLevel: "C7 (Architect)",
            energeticVector: "87% Will",
            thinkingType: "Analyst + Intuit",
            dominantArchetype: "Explorer",
            motivation: "Intrinsic",
        },
        performanceIndicators: {
            ritualsCompleted: "3 out of 44",
            consciousActions: "12",
            engagementDegree: "76%",
            vectorOfDevelopment: "Deepening (2 hours ago)",
        },
        overview: [
            "Path of Consciousness test passed",
            "NFT-relic 'Architect Glyph' obtained",
            "Genesis Access module unlocked",
            "Next Stage:",
            "Additional info 1",
            "Additional info 2",
            "Additional info 3",
            "Additional info 4",
        ],
    };

    return (
        <Card sx={{ width: '100%', height: 'auto', boxShadow: 3 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <WifiTetheringRoundedIcon sx={{ display: 'block', fontSize: 40, color: '#8b6f47' }} />
                </Box>
                <Typography variant="h6" align="center" gutterBottom sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {profileData.name}
                </Typography>
                <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
                    {profileData.title}
                </Typography>
                <Typography variant="h6" gutterBottom>
                    CHARACTERISTICS
                </Typography>
                <List>
                    {Object.entries(profileData.characteristics).map(([key, value]) => (
                        <ListItem key={key}>
                            <ListItemText primary={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} secondary={value} />
                        </ListItem>
                    ))}
                </List>
                <Typography variant="h6" gutterBottom>
                    KEY PERFORMANCE INDICATORS
                </Typography>
                <List>
                    {Object.entries(profileData.performanceIndicators).map(([key, value]) => (
                        <ListItem key={key}>
                            <ListItemText primary={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} secondary={value} />
                        </ListItem>
                    ))}
                </List>
                <Typography variant="h6" gutterBottom>
                    PROFILE OVERVIEW
                </Typography>
                <List>
                    {profileData.overview.map((item, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={item} />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default ProfileCard;