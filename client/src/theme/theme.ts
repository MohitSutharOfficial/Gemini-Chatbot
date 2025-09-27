import { createTheme, Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        tertiary: Palette['primary'];
    }

    interface PaletteOptions {
        tertiary?: PaletteOptions['primary'];
    }
}

const baseTheme = {
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 600,
            lineHeight: 1.3,
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h4: {
            fontSize: '1.25rem',
            fontWeight: 500,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: '1.125rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none' as const,
                    fontWeight: 500,
                    borderRadius: '8px',
                    padding: '8px 16px',
                },
                contained: {
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                },
            },
        },
    },
};

const lightTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
            contrastText: '#ffffff',
        },
        tertiary: {
            main: '#ed6c02',
            light: '#ff9800',
            dark: '#e65100',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a202c',
            secondary: '#4a5568',
        },
        divider: '#e2e8f0',
        action: {
            hover: 'rgba(0, 0, 0, 0.04)',
            selected: 'rgba(25, 118, 210, 0.08)',
        },
    },
});

const darkTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
            light: '#bbdefb',
            dark: '#1976d2',
            contrastText: '#000000',
        },
        secondary: {
            main: '#ce93d8',
            light: '#f3e5f5',
            dark: '#9c27b0',
            contrastText: '#000000',
        },
        tertiary: {
            main: '#ffcc02',
            light: '#fff350',
            dark: '#ff8f00',
            contrastText: '#000000',
        },
        background: {
            default: '#0f172a',
            paper: '#1e293b',
        },
        text: {
            primary: '#f8fafc',
            secondary: '#cbd5e1',
        },
        divider: '#334155',
        action: {
            hover: 'rgba(255, 255, 255, 0.08)',
            selected: 'rgba(144, 202, 249, 0.16)',
        },
    },
});

export const getTheme = (mode: 'light' | 'dark'): Theme => {
    return mode === 'light' ? lightTheme : darkTheme;
};

export { lightTheme, darkTheme };