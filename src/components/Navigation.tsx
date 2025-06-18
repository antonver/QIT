import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { AppProvider } from '@toolpad/core/AppProvider';
import type { Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Routes, Route } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ProfileCard from './ProfileCard.tsx';
import Grid from '@mui/material/Grid';
import Home from '../pages/Home';
import RoutineTracker from "../pages/RoutineTracker.tsx";
import baseTheme from "../themes/baseTheme.tsx";
import backgroundImage from '../assets/background.png';
import {useEffect, useState} from "react";

interface DashboardLayoutBasicProps {
    window?: () => Window;
}

const NAVIGATION: Navigation = [
    {
        kind: 'header',
        title: '',
    },
    {
        segment: 'profile',
        title: 'Profile',
        icon: <PersonOutlineIcon sx={{ bgcolor: 'rgba(255, 255, 255, 1)',
            borderRadius: '50%',
            padding: '4px',
    }}/>},
    {
        segment: 'routine',
        title: 'Routine',
        icon: < CenterFocusStrongIcon sx={{ bgcolor: 'rgba(255, 255, 255, 1)',
            borderRadius: '50%',
            padding: '4px',
        }}/>,
    },
];

export default function DashboardLayoutBasic({ window }: DashboardLayoutBasicProps) {
    const demoWindow = window ? window() : undefined;
    const [brand, setBrand] = useState<string>('QIP mini');
    useEffect(() => {
        switch (location.pathname) {
            case '/profile':
                setBrand('Profile Page');
                break;
            case '/routine':
                setBrand('Routine Tracker');
                break;
            case '/':
                setBrand('Home');
                break;
            default:
                setBrand('QIP mini'); // Default brand
        }
    }, [location.pathname]); // Re-run when route changes

    return (
        <AppProvider
            navigation={NAVIGATION}
            window={demoWindow}
            theme={baseTheme}
            branding={{
                logo: '',
                title: brand,
            }}
        >
            <DashboardLayout sx={{ height: '100vh',
                backgroundImage: `url(${backgroundImage})`,
                backgroundRepeat: 'repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
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
                    <Route path="/" element={<Home />} />
                    <Route path="/routine" element={<RoutineTracker />} />
                </Routes>
            </DashboardLayout>
        </AppProvider>
    );
}