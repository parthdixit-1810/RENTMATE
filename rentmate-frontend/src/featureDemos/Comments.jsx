import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Avatar, Divider, IconButton
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ReplyIcon from '@mui/icons-material/Reply';

const INITIAL_COMMENTS = [
  {
    id: 1,
    author: 'John Doe',
    initials: 'JD',
    avatarColor: '#1a237e',
    text: 'Can we discuss splitting the electricity bill differently this month? It went up significantly.',
    time: '2h ago',
    likes: 2,
    liked: false,
    replies: [
      {
        id: 11,
        author: 'Jane Smith',
        initials: 'JS',
        avatarColor: '#3949ab',
        text: 'Agreed. I was out of town for two weeks so I think going by usage would be fairer.',
        time: '1h ago',
        likes: 1,
        liked: false,
      },
    ],
  },
  {
    id: 2,
    author: 'Mike Johnson',
    initials: 'MJ',
    avatarColor: '#ff6f61',
    text: 'Reminder: Internet bill is due this Friday. Everyone please transfer their share by Thursday evening.',
    time: '1d ago',
    likes: 3,
    liked: false,
    replies: [],
  },
];

function CommentBubble({ comment, onLike, onReply, isReply = false }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
      <Avatar
        sx={{
          bgcolor: comment.avatarColor,
          width: isReply ? 28 : 36,
          height: isReply ? 28 : 36,
          fontSize: isReply ? '0.65rem' : '0.78rem',
          fontWeight: 700,
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {comment.initials}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{
          bgcolor: isReply ? '#fff8f7' : '#f5f7fa',
          borderRadius: 2,
          p: 1.5,
          mb: 0.5,
          border: '1px solid',
          borderColor: isReply ? '#ffe0db' : '#eaeff5',
        }}>
          <Typography variant="caption" fontWeight={700} color={comment.avatarColor} sx={{ display: 'block', mb: 0.5 }}>
            {comment.author}
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
            {comment.text}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', pl: 0.5 }}>
          <Typography variant="caption" color="text.secondary">{comment.time}</Typography>
          <Box
            component="button"
            onClick={() => onLike(comment.id, isReply)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.4,
              border: 'none', bgcolor: 'transparent', cursor: 'pointer',
              color: comment.liked ? 'primary.main' : 'text.secondary', p: 0,
              '&:hover': { color: 'primary.main' },
              transition: 'color 0.15s',
            }}
          >
            {comment.liked
              ? <ThumbUpIcon sx={{ fontSize: 13 }} />
              : <ThumbUpOutlinedIcon sx={{ fontSize: 13 }} />
            }
            <Typography variant="caption" sx={{ color: 'inherit' }}>{comment.likes}</Typography>
          </Box>
          {!isReply && (
            <Box
              component="button"
              onClick={() => setShowReplyBox(v => !v)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.4,
                border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                color: showReplyBox ? 'primary.main' : 'text.secondary', p: 0,
                '&:hover': { color: 'primary.main' },
                transition: 'color 0.15s',
              }}
            >
              <ReplyIcon sx={{ fontSize: 13 }} />
              <Typography variant="caption" sx={{ color: 'inherit' }}>
                {comment.replies?.length > 0 ? `Reply (${comment.replies.length})` : 'Reply'}
              </Typography>
            </Box>
          )}
        </Box>

        {showReplyBox && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              size="small"
              placeholder="Write a reply..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              sx={{ flex: 1 }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
              autoFocus
            />
            <Button size="small" variant="contained" onClick={handleReply} disabled={!replyText.trim()} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Reply
            </Button>
          </Box>
        )}

        {comment.replies?.length > 0 && (
          <Box sx={{ mt: 1.5, pl: 1, borderLeft: '2px solid #e0e7ef', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {comment.replies.map(reply => (
              <CommentBubble key={reply.id} comment={reply} onLike={onLike} onReply={onReply} isReply />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function Comments() {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const bottomRef = useRef(null);

  const handlePost = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, {
      id: Date.now(),
      author: 'You',
      initials: 'ME',
      avatarColor: '#00897b',
      text: newComment.trim(),
      time: 'just now',
      likes: 0,
      liked: false,
      replies: [],
    }]);
    setNewComment('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleLike = (id, isReply) => {
    setComments(prev => prev.map(c => {
      if (!isReply && c.id === id) {
        return { ...c, likes: c.liked ? c.likes - 1 : c.likes + 1, liked: !c.liked };
      }
      if (isReply) {
        return {
          ...c,
          replies: c.replies.map(r =>
            r.id === id ? { ...r, likes: r.liked ? r.likes - 1 : r.likes + 1, liked: !r.liked } : r
          ),
        };
      }
      return c;
    }));
  };

  const handleReply = (parentId, text) => {
    setComments(prev => prev.map(c =>
      c.id === parentId
        ? {
            ...c,
            replies: [...c.replies, {
              id: Date.now(),
              author: 'You',
              initials: 'ME',
              avatarColor: '#00897b',
              text,
              time: 'just now',
              likes: 0,
              liked: false,
            }],
          }
        : c
    ));
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ flexShrink: 0 }}>
            <rect width="56" height="56" rx="14" fill="#e8eaf6" />
            <path d="M12 18h32c2 0 4 1.8 4 4v14c0 2.2-1.8 4-4 4H32l-4 4-4-4H12c-2.2 0-4-1.8-4-4V22c0-2.2 1.8-4 4-4z" stroke="#1a237e" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
            <path d="M18 28h20M18 22h14" stroke="#3949ab" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <Box>
            <Typography variant="h6" fontWeight={700}>Household Chat</Typography>
            <Typography variant="body2" color="text.secondary">
              Discuss bills and share updates with your roommates.
            </Typography>
          </Box>
        </Box>

        {/* Compose */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
          <Avatar sx={{ bgcolor: '#00897b', width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, mt: 0.5 }}>
            ME
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <TextField
              multiline
              rows={2}
              placeholder="Write a message to your household..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              fullWidth
              size="small"
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handlePost(); }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Ctrl+Enter to post</Typography>
              <Button
                variant="contained"
                size="small"
                onClick={handlePost}
                disabled={!newComment.trim()}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Post
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>
          {comments.length} Message{comments.length !== 1 ? 's' : ''}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {comments.map((comment, idx) => (
            <React.Fragment key={comment.id}>
              <CommentBubble comment={comment} onLike={handleLike} onReply={handleReply} />
              {idx < comments.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Box>
        <div ref={bottomRef} />
      </CardContent>
    </Card>
  );
}
