import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#14B8A6',
      light: '#14B8A6',
      dark: '#0E9688',
      contrastText: '#fff',
    },
    secondary: {
      main: '#101827',
      light: '#1E4D5E',
      dark: '#1A3240',
      contrastText: '#fff',
    },
    success: {
      main: '#14B8A6',
      light: '#14B8A6',
      dark: '#0E9688',
      contrastText: '#fff',
    },
    warning: {
      main: '#FBBF24',
      light: '#F4D88A',
      dark: '#D97706',
      contrastText: '#101827',
    },
    error: {
      main: '#E76F51',
      light: '#EE8F75',
      dark: '#C45030',
      contrastText: '#fff',
    },
    background: {
      default: '#F5F2EC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2E2D',
      secondary: '#4A5568',
      disabled: '#A0AEC0',
    },
    divider: '#E8E0D5',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800, fontSize: '2.5rem',   letterSpacing: '-0.03em',  lineHeight: 1.15 },
    h2: { fontWeight: 800, fontSize: '2rem',     letterSpacing: '-0.025em', lineHeight: 1.2  },
    h3: { fontWeight: 700, fontSize: '1.625rem', letterSpacing: '-0.02em',  lineHeight: 1.25 },
    h4: { fontWeight: 700, fontSize: '1.375rem', letterSpacing: '-0.015em', lineHeight: 1.3  },
    h5: { fontWeight: 600, fontSize: '1.125rem', letterSpacing: '-0.01em'  },
    h6: { fontWeight: 600, fontSize: '1rem',     letterSpacing: '-0.005em' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.65 },
    body2: { fontSize: '0.875rem',  lineHeight: 1.6  },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, color: '#718096' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '-0.005em', fontSize: '0.875rem' },
    overline: { fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.09em', textTransform: 'uppercase' },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(20,184,166,0.07)',
    '0 2px 6px rgba(20,184,166,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    '0 4px 12px rgba(20,184,166,0.10), 0 2px 4px rgba(0,0,0,0.04)',
    '0 8px 24px rgba(20,184,166,0.12), 0 4px 8px rgba(0,0,0,0.06)',
    '0 16px 40px rgba(20,184,166,0.14), 0 8px 16px rgba(0,0,0,0.06)',
    '0 24px 56px rgba(0,0,0,0.12)',
    ...Array(18).fill('none'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { background: #F5F2EC; }
        ::selection { background: rgba(20,184,166,0.18); }
      `,
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #E8E0D5',
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #E8E0D5',
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 4px rgba(20,184,166,0.06)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(20,184,166,0.13)',
            borderColor: '#D4CCC3',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.875rem',
          letterSpacing: '-0.005em',
          padding: '8px 18px',
          transition: 'all 0.18s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #14B8A6 0%, #0E9688 100%)',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(20,184,166,0.30)',
          '&:hover': {
            background: 'linear-gradient(135deg, #248f82 0%, #1a6d63 100%)',
            boxShadow: '0 4px 16px rgba(20,184,166,0.40)',
            transform: 'translateY(-1px)',
          },
        },
        outlinedPrimary: {
          borderColor: '#B8D8D4',
          color: '#14B8A6',
          '&:hover': { borderColor: '#14B8A6', background: 'rgba(20,184,166,0.05)', transform: 'translateY(-1px)' },
        },
        outlined: {
          borderColor: '#DDD5C8',
          color: '#4A5568',
          '&:hover': { borderColor: '#B8AFA5', background: '#F5F0EA', transform: 'translateY(-1px)' },
        },
        text: {
          color: '#4A5568',
          '&:hover': { background: '#F5F0EA' },
        },
        sizeLarge: { padding: '11px 22px', fontSize: '0.9375rem', borderRadius: 10 },
        sizeSmall: { padding: '5px 12px', fontSize: '0.8125rem', borderRadius: 7 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          background: '#FDFCFA',
          transition: 'box-shadow 0.18s ease',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#DDD5C8' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#B8AFA5' },
          '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(20,184,166,0.12)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#14B8A6', borderWidth: 1.5 },
        },
        input: { fontSize: '0.875rem', padding: '9px 12px' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#718096',
          '&.Mui-focused': { color: '#14B8A6' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.75rem', borderRadius: 6, height: 24 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: '#6B8C95',
            background: '#F5F0EA',
            borderBottom: '1px solid #E8E0D5',
            padding: '11px 16px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderBottom: '1px solid #F0EBE3',
          padding: '13px 16px',
          color: '#4A5568',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background 0.15s ease',
          '&:hover': { background: '#FDFAF6' },
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          border: '1px solid #E8E0D5',
          boxShadow: '0 24px 56px rgba(0,0,0,0.10)',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.0625rem',
          fontWeight: 700,
          padding: '22px 24px 14px',
          color: '#1A2E2D',
          borderBottom: '1px solid #F0EBE3',
          letterSpacing: '-0.01em',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { padding: '20px 24px' },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { padding: '14px 24px 20px', borderTop: '1px solid #F0EBE3', gap: 8 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: 44,
          color: '#718096',
          transition: 'color 0.18s ease',
          '&.Mui-selected': { color: '#1A2E2D', fontWeight: 700 },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#14B8A6', height: 2.5, borderRadius: 2 },
        root: { borderBottom: '1px solid #E8E0D5', minHeight: 44 },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: '1px solid #E8E0D5',
          boxShadow: '0 12px 32px rgba(0,0,0,0.10)',
          marginTop: 6,
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
          borderRadius: 7,
          margin: '2px 4px',
          minHeight: 38,
          transition: 'background 0.15s ease',
          '&:hover': { background: '#F5F0EA' },
          '&.Mui-selected': { background: '#EBF7F5', '&:hover': { background: '#D9F0ED' } },
        },
      },
    },
    MuiSnackbar: {
      defaultProps: { anchorOrigin: { vertical: 'bottom', horizontal: 'right' } },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10, fontSize: '0.875rem', fontWeight: 500, border: '1px solid transparent' },
        standardSuccess: { background: '#EBF7F5', border: '1px solid #9FD8D2', color: '#0E9688' },
        standardError:   { background: '#FEF3EF', border: '1px solid #F5B8A5', color: '#C45030' },
        standardWarning: { background: '#FDF8EC', border: '1px solid #F0D98A', color: '#8A6914' },
        standardInfo:    { background: '#EDF2F7', border: '1px solid #BEE3F8', color: '#2C5282' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
          fontWeight: 600,
          background: '#1A2E2D',
          borderRadius: 6,
          padding: '6px 10px',
          letterSpacing: '-0.005em',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#E8E0D5' },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          transition: 'background 0.15s ease, transform 0.15s ease',
          '&:hover': { background: '#F0EBE3', transform: 'scale(1.05)' },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          border: 'none',
          borderBottom: '1px solid #E8E0D5',
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': { color: '#14B8A6' },
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: '#14B8A6' },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: '#E8E0D5' },
        bar: { backgroundColor: '#14B8A6' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.18s ease',
        },
      },
    },
  },
});

export default theme;
