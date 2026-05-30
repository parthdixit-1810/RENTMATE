import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box, Typography, Card, CardContent, Button, List, ListItem,
  ListItemText, IconButton, Chip, LinearProgress, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileIcon = ({ type }) => {
  if (type === 'application/pdf') return <PictureAsPdfIcon sx={{ color: '#f44336', fontSize: 20 }} />;
  if (type.startsWith('image/')) return <ImageIcon sx={{ color: '#2196f3', fontSize: 20 }} />;
  return <InsertDriveFileIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />;
};

export default function ReceiptUpload() {
  const [pending, setPending] = useState([]);
  const [uploaded, setUploaded] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    const newFiles = acceptedFiles.map(f => ({
      file: f,
      id: Date.now() + Math.random(),
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));
    setPending(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
  });

  const removePending = (id) => {
    setPending(prev => {
      const item = prev.find(f => f.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleUpload = () => {
    if (!pending.length || uploading) return;
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setUploaded(prev => [...prev, ...pending]);
          setPending([]);
          setUploading(false);
          return 100;
        }
        return p + 12;
      });
    }, 150);
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ flexShrink: 0 }}>
            <rect width="56" height="56" rx="14" fill="#e8eaf6" />
            <rect x="16" y="12" width="24" height="32" rx="3" stroke="#1a237e" strokeWidth="2.2" />
            <path d="M22 20h12M22 26h12M22 32h8" stroke="#3949ab" strokeWidth="2" strokeLinecap="round" />
            <circle cx="40" cy="40" r="8" fill="#ff6f61" />
            <path d="M40 37v6M37 40h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <Box>
            <Typography variant="h6" fontWeight={700}>Receipt Upload</Typography>
            <Typography variant="body2" color="text.secondary">
              Upload bill receipts as images or PDFs for record-keeping.
            </Typography>
          </Box>
        </Box>

        {/* Drop zone */}
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : '#d0d9e8',
            borderRadius: 3,
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'rgba(26,35,126,0.04)' : '#fafbff',
            transition: 'all 0.2s',
            mb: 3,
            '&:hover': { borderColor: 'primary.light', bgcolor: 'rgba(26,35,126,0.03)' },
          }}
        >
          <input {...getInputProps()} />
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ margin: '0 auto 12px', display: 'block' }}>
            <circle cx="26" cy="26" r="26" fill="#e8eaf6" />
            <path d="M26 34V22M20 28l6-6 6 6" stroke="#1a237e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 38h16" stroke="#3949ab" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <Typography variant="body1" fontWeight={600} color={isDragActive ? 'primary.main' : 'text.primary'}>
            {isDragActive ? 'Drop files here' : 'Drag and drop receipts here'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            or <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>click to browse</Box> — JPG, PNG, PDF up to 10 MB
          </Typography>
        </Box>

        {/* Pending files */}
        {pending.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              Ready to upload ({pending.length} file{pending.length > 1 ? 's' : ''})
            </Typography>
            <List disablePadding>
              {pending.map(({ id, file, preview }) => (
                <ListItem
                  key={id}
                  sx={{ px: 0, py: 0.75 }}
                  secondaryAction={
                    <IconButton size="small" onClick={() => removePending(id)} edge="end">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <Box sx={{
                    mr: 1.5, width: 40, height: 40, borderRadius: 2, overflow: 'hidden',
                    bgcolor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {preview
                      ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <FileIcon type={file.type} />
                    }
                  </Box>
                  <ListItemText
                    primary={file.name}
                    secondary={formatSize(file.size)}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600, noWrap: true, sx: { maxWidth: 220 } }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
            {uploading && (
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1.5, mb: 1, borderRadius: 2, height: 6 }}
              />
            )}
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 1.5, textTransform: 'none', fontWeight: 700 }}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? `Uploading... ${progress}%` : `Upload ${pending.length} Receipt${pending.length > 1 ? 's' : ''}`}
            </Button>
          </Box>
        )}

        {/* Uploaded files */}
        {uploaded.length > 0 && (
          <>
            {pending.length > 0 && <Divider sx={{ mb: 2 }} />}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              Uploaded ({uploaded.length})
            </Typography>
            <List disablePadding>
              {uploaded.map(({ id, file }) => (
                <ListItem key={id} sx={{ px: 0, py: 0.5 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1.5, fontSize: 20, flexShrink: 0 }} />
                  <ListItemText
                    primary={file.name}
                    secondary={formatSize(file.size)}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Chip label="Saved" color="success" size="small" variant="outlined" />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {pending.length === 0 && uploaded.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
            No receipts uploaded yet. Start by dropping files above.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
