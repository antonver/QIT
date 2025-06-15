import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import AlignVerticalCenterRoundedIcon from '@mui/icons-material/AlignVerticalCenterRounded';
import AlignVerticalBottomRoundedIcon from '@mui/icons-material/AlignVerticalBottomRounded';
import { AppProvider, Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Grid from '@mui/material/Grid';
import { Routes, Route } from 'react-router-dom';
import baseTheme from '../themes/baseTheme';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ProfileCard from './ProfileCard';
import SettingsPage from '../pages/Settings';
import SecondPage from '../pages/SecondPage';
import ThirdPage from '../pages/ThirdPage';

// Define the props interface for DashboardLayoutBasic
interface DashboardLayoutBasicProps {
    window?: () => Window;
}

// Define the navigation array with explicit types
const NAVIGATION: Navigation = [
    {
        kind: 'header',
        title: '',
    },
    {
        segment: 'profile',
        title: 'Profile',
        icon: <PersonOutlineIcon />,
    },
    {
        segment: 'second',
        title: 'Second',
        icon: <AlignVerticalBottomRoundedIcon />,
    },
    {
        segment: 'third',
        title: 'Third',
        icon: <AlignVerticalCenterRoundedIcon />,
    },
    {
        segment: 'settings',
        title: 'Integrations',
        icon: <SettingsApplicationsRoundedIcon />,
    },
];

export default function DashboardLayoutBasic({ window }: DashboardLayoutBasicProps) {
    const demoWindow = window ? window() : undefined;

    return (
        <AppProvider
            navigation={NAVIGATION}
            theme={baseTheme}
            window={demoWindow}
            branding={{
                logo: '',
                title: 'QIP mini',
            }}
        >
            <DashboardLayout sx={{ height: '100vh' }}>
                <Routes>
                    <Route
                        path="/profile"
                        element={
                            <PageContainer sx={{ height: '100%', overflowY: 'auto' }}>
                                <Grid container justifyContent="center" sx={{ height: '100%' }}>
                                    <Grid item component="div" xs={12} md={8}>
                                        <ProfileCard sx={{ width: '100%', height: 'auto' }} />
                                    </Grid>
                                </Grid>
                            </PageContainer>
                        }
                    />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/second" element={<SecondPage />} />
                    <Route path="/third" element={<ThirdPage />} />
                </Routes>
            </DashboardLayout>
        </AppProvider>
    );
}