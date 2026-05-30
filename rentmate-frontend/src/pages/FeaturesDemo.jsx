import React, { Suspense, lazy } from 'react';
import { Box, Typography, Divider, CircularProgress } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalculateIcon from '@mui/icons-material/Calculate';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';

const InviteRoommate = lazy(() => import('../featureDemos/InviteRoommate'));
const ReceiptUpload = lazy(() => import('../featureDemos/ReceiptUpload'));
const SplitCalculator = lazy(() => import('../featureDemos/SplitCalculator'));
const Analytics = lazy(() => import('../featureDemos/Analytics'));
const Comments = lazy(() => import('../featureDemos/Comments'));

function Section({ id, icon, title, children }) {
  return (
    <Box id={id} sx={{ mb: 8 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Box sx={{
          bgcolor: 'secondary.main',
          color: '#fff',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 2,
        }}>{icon}</Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{title}</Typography>
      </Box>
      <Suspense fallback={<CircularProgress color="primary" />}>{children}</Suspense>
      <Divider sx={{ my: 6, opacity: 0.12 }} />
    </Box>
  );
}

export default function FeaturesDemo() {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 10, position: 'relative', zIndex: 1 }}>
      {/* Floating SVG blob background */}
      <svg id="floating-blob-bg" width="700" height="320" viewBox="0 0 700 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="350" cy="160" rx="320" ry="110" fill="url(#paint0_radial_blob)" />
        <defs>
          <radialGradient id="paint0_radial_blob" cx="0" cy="0" r="1" gradientTransform="translate(350 160) scale(320 110)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6c63ff" />
            <stop offset="1" stopColor="#23235b" stopOpacity="0.18" />
          </radialGradient>
        </defs>
      </svg>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 10,
        position: 'relative',
        zIndex: 2,
      }}>
        {/* SVG pattern background */}
        <svg width="420" height="180" viewBox="0 0 420 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', zIndex: 0, opacity: 0.18 }}>
          <ellipse cx="210" cy="90" rx="200" ry="70" fill="url(#paint0_radial)" />
          <defs>
            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(210 90) scale(200 70)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6c63ff" />
              <stop offset="1" stopColor="#23235b" stopOpacity="0.2" />
            </radialGradient>
          </defs>
        </svg>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '2.2rem', md: '3.2rem' },
            background: 'linear-gradient(90deg, #1a237e 0%, #3949ab 100%)',
            color: 'transparent',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            letterSpacing: '-1px',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          Feature Demos
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 600, zIndex: 1 }}>
          Explore RentMate’s interactive features—invite roommates, upload receipts, split rent, view analytics, and chat—all in a modern, beautiful UI.
        </Typography>
      </Box>
      <Section id="invite-roommate" icon={<GroupAddIcon fontSize="medium" />} title="Invite Roommate">
        <InviteRoommate />
      </Section>
      <Section id="receipt-upload" icon={<ReceiptLongIcon fontSize="medium" />} title="Receipt Upload">
        <ReceiptUpload />
      </Section>
      <Section id="split-calculator" icon={<CalculateIcon fontSize="medium" />} title="Split Calculator">
        <SplitCalculator />
      </Section>
      <Section id="analytics" icon={<BarChartIcon fontSize="medium" />} title="Analytics">
        <Analytics />
      </Section>
      <Section id="comments" icon={<ChatIcon fontSize="medium" />} title="Comments">
        <Comments />
      </Section>
    </Box>
  );
} 