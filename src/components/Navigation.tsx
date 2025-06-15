import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import AlignVerticalCenterRoundedIcon from '@mui/icons-material/AlignVerticalCenterRounded';
import AlignVerticalBottomRoundedIcon from '@mui/icons-material/AlignVerticalBottomRounded';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Grid from '@mui/material/Grid';
import { Routes, Route } from 'react-router-dom';
import baseTheme from "../themes/baseTheme.tsx";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ProfileCard from "./ProfileCard.tsx";
import SettingsPage from "../pages/Settings.tsx";
import SecondPage from "../pages/SecondPage.tsx";
import ThirdPage from "../pages/ThirdPage.tsx";
const NAVIGATION = [
    {
        kind: 'header',
        title: '',
    },
    {
        segment: 'profile',
        title: 'Profile',
        icon: <PersonOutlineIcon />,
        link: '/profile',
    },
    {
        segment: 'second',
        title: 'Second',
        icon: <AlignVerticalBottomRoundedIcon />,
        link: '/second',
    },
    {
        segment: 'third',
        title: 'Third',
        icon: <AlignVerticalCenterRoundedIcon/>,
        link: '/third',
    },
    {
        segment: 'settings',
        title: 'Integrations',
        icon: <SettingsApplicationsRoundedIcon />,
        link: '/settings',
    },
];


export default function DashboardLayoutBasic(props) {
    const { window } = props;
    const demoWindow = window ? window() : undefined;

    return (
        <AppProvider
            navigation={NAVIGATION}
            theme={baseTheme}
            window={demoWindow}
            branding={{
                logo: "",
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
                                    <Grid item xs={12} md={8}>
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