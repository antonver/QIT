import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    Box,
} from '@mui/material';
import WifiTetheringRoundedIcon from '@mui/icons-material/WifiTetheringRounded';
import Divider from '@mui/material/Divider';
import UploadAvatars from './Avatar'; // Assume .tsx extension is handled by TS
import CircularProgressWithLabel from './ProgressBar'; // Assume .tsx extension
import getProfile from '../utils/getProfile';
import extractNumberAndWord from '../utils/profile_';

// Define interface for the profile data structure
interface ProfileCharacteristics {
    consciousnessLevel: string;
    energeticVector: string;
    thinkingType: string;
    dominantArchetype: string;
    motivation: string;
}

interface ProfileData {
    name: string;
    title: string;
    characteristics: ProfileCharacteristics;
    performanceIndicators: Record<string, string | number>;
    overview: string[];
}

// Define interface for the result of extractNumberAndWord
interface EnergeticVector {
    number: number;
    word: string;
}


const ProfileCard: React.FC = () => {
    const profileData: ProfileData = getProfile();

    // Extract number and word from energeticVector
    const energeticVector: EnergeticVector | null = extractNumberAndWord(
        profileData.characteristics.energeticVector
    );
    const energeticVectorNum: number = energeticVector ? energeticVector.number : 0;
    const energeticVectorWord: string = energeticVector ? energeticVector.word : 'Unknown';

    return (
        <Card sx={{ width: '100%', height: 'auto', boxShadow: 3 }}>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: '100px',
                        padding: '0 16px',
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            flex: 1,
                            textAlign: 'left',
                        }}
                    >
                        {profileData.name}
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            mb: '8px',
                        }}
                    >
                        <UploadAvatars />
                        <WifiTetheringRoundedIcon sx={{ fontSize: 40, color: '#8b6f47' }} />
                    </Box>
                </Box>
                <Divider orientation="horizontal" />
                <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
                    {profileData.title}
                </Typography>
                <Typography variant="h6" gutterBottom>
                    CHARACTERISTICS
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText
                            primary="Consciousness Level"
                            secondary={profileData.characteristics.consciousnessLevel}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Energetic Vector" secondary={energeticVectorWord} />
                        <CircularProgressWithLabel value={energeticVectorNum} />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Thinking Type"
                            secondary={profileData.characteristics.thinkingType}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Dominant Archetype"
                            secondary={profileData.characteristics.dominantArchetype}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Motivation" secondary={profileData.characteristics.motivation} />
                    </ListItem>
                </List>
                <Typography variant="h6" gutterBottom>
                    KEY PERFORMANCE INDICATORS
                </Typography>
                <List>
                    {Object.entries(profileData.performanceIndicators).map(([key, value]) => (
                        <ListItem key={key}>
                            <ListItemText
                                primary={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                secondary={value}
                            />
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