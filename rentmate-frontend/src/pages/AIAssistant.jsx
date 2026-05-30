import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, IconButton,
  Chip, Paper, Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { useLocalStorage } from '../hooks/useLocalStorage';

const fmtINR = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const INITIAL_MESSAGE = {
  id: 0,
  role: 'assistant',
  text: "Hi! I'm your RentMate assistant. Ask me about splitting bills, calculating deposits, or managing reminders.",
  ts: new Date().toISOString(),
};

function getSmartResponse(input, bills, roommates) {
  const lower = input.toLowerCase();

  if (lower.includes('help')) {
    return `Here's what I can help you with:\n\n• **Split bills** — ask "how does splitting work?"\n• **Deposit** — ask "how do I use the deposit calculator?"\n• **Reminders** — ask "how do reminders work?"\n• **Disputes** — ask "how do I dispute a bill?"\n• **Rent** — ask "who hasn't paid rent?"\n• **Utilities** — ask "what's pending on bills?"`;
  }

  if (lower.includes('split')) {
    return `RentMate supports three split methods:\n\n• **Equal** — Total bill divided evenly among all roommates. Each person pays the same amount.\n• **Custom** — You set a percentage for each roommate. Great when rooms are different sizes or incomes vary.\n• **Weighted** — Split proportionally based on room size or usage.\n\nTo use it, go to **Utilities → Add bill** and choose your split method. You can view the breakdown with the eye icon on any bill row.`;
  }

  if (lower.includes('deposit')) {
    return `The **Deposit Calculator** helps you settle deposits when moving out:\n\n1. Go to **Deposit Calc** in the sidebar\n2. Enter the total deposit and number of roommates\n3. Add any deductions (repairs, cleaning, etc.)\n4. The calculator shows the net refund per person\n5. Use **Generate Summary** to copy a shareable text summary\n\nThe data is saved automatically so you can come back to it.`;
  }

  if (lower.includes('remind') || lower.includes('reminder')) {
    return `The **Reminders** page keeps you on top of payments:\n\n• **Upcoming payments** are pulled automatically from your utility bills and rent records\n• Colored dots show urgency: 🔴 Overdue, 🟡 Due within 7 days, 🟢 Upcoming\n• You can also add **custom reminders** for any payment\n• Click "Mark paid" to clear an item from the list`;
  }

  if (lower.includes('dispute')) {
    return `To dispute a bill:\n\n1. Go to **Utilities** — find the bill and click the 🚩 flag icon\n2. This marks it as disputed and it appears on the **Disputes** page\n3. On the Disputes page you can add notes and click **Resolve** when settled\n4. You can also add disputes manually using the + button\n\nAll disputes show Open/Resolved status.`;
  }

  if (lower.includes('rent')) {
    const rmList = Array.isArray(roommates) ? roommates : [];
    if (rmList.length === 0) {
      return `I don't see any roommates in your records yet. Head to the **Rent** page to add your roommates and their rent amounts.`;
    }
    const unpaid = rmList.filter(r => r.status !== 'paid' && r.status !== 'Paid');
    const totalRent = rmList.reduce((s, r) => s + (parseFloat(r.rentAmount || r.amount || 0)), 0);
    const unpaidNames = unpaid.map(r => r.name || r).join(', ');
    return `Your flat has **${rmList.length} roommate(s)** with a total rent of **${fmtINR(totalRent)}**.\n\n${unpaid.length === 0 ? 'All roommates have paid this month! 🎉' : `**${unpaid.length} unpaid**: ${unpaidNames}\n\nHead to the **Rent** page to send reminders or mark them as paid.`}`;
  }

  if (lower.includes('utilit') || lower.includes('bill')) {
    const billList = Array.isArray(bills) ? bills : [];
    if (billList.length === 0) {
      return `No utility bills found. Go to **Utilities** to add your first bill.`;
    }
    const total = billList.reduce((s, b) => s + b.amount, 0);
    const pending = billList.filter(b => b.status !== 'paid');
    const pendingTotal = pending.reduce((s, b) => s + b.amount, 0);
    const pendingCats = [...new Set(pending.map(b => b.category))].join(', ');
    return `You have **${billList.length} utility bill(s)** totalling **${fmtINR(total)}**.\n\n**${pending.length} pending** (${fmtINR(pendingTotal)}): ${pendingCats || 'none'}\n\nGo to the **Utilities** page to view splits or mark bills as paid.`;
  }

  return `I can help with rent splits, utility bills, deposits, and reminders. Try asking about any of these!\n\nFor example:\n• "How does splitting work?"\n• "Who hasn't paid rent?"\n• "How do I use the deposit calculator?"\n• "How do I dispute a bill?"`;
}

function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 2, py: 1.5 }}>
      {[0, 1, 2].map(i => (
        <Box
          key={i}
          sx={{
            width: 8, height: 8, borderRadius: '50%', bgcolor: '#9CA3AF',
            animation: 'bounce 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
            '@keyframes bounce': {
              '0%, 80%, 100%': { transform: 'translateY(0)' },
              '40%': { transform: 'translateY(-8px)' },
            },
          }}
        />
      ))}
    </Box>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 1,
        mb: 1.5,
      }}
    >
      <Avatar
        sx={{
          width: 32, height: 32, flexShrink: 0,
          bgcolor: isUser ? '#14B8A6' : '#101827',
          fontSize: '0.875rem',
        }}
      >
        {isUser ? <PersonIcon sx={{ fontSize: 16 }} /> : <SmartToyIcon sx={{ fontSize: 16 }} />}
      </Avatar>
      <Paper
        elevation={0}
        sx={{
          maxWidth: '72%',
          px: 2, py: 1.25,
          bgcolor: isUser ? '#14B8A6' : '#fff',
          color: isUser ? '#fff' : '#1F2937',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          border: isUser ? 'none' : '1px solid #E5E7EB',
          boxShadow: isUser ? '0 2px 8px rgba(20,184,166,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {msg.text.split('\n').map((line, i) => {
          // Bold markdown **text**
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <Typography key={i} sx={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'inherit' }}>
              {parts.map((part, j) =>
                j % 2 === 1
                  ? <strong key={j}>{part}</strong>
                  : part
              )}
            </Typography>
          );
        })}
        <Typography sx={{ fontSize: '0.6875rem', color: isUser ? 'rgba(255,255,255,0.65)' : '#9CA3AF', mt: 0.5, textAlign: isUser ? 'right' : 'left' }}>
          {new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Paper>
    </Box>
  );
}

export default function AIAssistant() {
  const [bills] = useLocalStorage('rm_utility_bills', []);
  const [roommates] = useLocalStorage('rm_rent_roommates', []);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text,
      ts: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const responseText = getSmartResponse(text, bills, roommates);
      setTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: responseText,
          ts: new Date().toISOString(),
        },
      ]);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const QUICK_PROMPTS = [
    'How does splitting work?',
    'Who hasn\'t paid rent?',
    'What\'s pending on bills?',
    'How do I use the deposit calculator?',
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
      {/* Hero Header */}
      <Box
        sx={{
          mb: 2.5, p: 3, borderRadius: '16px',
          background: 'linear-gradient(135deg, #101827 0%, #101827 60%, #14B8A622 100%)',
          position: 'relative', overflow: 'hidden', flexShrink: 0,
        }}
      >
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(20,184,166,0.18)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SmartToyIcon sx={{ color: '#14B8A6', fontSize: 28 }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.625rem', color: '#FDFCFA', letterSpacing: '-0.03em' }}>
                AI Assistant
              </Typography>
              <Chip
                label="Beta"
                size="small"
                sx={{ bgcolor: '#14B8A6', color: '#fff', fontWeight: 700, fontSize: '0.7rem', height: 20 }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.875rem', color: '#6B8C95', mt: 0.5 }}>
              Ask me anything about your rent, bills, and finances
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick prompts */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, flexShrink: 0 }}>
        {QUICK_PROMPTS.map(p => (
          <Chip
            key={p}
            label={p}
            size="small"
            clickable
            onClick={() => { setInput(p); inputRef.current?.focus(); }}
            sx={{
              bgcolor: '#F0FDFA', color: '#0F766E', border: '1px solid #99F6E4',
              fontSize: '0.75rem', fontWeight: 500,
              '&:hover': { bgcolor: '#CCFBF1' },
            }}
          />
        ))}
      </Box>

      {/* Chat window */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {/* Messages area */}
        <Box
          sx={{
            flex: 1, overflowY: 'auto', p: 2.5,
            bgcolor: '#F9FAFB',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#E5E7EB', borderRadius: 3 },
          }}
        >
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {typing && (
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#101827' }}>
                <SmartToyIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Paper elevation={0} sx={{ borderRadius: '16px 16px 16px 4px', border: '1px solid #E5E7EB', bgcolor: '#fff' }}>
                <TypingIndicator />
              </Paper>
            </Box>
          )}
          <div ref={chatEndRef} />
        </Box>

        {/* Input bar */}
        <Box
          sx={{
            p: 2, borderTop: '1px solid #E5E7EB', bgcolor: '#fff',
            display: 'flex', gap: 1, alignItems: 'flex-end', flexShrink: 0,
          }}
        >
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Ask me about rent, bills, deposits..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&.Mui-focused fieldset': { borderColor: '#14B8A6' },
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || typing}
            sx={{
              bgcolor: '#14B8A6',
              color: '#fff',
              width: 40, height: 40, flexShrink: 0,
              '&:hover': { bgcolor: '#0d9488' },
              '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
              borderRadius: '12px',
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Card>
    </Box>
  );
}
