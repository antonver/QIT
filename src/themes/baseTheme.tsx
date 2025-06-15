import { createTheme } from '@mui/material/styles';

const baseTheme = createTheme({
    colorSchemes: {
        light: {
            palette: {
                primary: {
                    main: '#8b6f47',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#4a4a4a',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#f9f5f0',
                    paper: '#ffffff',
                },
                text: {
                    primary: '#1a1a1a',
                    secondary: '#666666',
                },
            },
        },
        dark: {
            palette: {
                primary: {
                    main: '#a68a64',
                    contrastText: '#121212',
                },
                secondary: {
                    main: '#b0b0b0',
                    contrastText: '#121212',
                },
                background: {
                    default: '#1e1e1e',
                    paper: '#2d2d2d',
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#cccccc',
                },
            },
        },
    },
    cssVariables: {
        colorSchemeSelector: 'class',
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1a1a1a',
        },
        h2: {
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#4a4a4a',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
            color: '#1a1a1a',
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: '#f1ece6',
                    },
                },
            },
        },
    },
});

export default baseTheme;
