import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Heart, ThumbsUp, Flame, Search, AlertCircle,
  Clock, RefreshCw, MessageSquare, Pencil, ShieldCheck, X, TrendingUp,
  Users, CornerDownRight, Plus, MessageCircle, ChevronDown, Zap, Tag
} from 'lucide-react';
import {
  community, hasProfanity, canPost, recordPost,
  isDuplicate, recordHash, getOrCreateNickname, saveNickname,
  avatarGradient, POST_MAX_CHARS, REPLY_MAX_CHARS, NICK_MAX_CHARS,
} from '../lib/community';

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
  { id: 0, label: 'Love it', emoji: '😍', color: 'hover:bg-rose-50 hover:border-rose-300', active: 'bg-rose-100 border-rose-400 text-rose-700' },
  { id: 1, label: "It's OK", emoji: '😐', color: 'hover:bg-amber-50 hover:border-amber-300', active: 'bg-amber-100 border-amber-400 text-amber-700' },
  { id: 2, label: 'Not great', emoji: '😕', color: 'hover:bg-orange-50 hover:border-orange-300', active: 'bg-orange-100 border-orange-400 text-orange-700' },
  { id: 3, label: 'Help!', emoji: '😰', color: 'hover:bg-indigo-50 hover:border-indigo-300', active: 'bg-indigo-100 border-indigo-400 text-indigo-700' },
];

// Social Credit System
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
      <div className="text-lg opacity-75 mb-8">Inappropriate content detected. Social credit system activated.</div>
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
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const CAT_COLORS = {
  General: 'bg-slate-100 text-slate-600', Help: 'bg-amber-50 text-amber-700',
  Tips: 'bg-emerald-50 text-emerald-700', 'V-Study': 'bg-violet-50 text-violet-700',
  ARMS: 'bg-red-50 text-red-700', Announcements: 'bg-indigo-50 text-indigo-700',
  Funny: 'bg-yellow-50 text-yellow-700', Rant: 'bg-orange-50 text-orange-700',
  Question: 'bg-blue-50 text-blue-700',
};

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
function Avatar({ name, size = 'sm' }) {
  const gradient = avatarGradient(name);
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}>
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
      {/* Selected tags row */}
      <motion.div
        ref={containerRef}
        layout
        className="w-full flex items-center gap-1.5 border border-neutral-200 bg-white rounded-xl h-12 px-2 mb-2 overflow-x-auto no-scrollbar"
      >
        {selected.length === 0 && (
          <span className="text-xs text-neutral-400 px-2">Select topics for your post…</span>
        )}
        {selected.map(tag => (
          <motion.div
            key={tag.id}
            layoutId={`tag-${tag.id}`}
            className="flex items-center gap-1 pl-3 pr-1.5 py-1 bg-indigo-600 text-white rounded-lg shrink-0 text-xs font-semibold h-8"
          >
            <motion.span layoutId={`tag-label-${tag.id}`}>{tag.label}</motion.span>
            <button onClick={() => onDeselect(tag.id)} className="p-0.5 rounded-full hover:bg-indigo-700 ml-0.5">
              <X size={11} />
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Available tags */}
      {unselected.length > 0 && (
        <motion.div layout className="flex flex-wrap gap-1.5">
          {unselected.map(tag => (
            <motion.button
              key={tag.id}
              layoutId={`tag-${tag.id}`}
              type="button"
              onClick={() => onSelect(tag)}
              className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-transparent hover:border-indigo-200"
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
// Mood Selector (emoji reaction bar)
// ---------------------------------------------------------------------------
function MoodSelector({ selected, onSelect }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {MOODS.map(m => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(selected === m.id ? null : m.id)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all
            ${selected === m.id ? m.active : `border-neutral-200 bg-neutral-50 text-neutral-500 ${m.color}`}`}
        >
          <span className="text-base">{m.emoji}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Social Credit Bar
// ---------------------------------------------------------------------------
function SocialCreditBar({ score }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-400 shrink-0">🇨🇳 Social Credit:</span>
      <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80 }}
        />
      </div>
      <span className={`text-xs font-bold ${pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
        {score}
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
  const [creditPopup, setCreditPopup] = useState(null); // { type, word }
  const [textareaClass, setTextareaClass] = useState('');
  const [bannedNow, setBannedNow]   = useState(isBanned());
  const popupTimer = useRef(null);
  // Track which words already penalised this compose session (avoid double-hits)
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

    // ── Bad word check ── penalise only once per unique word per session
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
        return; // one penalty per keystroke
      }
    }

    // ── Good trigger check ──
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
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full sm:max-w-xl bg-white sm:rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <Avatar name={nickname} />
              <div>
                <p className="text-sm font-bold text-neutral-800">{nickname}</p>
                <p className="text-xs text-neutral-400">Posting anonymously · No login required</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors">
              <X size={18} className="text-neutral-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">

            {/* Mood / Emoji reaction bar */}
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">How are you feeling?</p>
              <MoodSelector selected={mood} onSelect={setMood} />
            </div>

            {/* Content */}
            <div className="relative">
              <textarea
                value={content}
                onChange={handleContentChange}
                placeholder="What's on your mind? Share a tip, ask for help, post about V-Study or ARMS…"
                rows={5}
                autoFocus
                maxLength={POST_MAX_CHARS}
                className={`w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 text-neutral-800 placeholder-neutral-400 resize-none outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all leading-relaxed ${textareaClass}`}
              />
              <span className={`absolute bottom-2 right-3 text-xs ${charsLeft < 100 ? 'text-red-400' : 'text-neutral-300'}`}>{charsLeft}</span>
            </div>

            {/* Social credit bar */}
            <SocialCreditBar score={creditScore} />

            {/* Tags selector */}
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag size={11} /> Topics
              </p>
              <TagsSelector
                selected={tags}
                onSelect={tag => setTags(prev => [...prev, tag])}
                onDeselect={id => setTags(prev => prev.filter(t => t.id !== id))}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-green-500" />
                {canPost().remaining} post{canPost().remaining !== 1 ? 's' : ''} remaining
              </span>
              <button
                type="submit"
                disabled={posting || !content.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm"
              >
                {posting ? <><RefreshCw size={14} className="animate-spin" /> Posting…</> : <><Send size={14} /> Post</>}
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
    <div>
      <div className="flex gap-3 py-3 group">
        <Avatar name={reply.nickname} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-neutral-800">{reply.nickname}</span>
            {reply.parent_id && (
              <span className="text-xs text-neutral-400 flex items-center gap-0.5">
                <CornerDownRight size={10} />
                {allReplies.find(r => r.id === reply.parent_id)?.nickname || 'reply'}
              </span>
            )}
            <span className="text-xs text-neutral-400">{timeAgo(reply.created_at)}</span>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap break-words">{reply.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={handleLike}
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all
                ${liked ? 'text-indigo-600 bg-indigo-50' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'}`}>
              <ThumbsUp size={11} /> {localLikes}
            </button>
            <button onClick={() => onReply(reply)}
              className="flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-all">
              <CornerDownRight size={11} /> Reply
            </button>
          </div>
        </div>
      </div>
      {children.length > 0 && (
        <div className="ml-11 border-l-2 border-neutral-100 pl-4">
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
    if (isBanned()) return setError('You are currently banned. Wait for the cooldown.');
    setError('');
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > REPLY_MAX_CHARS) return setError(`Max ${REPLY_MAX_CHARS} chars.`);
    if (hasProfanity(trimmed)) return setError('Inappropriate language detected.');
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
    <div className="border-t border-neutral-100 pt-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle size={14} className="text-neutral-400" />
        <span className="text-sm font-semibold text-neutral-600">
          {replies.length === 0 ? 'No replies yet' : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
        </span>
      </div>
      {loading ? (
        <div className="space-y-3 py-2">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-neutral-100 rounded w-24 animate-pulse" />
                <div className="h-3 bg-neutral-100 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-neutral-50">
          {topLevel.map(r => <ReplyNode key={r.id} reply={r} allReplies={replies} onReply={setReplyingTo} onLike={handleLike} likedSet={likedSet} />)}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4">
        {replyingTo && (
          <div className="flex items-center gap-2 mb-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
            <CornerDownRight size={12} />
            Replying to <strong>{replyingTo.nickname}</strong>
            <button type="button" onClick={() => setReplyingTo(null)} className="ml-auto"><X size={12} /></button>
          </div>
        )}
        <div className="flex items-start gap-3">
          <Avatar name={nickname} size="sm" />
          <div className="flex-1">
            <div className="relative">
              <textarea ref={inputRef} value={content} onChange={e => setContent(e.target.value.slice(0, REPLY_MAX_CHARS))}
                placeholder={replyingTo ? `Reply to ${replyingTo.nickname}…` : 'Write a reply…'}
                rows={2} maxLength={REPLY_MAX_CHARS}
                className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 text-neutral-800 placeholder-neutral-400 resize-none outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all" />
              <span className="absolute bottom-2 right-3 text-xs text-neutral-300">{REPLY_MAX_CHARS - content.length}</span>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={posting || !content.trim()}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all">
                {posting ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                {posting ? 'Posting…' : 'Reply'}
              </button>
            </div>
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
    <article className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden
      ${expanded ? 'border-indigo-200 shadow-md shadow-indigo-50' : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'}`}>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <Avatar name={post.nickname} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-sm font-semibold text-neutral-800">{post.nickname}</span>
              {mood && <span title={mood.label} className="text-base">{mood.emoji}</span>}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColor}`}>{post.category}</span>
              <span className="text-xs text-neutral-400 ml-auto flex items-center gap-1">
                <Clock size={10} />{timeAgo(post.created_at)}
              </span>
            </div>
            <p className={`text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap break-words mt-1 ${!expanded ? 'line-clamp-3' : ''}`}>
              {post.content}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {[
            { field: 'likes', icon: ThumbsUp, active: 'text-indigo-600 bg-indigo-50' },
            { field: 'hearts', icon: Heart, active: 'text-rose-600 bg-rose-50' },
            { field: 'fires', icon: Flame, active: 'text-orange-600 bg-orange-50' },
          ].map(({ field, icon: Icon, active }) => (
            <button key={field} onClick={() => handleReact(field)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all select-none
                ${reacted[post.id + field] ? `${active} cursor-default` : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 cursor-pointer border border-neutral-100'}`}>
              <Icon size={12} /> <span>{counts[field]}</span>
            </button>
          ))}
          <button onClick={onToggle}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
              ${expanded ? 'bg-indigo-600 text-white' : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'}`}>
            <MessageCircle size={12} />
            {replyCount > 0 ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}
            {!expanded && <ChevronDown size={11} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-5">
          <ReplyThread postId={post.id} nickname={nickname} />
        </div>
      )}
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
    <div className="min-h-screen bg-[#f8f9fb] font-sans selection:bg-indigo-100">
      {/* Navbar */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-[100] border-b border-neutral-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 mr-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="text-white size-3.5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-neutral-900">
              Saveetha<span className="text-indigo-600">AM</span>
            </span>
          </Link>
          <span className="text-neutral-300 hidden sm:block">|</span>
          <span className="font-semibold text-neutral-700 hidden sm:block text-sm">Community</span>
          <div className="ml-auto flex items-center gap-3">
            {editingNick ? (
              <div className="flex items-center gap-2">
                <input value={nickDraft} onChange={e => setNickDraft(e.target.value.slice(0, NICK_MAX_CHARS))}
                  onKeyDown={e => { if (e.key === 'Enter') { saveNickname(nickDraft); setNickname(nickDraft); setEditingNick(false); } }}
                  autoFocus className="text-xs border border-indigo-300 rounded-lg px-2 py-1.5 w-32 outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                <button onClick={() => { saveNickname(nickDraft); setNickname(nickDraft); setEditingNick(false); }}
                  className="text-xs bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg font-medium">Save</button>
                <button onClick={() => setEditingNick(false)}><X size={14} className="text-neutral-400" /></button>
              </div>
            ) : (
              <button onClick={() => { setNickDraft(nickname); setEditingNick(true); }}
                className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-all">
                <Avatar name={nickname} size="sm" />
                <span className="font-medium">{nickname}</span>
                <Pencil size={10} />
              </button>
            )}
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="hidden sm:inline">Live</span>
            </span>
            <button onClick={() => { if (isBanned()) { setShowBan(true); return; } setShowCompose(true); }}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95">
              <Plus size={15} /> New Post
            </button>
            <Link to="/" className="hidden sm:block text-sm font-medium text-neutral-500 hover:text-neutral-800 transition-colors">← Back</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-[260px_1fr] gap-6 mt-4">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <Users size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-800">Discussion Board</p>
                    <p className="text-xs text-neutral-400">SIMATS Students</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                  Anonymous space to share tips, ask questions, and connect with fellow students. No login needed.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <TrendingUp size={11} className="text-indigo-500" />
                  <span>{posts.length} posts loaded</span>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Topics</p>
                <div className="space-y-1">
                  {['All', ...COMMUNITY_TAGS.map(t => t.id)].map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left
                        ${categoryFilter === cat ? 'bg-indigo-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                      {cat === 'All' ? '🌐 All' : COMMUNITY_TAGS.find(t => t.id === cat)?.label || cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Community Rules
                </p>
                <ul className="text-xs text-amber-700 space-y-1.5 leading-relaxed">
                  <li>🚫 No inappropriate content (Social Credit system active)</li>
                  <li>🚫 No spam or hate speech</li>
                  <li>✅ Be kind — we're all students</li>
                  <li>🎖️ Mention "Flexi Learning" for +100 social credit 😄</li>
                  <li>🔒 Anonymous &amp; moderated</li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Feed */}
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[160px]">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts…"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 transition-all" />
              </div>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="lg:hidden text-sm bg-white border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400 appearance-none font-medium">
                <option value="All">All Topics</option>
                {COMMUNITY_TAGS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <div className="flex bg-white border border-neutral-200 rounded-xl overflow-hidden text-sm font-semibold shrink-0">
                <button onClick={() => setSort('latest')}
                  className={`px-4 py-2.5 flex items-center gap-1.5 transition-all ${sort === 'latest' ? 'bg-indigo-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                  <Clock size={13} /> Latest
                </button>
                <button onClick={() => setSort('hot')}
                  className={`px-4 py-2.5 flex items-center gap-1.5 transition-all ${sort === 'hot' ? 'bg-indigo-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                  <Zap size={13} /> Hot
                </button>
              </div>
            </div>

            {liveCount > 0 && (
              <button onClick={() => { setLiveCount(0); setPage(0); fetchPosts(0, categoryFilter, search, sort, true); }}
                className="w-full mb-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all shadow-sm">
                <RefreshCw size={14} />
                {liveCount} new post{liveCount > 1 ? 's' : ''} — Click to refresh
              </button>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-neutral-100 rounded w-28" />
                        <div className="h-3 bg-neutral-100 rounded w-3/4" />
                        <div className="h-3 bg-neutral-100 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-neutral-200 rounded-2xl">
                <MessageSquare size={48} className="text-neutral-200 mb-4" />
                <p className="text-neutral-600 font-bold text-lg">No posts yet</p>
                <p className="text-neutral-400 text-sm mt-1">Be the first to start a conversation!</p>
                <button onClick={() => setShowCompose(true)}
                  className="mt-5 flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all">
                  <Plus size={15} /> Write a post
                </button>
              </div>
            ) : (
              <div className="space-y-3">
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
                className="w-full mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-xl py-3 transition-all disabled:opacity-50">
                {loadingMore ? <RefreshCw size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                {loadingMore ? 'Loading…' : 'Load more'}
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
