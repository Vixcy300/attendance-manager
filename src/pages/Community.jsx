import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Heart, ThumbsUp, Flame, Search, AlertCircle,
  Clock, RefreshCw, MessageSquare, Pencil, ShieldCheck, X, TrendingUp,
  Users, CornerDownRight, Plus, MessageCircle, ChevronDown, Zap, Tag, ShieldAlert
} from 'lucide-react';
import {
  community, hasProfanity, canPost, recordPost,
  isDuplicate, recordHash, getOrCreateNickname, saveNickname,
  avatarGradient, POST_MAX_CHARS, REPLY_MAX_CHARS, NICK_MAX_CHARS,
} from '../lib/community';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Constants & Config
// ---------------------------------------------------------------------------
const COMMUNITY_TAGS = [
  { id: 'General',       label: '💬 General' },
  { id: 'Help',         label: '🆘 Help' },
  { id: 'Tips',         label: '💡 Tips' },
  { id: 'V-Study',      label: '📚 V-Study' },
  { id: 'ARMS',         label: '🔗 ARMS' },
  { id: 'Announcements',label: '📣 Announcements' },
  { id: 'Funny',        label: '😂 Funny' },
  { id: 'Rant',         label: '😤 Rant' },
  { id: 'Question',     label: '❓ Question' },
];

const MOODS = [
  { id: 0, label: 'Love it', emoji: '😍', color: 'hover:bg-slate-100', active: 'bg-slate-900 text-white ring-1 ring-slate-900 ring-offset-1' },
  { id: 1, label: "It's OK", emoji: '😐', color: 'hover:bg-slate-100', active: 'bg-slate-900 text-white ring-1 ring-slate-900 ring-offset-1' },
  { id: 2, label: 'Not great', emoji: '😕', color: 'hover:bg-slate-100', active: 'bg-slate-900 text-white ring-1 ring-slate-900 ring-offset-1' },
  { id: 3, label: 'Help!', emoji: '😰', color: 'hover:bg-slate-100', active: 'bg-slate-900 text-white ring-1 ring-slate-900 ring-offset-1' },
];

// Social Credit System (Professional wording)
const BAD_WORDS = [
  'sex', 'porn', 'boobs', 'nude', 'nsfw', 'cock', 'dick', 'pussy', 'vagina',
  'penis', 'naked', 'xxx', 'erotic', 'fuck', 'fucking', 'shit', 'bitch',
  'asshole', 'whore', 'slut', 'nigger', 'faggot', 'bastard', 'cunt',
  'motherfucker', 'rape', 'molest', 'pedo', 'incest', 'blowjob', 'handjob',
];
const GOOD_TRIGGERS = ['flexi learning', 'flexilearning', 'flexible learning', 'vstudy', 'v study', 'v-study'];
const CREDIT_KEY    = 'community_social_credit';
const BAN_KEY       = 'community_ban_until';
const BAN_DURATION  = 2.8 * 60 * 1000; // 2.8 minutes

function getCredit() { try { return parseInt(localStorage.getItem(CREDIT_KEY) || '100', 10); } catch { return 100; } }
function setCredit(v) { try { localStorage.setItem(CREDIT_KEY, String(Math.max(0, Math.min(200, v)))); } catch {} }
function getBanUntil() { try { return parseInt(localStorage.getItem(BAN_KEY) || '0', 10); } catch { return 0; } }
function setBanUntil(ts) { try { localStorage.setItem(BAN_KEY, String(ts)); } catch {} }
function isBanned() { return Date.now() < getBanUntil(); }
function ban() { setBanUntil(Date.now() + BAN_DURATION); setCredit(100); }

function checkText(text) {
  const lower = text.toLowerCase();
  let badFound = null;
  let goodFound = null;
  for (const w of BAD_WORDS)  if (lower.includes(w)) { badFound  = w; break; }
  for (const g of GOOD_TRIGGERS) if (lower.includes(g)) { goodFound = g; break; }
  return { badFound, goodFound };
}

// ---------------------------------------------------------------------------
// Social Credit Popup
// ---------------------------------------------------------------------------
function CreditPopup({ type, word, onDone }) {
  const isGood = type === 'good';
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
      <div className={`credit-popup px-6 py-4 rounded-2xl shadow-2xl border-2 text-center min-w-[260px] ${
        isGood
          ? 'bg-red-600 border-red-800 text-white'
          : 'bg-red-800 border-red-900 text-white'
      }`}>
        {isGood ? (
          <>
            <div className="text-3xl mb-1">🎖️⭐🏅</div>
            <div className="text-lg font-black tracking-wide">社会信用 +100</div>
            <div className="text-sm font-bold opacity-90">SOCIAL CREDIT INCREASED</div>
            <div className="text-xs opacity-75 mt-1">良好公民！GOOD CITIZEN! 🇨🇳</div>
            <div className="text-xs italic opacity-75">"{word}" detected — you love learning!</div>
          </>
        ) : (
          <>
            <div className="text-3xl mb-1">🚨❌🚓</div>
            <div className="text-lg font-black tracking-wide">社会信用 -50</div>
            <div className="text-sm font-bold opacity-90">SOCIAL CREDIT REDUCED</div>
            <div className="text-xs opacity-75 mt-1">不良行为！BAD BEHAVIOUR! 🇨🇳</div>
            <div className="text-xs italic opacity-75">"{word}" is not tolerated here</div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ban Screen
// ---------------------------------------------------------------------------
function BanScreen({ onExpired }) {
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil((getBanUntil() - Date.now()) / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.ceil((getBanUntil() - Date.now()) / 1000);
      setSecondsLeft(left);
      if (left <= 0) { clearInterval(interval); onExpired?.(); }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-[9998] bg-red-900 flex flex-col items-center justify-center text-white select-none">
      <div className="text-8xl mb-4 animate-bounce">🚓</div>
      <div className="text-6xl font-black mb-2">你已被封禁</div>
      <div className="text-3xl font-bold mb-1">YOU HAVE BEEN BANNED</div>
      <div className="text-lg opacity-75 mb-8 text-center px-4">Inappropriate content detected. Social credit system activated.</div>
      <div className="bg-black/30 rounded-2xl px-10 py-6 text-center border-2 border-red-600">
        <div className="text-sm uppercase tracking-widest opacity-75 mb-2">Ban expires in</div>
        <div className="text-6xl font-mono font-black tabular-nums">
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
        <div className="text-sm opacity-60 mt-2">2.8 minutes community cooldown</div>
      </div>
      <div className="mt-8 text-sm opacity-50 italic">
        🇨🇳 The SaveethaAM Social Credit System thanks you for your cooperation.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `Just now`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const CAT_COLORS = {
  General: 'bg-slate-100 text-slate-600 border-slate-200', Help: 'bg-rose-50 text-rose-700 border-rose-200',
  Tips: 'bg-emerald-50 text-emerald-700 border-emerald-200', 'V-Study': 'bg-violet-50 text-violet-700 border-violet-200',
  ARMS: 'bg-sky-50 text-sky-700 border-sky-200', Announcements: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Funny: 'bg-amber-50 text-amber-700 border-amber-200', Rant: 'bg-orange-50 text-orange-700 border-orange-200',
  Question: 'bg-blue-50 text-blue-700 border-blue-200',
};

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
function Avatar({ name, size = 'sm' }) {
  const gradient = avatarGradient(name);
  const dim = size === 'sm' ? 'w-9 h-9 text-xs' : 'w-11 h-11 text-sm';
  return (
    <div className={cn(
      dim, 
      "rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold shrink-0 shadow-sm border border-white/20",
      gradient
    )}>
      {(name || 'A')[0].toUpperCase()}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tags Selector (framer-motion animated)
// ---------------------------------------------------------------------------
function TagsSelector({ selected, onSelect, onDeselect }) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: containerRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, [selected]);

  const unselected = COMMUNITY_TAGS.filter(t => !selected.find(s => s.id === t.id));

  return (
    <div className="w-full">
      <motion.div
        ref={containerRef}
        layout
        className="w-full flex items-center gap-2 bg-slate-50/50 border border-slate-200/60 rounded-2xl p-2 mb-3 overflow-x-auto no-scrollbar min-h-[52px]"
      >
        {selected.length === 0 && (
          <span className="text-sm text-slate-400 px-3 font-medium">Select relevant topics...</span>
        )}
        {selected.map(tag => (
          <motion.div
            key={tag.id}
            layoutId={`tag-${tag.id}`}
            className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-slate-900 text-white rounded-xl shrink-0 text-xs font-semibold"
          >
            <motion.span layoutId={`tag-label-${tag.id}`}>{tag.label}</motion.span>
            <button type="button" onClick={() => onDeselect(tag.id)} className="p-0.5 rounded-full hover:bg-slate-700 transition-colors">
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </motion.div>

      {unselected.length > 0 && (
        <motion.div layout className="flex flex-wrap gap-2">
          {unselected.map(tag => (
            <motion.button
              key={tag.id}
              layoutId={`tag-${tag.id}`}
              type="button"
              onClick={() => onSelect(tag)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:border-slate-300 hover:shadow-sm hover:text-slate-900 transition-all"
            >
              <motion.span layoutId={`tag-label-${tag.id}`}>{tag.label}</motion.span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mood Selector
// ---------------------------------------------------------------------------
function MoodSelector({ selected, onSelect }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {MOODS.map(m => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(selected === m.id ? null : m.id)}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all duration-200",
            selected === m.id 
              ? m.active 
              : `border-slate-200 bg-white text-slate-600 ${m.color}`
          )}
        >
          <span className="text-lg leading-none">{m.emoji}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Social Credit Bar (Trust Score)
// ---------------------------------------------------------------------------
function SocialCreditBar({ score }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600';
  
  return (
    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-1.5 shrink-0">
        <ShieldCheck size={14} className={textColor} />
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">🇨🇳 Social Credit</span>
      </div>
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
        <motion.div
          className={`h-full ${color} rounded-full`}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80 }}
        />
      </div>
      <span className={cn("text-xs font-bold tabular-nums", textColor)}>
        {score} / 100
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compose Modal
// ---------------------------------------------------------------------------
function ComposeModal({ nickname, onClose, onPosted }) {
  const [content, setContent]       = useState('');
  const [tags, setTags]             = useState([]);
  const [mood, setMood]             = useState(null);
  const [posting, setPosting]       = useState(false);
  const [error, setError]           = useState('');
  const [creditScore, setCreditScore] = useState(getCredit());
  const [creditPopup, setCreditPopup] = useState(null);
  const [textareaClass, setTextareaClass] = useState('');
  const [bannedNow, setBannedNow]   = useState(isBanned());
  const popupTimer = useRef(null);
  const detectedBad  = useRef(new Set());
  const detectedGood = useRef(new Set());

  const triggerPopup = (type, word) => {
    clearTimeout(popupTimer.current);
    setCreditPopup({ type, word });
    popupTimer.current = setTimeout(() => setCreditPopup(null), 2500);
  };

  const handleContentChange = (e) => {
    const val = e.target.value.slice(0, POST_MAX_CHARS);
    setContent(val);
    const lower = val.toLowerCase();

    for (const word of BAD_WORDS) {
      if (lower.includes(word) && !detectedBad.current.has(word)) {
        detectedBad.current.add(word);
        const current = getCredit();
        const newScore = Math.max(0, current - 50);
        setCredit(newScore);
        setCreditScore(newScore);
        setTextareaClass('flash-red shake');
        triggerPopup('bad', word);
        setTimeout(() => setTextareaClass(''), 1500);
        if (newScore <= 0) {
          ban();
          setCreditPopup(null);
          setTimeout(() => setBannedNow(true), 500);
        }
        return;
      }
    }

    for (const trigger of GOOD_TRIGGERS) {
      if (lower.includes(trigger) && !detectedGood.current.has(trigger)) {
        detectedGood.current.add(trigger);
        const current = getCredit();
        const newScore = Math.min(200, current + 100);
        setCredit(newScore);
        setCreditScore(newScore);
        setTextareaClass('flash-green');
        triggerPopup('good', trigger);
        setTimeout(() => setTextareaClass(''), 2000);
        return;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isBanned()) { setBannedNow(true); return; }

    const trimmed = content.trim();
    if (!trimmed) return setError('Write something first!');
    if (trimmed.length > POST_MAX_CHARS) return setError('Too long!');
    if (hasProfanity(trimmed)) return setError('Inappropriate language detected. Review your post.');
    const { badFound } = checkText(trimmed);
    if (badFound) return setError(`Remove "${badFound}" before posting.`);
    if (isDuplicate(trimmed)) return setError('You just posted this. Wait a moment.');
    const { allowed } = canPost();
    if (!allowed) return setError('Posting too fast. Wait a few minutes.');
    if (tags.length === 0) return setError('Please select at least one topic tag.');

    setPosting(true);
    try {
      recordPost();
      recordHash(trimmed);
      saveNickname(nickname);
      const category = tags[0].id;
      const { error: err } = await community.createPost({
        nickname, content: trimmed, category, mood,
      });
      if (err) throw err;
      onPosted?.();
      onClose();
    } catch {
      setError('Failed to post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  if (bannedNow) return <BanScreen onExpired={() => setBannedNow(false)} />;

  const charsLeft = POST_MAX_CHARS - content.length;

  return (
    <>
      <AnimatePresence>
        {creditPopup && <CreditPopup type={creditPopup.type} word={creditPopup.word} />}
      </AnimatePresence>

      <div
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full sm:max-w-2xl bg-white sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/50 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <Avatar name={nickname} />
              <div>
                <p className="text-sm font-bold text-slate-900">{nickname}</p>
                <p className="text-xs font-medium text-slate-500">Posting to community</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-6 flex-1">
              {/* Mood */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Feeling</label>
                <MoodSelector selected={mood} onSelect={setMood} />
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  placeholder="What's on your mind? Share a tip, ask a question..."
                  rows={4}
                  autoFocus
                  maxLength={POST_MAX_CHARS}
                  className={cn(
                    "w-full text-base border border-slate-200 rounded-2xl px-5 py-4 bg-white text-slate-900 placeholder-slate-400 resize-none outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all leading-relaxed",
                    textareaClass
                  )}
                />
                <span className={cn(
                  "absolute bottom-3 right-4 text-xs font-medium",
                  charsLeft < 100 ? 'text-rose-500' : 'text-slate-300'
                )}>{charsLeft}</span>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Topics</label>
                <TagsSelector
                  selected={tags}
                  onSelect={tag => setTags(prev => [...prev, tag])}
                  onDeselect={id => setTags(prev => prev.filter(t => t.id !== id))}
                />
              </div>

              {/* Social credit bar */}
              <SocialCreditBar score={creditScore} />

              {error && (
                <div className="flex items-center gap-2 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                {canPost().remaining} post{canPost().remaining !== 1 ? 's' : ''} remaining
              </span>
              <button
                type="submit"
                disabled={posting || !content.trim()}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                {posting ? <><RefreshCw size={16} className="animate-spin" /> Posting...</> : <><Send size={16} /> Publish</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Reply node
// ---------------------------------------------------------------------------
function ReplyNode({ reply, allReplies, onReply, onLike, likedSet }) {
  const children = allReplies.filter(r => r.parent_id === reply.id);
  const liked = likedSet.has(reply.id);
  const [localLikes, setLocalLikes] = useState(reply.likes || 0);
  
  const handleLike = () => { if (liked) return; setLocalLikes(l => l + 1); onLike(reply.id); };
  
  return (
    <div className="relative group/reply">
      <div className="flex gap-3 py-3 relative z-10 bg-white">
        <Avatar name={reply.nickname} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span className="text-sm font-bold text-slate-900">{reply.nickname}</span>
            {reply.parent_id && (
              <span className="text-xs font-medium text-slate-400 flex items-center gap-0.5">
                <CornerDownRight size={10} />
                {allReplies.find(r => r.id === reply.parent_id)?.nickname || 'reply'}
              </span>
            )}
            <span className="text-xs font-medium text-slate-400">{timeAgo(reply.created_at)}</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">{reply.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button onClick={handleLike}
              className={cn(
                "flex items-center gap-1.5 text-xs font-bold transition-colors group/like",
                liked ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'
              )}>
              <ThumbsUp size={12} className={cn("transition-transform group-active/like:scale-75", liked && "fill-slate-900")} /> 
              {localLikes > 0 && localLikes}
            </button>
            <button onClick={() => onReply(reply)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">
              <MessageSquare size={12} /> Reply
            </button>
          </div>
        </div>
      </div>
      {children.length > 0 && (
        <div className="ml-4 pl-7 border-l-2 border-slate-100 relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-white before:pointer-events-none before:h-8 before:top-[-32px]">
          {children.map(child => (
            <ReplyNode key={child.id} reply={child} allReplies={allReplies}
              onReply={onReply} onLike={onLike} likedSet={likedSet} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reply thread
// ---------------------------------------------------------------------------
function ReplyThread({ postId, nickname }) {
  const [replies, setReplies]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [content, setContent]       = useState('');
  const [posting, setPosting]       = useState(false);
  const [error, setError]           = useState('');
  const [likedSet, setLikedSet]     = useState(new Set());
  const inputRef = useRef(null);

  const load = useCallback(async () => {
    const { data } = await community.getReplies(postId);
    if (data) setReplies(data);
    setLoading(false);
  }, [postId]);

  useEffect(() => { load(); }, [load]);

  const handleLike = async (id) => {
    setLikedSet(prev => new Set([...prev, id]));
    await community.likeReply(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBanned()) return setError('Account suspended. Wait for cooldown.');
    setError('');
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > REPLY_MAX_CHARS) return setError(`Max ${REPLY_MAX_CHARS} chars.`);
    if (hasProfanity(trimmed)) return setError('Guideline violation detected.');
    const { badFound } = checkText(trimmed);
    if (badFound) return setError(`Remove "${badFound}" first.`);
    setPosting(true);
    const { error: err } = await community.createReply({ postId, parentId: replyingTo?.id || null, nickname, content: trimmed });
    if (err) setError('Failed to reply. Try again.');
    else { setContent(''); setReplyingTo(null); await load(); }
    setPosting(false);
  };

  const topLevel = replies.filter(r => !r.parent_id);

  return (
    <div className="border-t border-slate-100 pt-5 mt-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={14} className="text-slate-400" />
        <span className="text-sm font-bold text-slate-700">
          {replies.length === 0 ? 'Be the first to reply' : `${replies.length} Comment${replies.length === 1 ? '' : 's'}`}
        </span>
      </div>
      
      {loading ? (
        <div className="space-y-4 py-2">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2 mt-1">
                <div className="h-3 bg-slate-100 rounded-full w-24 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          {topLevel.map(r => <ReplyNode key={r.id} reply={r} allReplies={replies} onReply={setReplyingTo} onLike={handleLike} likedSet={likedSet} />)}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-5 bg-slate-50/50 p-3 sm:p-4 rounded-2xl border border-slate-100">
        {replyingTo && (
          <div className="flex items-center gap-2 mb-3 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg w-fit shadow-sm">
            <CornerDownRight size={12} className="text-slate-400" />
            Replying to <span className="font-bold text-slate-900">{replyingTo.nickname}</span>
            <button type="button" onClick={() => setReplyingTo(null)} className="ml-1 p-0.5 hover:bg-slate-100 rounded-md transition-colors"><X size={12} /></button>
          </div>
        )}
        <div className="flex items-start gap-3">
          <Avatar name={nickname} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-300 transition-all overflow-hidden">
              <textarea ref={inputRef} value={content} onChange={e => setContent(e.target.value.slice(0, REPLY_MAX_CHARS))}
                placeholder={replyingTo ? `Reply to ${replyingTo.nickname}...` : 'Add to the discussion...'}
                rows={2} maxLength={REPLY_MAX_CHARS}
                className="w-full text-sm px-4 py-3 bg-transparent text-slate-900 placeholder-slate-400 resize-none outline-none block" />
              
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100">
                <span className={cn("text-[10px] font-bold uppercase tracking-widest", (REPLY_MAX_CHARS - content.length) < 50 ? "text-rose-500" : "text-slate-400")}>
                  {REPLY_MAX_CHARS - content.length}
                </span>
                <button type="submit" disabled={posting || !content.trim()}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all active:scale-[0.98]">
                  {posting ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                  {posting ? 'Posting...' : 'Reply'}
                </button>
              </div>
            </div>
            {error && <p className="text-xs font-medium text-rose-500 mt-2 ml-1">{error}</p>}
          </div>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Post card
// ---------------------------------------------------------------------------
function PostCard({ post, nickname, expanded, onToggle }) {
  const [reacted, setReacted]       = useState({});
  const [counts, setCounts]         = useState({ likes: post.likes || 0, hearts: post.hearts || 0, fires: post.fires || 0 });
  const catColor = CAT_COLORS[post.category] || CAT_COLORS.General;
  const mood = MOODS.find(m => m.id === post.mood);
  const replyCount = post.reply_count || 0;

  const handleReact = async (field) => {
    const key = post.id + field;
    if (reacted[key]) return;
    setReacted(prev => ({ ...prev, [key]: true }));
    setCounts(prev => ({ ...prev, [field]: prev[field] + 1 }));
    await community.react(post.id, field);
  };

  return (
    <article className={cn(
      "bg-white border rounded-[1.5rem] transition-all duration-300 relative",
      expanded 
        ? 'border-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10' 
        : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm shadow-sm'
    )}>
      <div className="p-4 sm:p-6">
        <div className="flex gap-4">
          <Avatar name={post.nickname} size="md" />
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900">{post.nickname}</span>
                <span className="text-xs font-medium text-slate-400">&middot; {timeAgo(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {mood && <span title={mood.label} className="text-base leading-none select-none">{mood.emoji}</span>}
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border", catColor)}>
                  {post.category}
                </span>
              </div>
            </div>
            
            <p className={cn(
              "text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap break-words",
              !expanded && 'line-clamp-4'
            )}>
              {post.content}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-5 sm:ml-[3.75rem] flex-wrap">
          {[
            { field: 'likes', icon: ThumbsUp, active: 'text-blue-600 bg-blue-50 border-blue-100 fill-blue-600' },
            { field: 'hearts', icon: Heart, active: 'text-rose-600 bg-rose-50 border-rose-100 fill-rose-600' },
            { field: 'fires', icon: Flame, active: 'text-orange-600 bg-orange-50 border-orange-100 fill-orange-600' },
          ].map(({ field, icon: Icon, active }) => {
            const hasReacted = reacted[post.id + field];
            return (
              <button key={field} onClick={() => handleReact(field)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all select-none border group/btn",
                  hasReacted 
                    ? active 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}>
                <Icon size={14} className={cn("transition-transform group-active/btn:scale-75", hasReacted && "fill-current")} /> 
                {counts[field] > 0 && counts[field]}
              </button>
            )
          })}
          
          <button onClick={onToggle}
            className={cn(
              "ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
              expanded 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}>
            <MessageCircle size={14} />
            {replyCount > 0 ? `${replyCount} Reply${replyCount > 1 ? 's' : ''}` : 'Reply'}
            <ChevronDown size={14} className={cn("transition-transform", expanded && "rotate-180")} />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-6 pt-0">
              <ReplyThread postId={post.id} nickname={nickname} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function Community() {
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage]               = useState(0);
  const [hasMore, setHasMore]         = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch]           = useState('');
  const [sort, setSort]               = useState('latest');
  const [expandedId, setExpandedId]   = useState(null);
  const [liveCount, setLiveCount]     = useState(0);
  const [showCompose, setShowCompose] = useState(false);
  const [nickname, setNickname]       = useState('');
  const [editingNick, setEditingNick] = useState(false);
  const [nickDraft, setNickDraft]     = useState('');
  const [showBan, setShowBan]         = useState(isBanned());
  const searchTimer = useRef(null);

  useEffect(() => {
    document.title = 'Community | SaveethaAM';
    const n = getOrCreateNickname();
    setNickname(n); setNickDraft(n);
  }, []);

  const fetchPosts = useCallback(async (pg = 0, cat = categoryFilter, q = search, s = sort, replace = false) => {
    if (pg === 0) setLoading(true); else setLoadingMore(true);
    const { data, error } = await community.getPosts({ category: cat === 'All' ? null : cat, search: q, page: pg, sort: s });
    if (!error && data) { setPosts(prev => replace ? data : [...prev, ...data]); setHasMore(data.length === 20); }
    setLoading(false); setLoadingMore(false);
  }, [categoryFilter, search, sort]);

  useEffect(() => { setPage(0); fetchPosts(0, categoryFilter, search, sort, true); }, [categoryFilter, sort]);
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(0); fetchPosts(0, categoryFilter, search, sort, true); }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [search]);
  useEffect(() => {
    const ch = community.subscribeToNew(() => setLiveCount(c => c + 1));
    return () => ch?.unsubscribe?.();
  }, []);

  if (showBan) return <BanScreen onExpired={() => setShowBan(false)} />;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans selection:bg-slate-200">
      {/* Navbar (Premium Frosted Glass) */}
      <header className="fixed top-0 w-full bg-white/70 backdrop-blur-xl z-[100] border-b border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 mr-2 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="text-white size-4" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 hidden sm:block">
              Saveetha<span className="text-slate-400 font-medium">AM</span>
            </span>
          </Link>
          
          <div className="h-5 w-px bg-slate-200 hidden sm:block mx-1"></div>
          <span className="font-bold text-slate-800 hidden sm:block text-sm tracking-wide">Community</span>
          
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            {/* Identity Control */}
            {editingNick ? (
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <input value={nickDraft} onChange={e => setNickDraft(e.target.value.slice(0, NICK_MAX_CHARS))}
                  onKeyDown={e => { if (e.key === 'Enter') { saveNickname(nickDraft); setNickname(nickDraft); setEditingNick(false); } }}
                  autoFocus className="text-sm font-semibold bg-transparent w-24 sm:w-32 outline-none px-2 text-slate-900 placeholder-slate-400" placeholder="Display name" />
                <button onClick={() => { saveNickname(nickDraft); setNickname(nickDraft); setEditingNick(false); }}
                  className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm">Save</button>
              </div>
            ) : (
              <button onClick={() => { setNickDraft(nickname); setEditingNick(true); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors group">
                <Avatar name={nickname} size="sm" />
                <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900 hidden sm:block">{nickname}</span>
              </button>
            )}
            
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Live</span>
            </div>
            
            {/* CTA */}
            <button onClick={() => { if (isBanned()) { setShowBan(true); return; } setShowCompose(true); }}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98]">
              <Plus size={16} /> <span className="hidden sm:inline">New Post</span><span className="sm:hidden">Post</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-6 pt-24 pb-20">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Sidebar - Premium SaaS styling */}
          <aside className="w-full lg:w-[280px] shrink-0 order-2 lg:order-1 mt-6 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              
              {/* Info Card */}
              <div className="bg-white border border-slate-200/80 rounded-[1.5rem] p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Users size={20} className="text-slate-700" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Discussion Board</h2>
                    <p className="text-xs font-medium text-slate-400">SIMATS Network</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 font-medium">
                  An open, anonymous space to share insights, ask questions, and connect with peers.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4">
                  <TrendingUp size={14} className="text-slate-400" />
                  {posts.length} entries active
                </div>
              </div>

              {/* Topics Nav */}
              <div className="bg-white border border-slate-200/80 rounded-[1.5rem] p-3 shadow-sm hidden lg:block">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-3 pt-2">Categories</p>
                <nav className="space-y-0.5">
                  {['All', ...COMMUNITY_TAGS.map(t => t.id)].map(cat => {
                    const isActive = categoryFilter === cat;
                    return (
                      <button key={cat} onClick={() => setCategoryFilter(cat)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left group",
                          isActive 
                            ? 'bg-slate-900 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}>
                        <span className={cn("text-base transition-transform group-hover:scale-110", isActive && "grayscale brightness-200 contrast-100")}>
                          {cat === 'All' ? '🌐' : COMMUNITY_TAGS.find(t => t.id === cat)?.label.charAt(0)}
                        </span>
                        <span>{cat === 'All' ? 'Everything' : COMMUNITY_TAGS.find(t => t.id === cat)?.label.slice(2)}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Guidelines */}
              <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-sm text-white">
                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                  <ShieldCheck size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Guidelines</h3>
                </div>
                <ul className="text-sm text-slate-300 space-y-3 font-medium">
                  <li className="flex items-start gap-2"><span className="text-rose-400 mt-0.5">✕</span> Zero tolerance for toxicity</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span> Constructive discussion only</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-400 mt-0.5">✧</span> "Flexi Learning" boosts standing</li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <div className="flex-1 min-w-0 order-1 lg:order-2">
            
            {/* Controls Bar (Search + Sort + Mobile Filter) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              
              {/* Search - Pill shaped */}
              <div className="relative flex-1 group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions..."
                  className="w-full pl-11 pr-4 py-3 text-sm font-medium bg-white border border-slate-200/80 rounded-full outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all shadow-sm" />
              </div>

              {/* Mobile Category Select */}
              <div className="relative lg:hidden">
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200/80 rounded-full pl-4 pr-10 py-3 outline-none focus:ring-2 focus:ring-slate-900 appearance-none font-bold text-slate-700 shadow-sm">
                  <option value="All">All Categories</option>
                  {COMMUNITY_TAGS.map(t => <option key={t.id} value={t.id}>{t.label.slice(2)}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Segmented Control for Sort */}
              <div className="flex bg-slate-200/50 p-1 rounded-full shrink-0 self-start sm:self-auto w-full sm:w-auto">
                <button onClick={() => setSort('latest')}
                  className={cn(
                    "flex-1 sm:flex-none px-5 py-2 flex items-center justify-center gap-1.5 text-sm font-bold rounded-full transition-all duration-200",
                    sort === 'latest' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}>
                  <Clock size={14} /> Latest
                </button>
                <button onClick={() => setSort('hot')}
                  className={cn(
                    "flex-1 sm:flex-none px-5 py-2 flex items-center justify-center gap-1.5 text-sm font-bold rounded-full transition-all duration-200",
                    sort === 'hot' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}>
                  <Zap size={14} /> Hot
                </button>
              </div>
            </div>

            {/* Live Update Pill */}
            <AnimatePresence>
              {liveCount > 0 && (
                <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="mb-6 flex justify-center">
                  <button onClick={() => { setLiveCount(0); setPage(0); fetchPosts(0, categoryFilter, search, sort, true); }}
                    className="flex items-center gap-2 bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-transform hover:scale-105 shadow-md">
                    <RefreshCw size={14} className="animate-spin" />
                    Load {liveCount} new {liveCount > 1 ? 'entries' : 'entry'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feed Content */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white border border-slate-200/80 rounded-[1.5rem] p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-11 h-11 rounded-full bg-slate-100 shrink-0" />
                      <div className="flex-1 space-y-3 pt-1">
                        <div className="h-4 bg-slate-100 rounded-full w-1/3" />
                        <div className="h-3 bg-slate-100 rounded-full w-full" />
                        <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-200/80 rounded-[2rem] shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 border border-slate-100">
                  <MessageSquare size={28} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No discussions found</h3>
                <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto mb-6">
                  {search ? 'Try adjusting your filters or search terms.' : 'Be the first to start a conversation in this topic.'}
                </p>
                <button onClick={() => setShowCompose(true)}
                  className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95">
                  <Plus size={16} /> New Discussion
                </button>
              </div>
            ) : (
              <div className="space-y-4 lg:space-y-5">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} nickname={nickname}
                    expanded={expandedId === post.id}
                    onToggle={() => setExpandedId(prev => prev === post.id ? null : post.id)} />
                ))}
              </div>
            )}

            {!loading && hasMore && posts.length > 0 && (
              <button onClick={() => { const next = page + 1; setPage(next); fetchPosts(next, categoryFilter, search, sort, false); }}
                disabled={loadingMore}
                className="w-full mt-8 flex items-center justify-center gap-2 text-sm font-bold text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl py-4 transition-all shadow-sm disabled:opacity-50">
                {loadingMore ? <RefreshCw size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                {loadingMore ? 'Loading more...' : 'Load older discussions'}
              </button>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showCompose && (
          <ComposeModal
            nickname={nickname}
            onClose={() => setShowCompose(false)}
            onPosted={() => { setLiveCount(0); setPage(0); fetchPosts(0, categoryFilter, search, sort, true); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
