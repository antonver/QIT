import React, { useEffect, useState } from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import type { Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import {Routes, Route, useLocation, useNavigate} from 'react-router-dom';
import ProfileCard from './ProfileCard.tsx';
import Grid from '@mui/material/Grid';
import Home from '../pages/Home';
import RoutineTracker from "../pages/RoutineTracker.tsx";
import baseTheme from "../themes/baseTheme.tsx";
import backgroundImage from '../assets/background.png';
import Lottie from 'lottie-react';
import startAnimation from '../assets/star.json';
import speech from '../assets/Speech.json';
import chemistry from '../assets/chemistry.json';
import crown from '../assets/Crown.json';
import film from '../assets/film.json';
import dev from '../assets/devlogs.json';
import tresor from '../assets/tresor.json';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import Messages from "../pages/Messages.tsx";
import Drops from "../pages/Drops.tsx";
import Temporary from "../pages/Temporary.tsx";
import DevLog from "../pages/DevLog.tsx";
import Marketing from "../pages/Marketing.tsx";
import Music from "../pages/Music.tsx";
import General from "../pages/General.tsx";
import Politics from "../pages/Politics.tsx";
import NewTheme from "../pages/NewTheme.tsx";
import Design from "../pages/Design.tsx";
import {Box, Button} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import {deepPurple} from "@mui/material/colors";

interface DashboardLayoutBasicProps {
    window?: () => Window;
}

// By removing the `: Navigation` annotation, TypeScript will infer the correct type,
// including your custom 'icon' property.
const NAVIGATION = [
    {
        kind: 'header',
        title: '',
    },
    {
        segment: 'messages',
        title: 'Все',
        icon: <div style={{width:"2em"}}><Lottie animationData={speech} /></div>,
    },
    {
        segment: 'drops',
        title: 'Дропы',
        icon: <div style={{width:"2em"}}><Lottie animationData={startAnimation} /></div>,
    },
    {
        segment: 'temporary',
        title: 'Temporary',
        icon: <div style={{ width: "2em", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <p style={{fontSize:"1.7em"}}>❗</p>
        </div>,
    },
    {
        segment: 'devlog',
        title: 'DevLog',
        icon: <div style={{width:"2em"}}><Lottie animationData={dev} /></div>,
    },
    {
        segment: 'marketing',
        title: 'Маркетинг',
        icon: <div style={{width:"2em"}}><Lottie animationData={chemistry} /></div>,
    },
    {
        segment: 'music',
        title: 'Музыка',
        icon: <div style={{width:"2em"}}><Lottie animationData={tresor} /></div>,
    },
    {
        segment: 'design',
        title: 'Дизайн',
        icon: <div style={{width:"2em"}}><Lottie animationData={crown} /></div>,
    },
    {
        segment: 'general',
        title: 'General',
        icon: <div style={{ width: "2em", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <p style={{fontSize:"1.7em"}}>#</p>
        </div>,
    },
    {
        segment: 'politics',
        title: 'Политика',
        icon: <div style={{width:"2em"}}><Lottie animationData={film} /></div>,
    },
    {
        segment: 'newtheme',
        title: 'Новая тема',
        icon: <div style={{width:"2em"}}><ControlPointIcon style={{ color: 'rgba(39, 168, 245, 0.8)' }} /></div>,
    },
];

function SidebarFooter() {
    const navigate = useNavigate();
    return(
        <Box sx={{justifyContent: "left" , display: "flex", alignItems: "center", padding: "1em"}}>
            <Button onClick={() => navigate('/profile')}>
                <Avatar sx={{ bgcolor: deepPurple[500] }}>OP</Avatar>
            </Button>
        </Box>
    )
}

export default function DashboardLayoutBasic({ window }: DashboardLayoutBasicProps) {
    const demoWindow = window ? window() : undefined;
    const [brand, setBrand] = useState<string>('QIP mini');
    const [logo, setLogo] = useState<React.ReactNode>('');
    const location = useLocation(); // Use the useLocation hook

    useEffect(() => {
        const pathname = location.pathname.replace('/', '');


        const currentNavItem = NAVIGATION.find(
            (item): item is typeof item & { segment: string, icon: React.ReactNode } => 'segment' in item && item.segment === pathname
        );


        if (currentNavItem) {
            setBrand(currentNavItem.title);
            setLogo(currentNavItem.icon);
        } else {
            // Handle routes without a direct navigation item, or default state
            switch (location.pathname) {
                case '/profile':
                    setBrand('Profile Page');
                    setLogo('');
                    break;
                case '/routine':
                    setBrand('Routine Tracker');
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

    return (
        <AppProvider
            // Use type assertion here to satisfy the prop type
            navigation={NAVIGATION as Navigation}
            window={demoWindow}
            theme={baseTheme}
            branding={{
                logo: logo,
                title: brand,
            }}
        >

            <DashboardLayout
                sx={{
                    height: '100vh',
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    '& .MuiListItem-root': {
                        transition: 'border-left 0.3s ease',
                        '&:hover': {
                            borderLeft: '4px solid #40C4FF',
                        },
                    },
                }}
                slots={{
                    sidebarFooter: SidebarFooter,
                }}
            >
                <Routes>
                    <Route path="/profile" element={
                        <Grid container direction="row"
                              sx={{
                                  justifyContent: "center",
                                  alignItems: "center",
                              }}>
                            <Grid size={{ xs: 12, sm: 8 }}>
                                <ProfileCard />
                            </Grid>
                        </Grid>
                    }/>
                    <Route path="/" element={<Home />} />
                    <Route path="/routine" element={<RoutineTracker />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/drops" element={<Drops />} />
                    <Route path="/temporary" element={<Temporary />} />
                    <Route path="/devlog" element={<DevLog />} />
                    <Route path="/marketing" element={<Marketing />} />
                    <Route path="/music" element={<Music />} />
                    <Route path="/general" element={<General />} />
                    <Route path="/politics" element={<Politics />} />
                    <Route path="/newtheme" element={<NewTheme />} />
                    <Route path="/design" element={<Design />} />
                </Routes>
            </DashboardLayout>
        </AppProvider>
    );
}