import { createTheme } from '@mui/material/styles';

const baseTheme = createTheme({
    cssVariables: {
        colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: {
        light: {
            palette: {
                text:{
                    primary: 'rgba(255, 255, 255, 100)',
                    secondary: 'rgba(255, 255, 255, 100)',
                },
                primary: {
                    main: 'rgba(255, 255, 255, 100)',
                },
                secondary: {
                    main: 'rgba(255, 255, 255, 100)',
                },
                background: {
                    default: 'rgba(255, 255, 255, 100)',
                    paper: 'rgba(29, 39, 51, 1)',
                },
            },
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
});
export default baseTheme;