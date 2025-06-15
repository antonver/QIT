import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import AlignVerticalCenterRoundedIcon from '@mui/icons-material/AlignVerticalCenterRounded';
import AlignVerticalBottomRoundedIcon from '@mui/icons-material/AlignVerticalBottomRounded';
import { AppProvider } from '@toolpad/core/AppProvider';
import type { Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Routes, Route } from 'react-router-dom';
import baseTheme from '../themes/baseTheme';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ProfileCard from './ProfileCard';
import SettingsPage from '../pages/Settings';
import SecondPage from '../pages/SecondPage';
import ThirdPage from '../pages/ThirdPage';
import Grid from '@mui/material/Grid';

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
                    <Route path="/profile" element={
                        <Grid container  direction="row"
                              sx={{
                                  justifyContent: "center",
                                  alignItems: "center",
                              }}>
                            <Grid size={{ xs: 12, sm: 8 }}>
                            <ProfileCard />
                        </Grid>
                    </Grid>}/>
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/second" element={<SecondPage />} />
                    <Route path="/third" element={<ThirdPage />} />
                </Routes>
            </DashboardLayout>
        </AppProvider>
    );
}