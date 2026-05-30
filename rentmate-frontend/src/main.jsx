import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/700.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
