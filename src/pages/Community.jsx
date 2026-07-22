import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Send, Heart, ThumbsUp, Flame, Search, Filter, Tag,
  AlertCircle, Clock, ChevronDown, RefreshCw, MessageSquare, Pencil,
  ShieldCheck, X, TrendingUp, Users
} from 'lucide-react';
import { CinematicFooter } from '../components/ui/motion-footer';
import {
  community, sanitize, hasProfanity, canPost, recordPost,
  isDuplicate, recordHash, getOrCreateNickname, saveNickname,
  CATEGORIES, POST_MAX_CHARS, NICK_MAX_CHARS,
} from '../lib/community';

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

const CATEGORY_COLORS = {
  General:      'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
  Help:         'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Tips:         'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'V-Study':    'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  ARMS:         'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Announcements:'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  Funny:        'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

// ---------------------------------------------------------------------------
// PostCard
// ---------------------------------------------------------------------------
function PostCard({ post, onReact }) {
  const [reacted, setReacted] = useState({});
  const [localCounts, setLocalCounts] = useState({
    likes: post.likes || 0,
    hearts: post.hearts || 0,
    fires: post.fires || 0,
  });

  const handleReact = (field) => {
    if (reacted[post.id + field]) return;
    setReacted(prev => ({ ...prev, [post.id + field]: true }));
    setLocalCounts(prev => ({ ...prev, [field]: prev[field] + 1 }));
    onReact(post.id, field);
  };

  const catColor = CATEGORY_COLORS[post.category] || CATEGORY_COLORS.General;

  return (
    <article className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
            {(post.nickname || 'A')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 leading-none">{post.nickname || 'Anonymous'}</p>
            <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
              <Clock size={10} /> {timeAgo(post.created_at)}
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${catColor}`}>
          {post.category}
        </span>
      </div>

      {/* Content */}
      <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap break-words mb-4">
        {post.content}
      </p>

      {/* Reactions */}
      <div className="flex items-center gap-2">
        {[
          { field: 'likes',  icon: ThumbsUp, label: localCounts.likes,  activeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
          { field: 'hearts', icon: Heart,    label: localCounts.hearts, activeColor: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' },
          { field: 'fires',  icon: Flame,    label: localCounts.fires,  activeColor: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30' },
        ].map(({ field, icon: Icon, label, activeColor }) => {
          const isActive = reacted[post.id + field];
          return (
            <button
              key={field}
              onClick={() => handleReact(field)}
              title={isActive ? 'Already reacted' : 'React'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all select-none
                ${isActive
                  ? `${activeColor} cursor-default`
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer'
                }`}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Compose Box
// ---------------------------------------------------------------------------
function ComposeBox({ onPosted }) {
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [editingNick, setEditingNick] = useState(false);
  const { remaining } = canPost();

  useEffect(() => { setNickname(getOrCreateNickname()); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const trimContent = content.trim();
    const trimNick    = nickname.trim();

    // Validations
    if (!trimContent) return setError('Please write something before posting.');
    if (trimContent.length > POST_MAX_CHARS) return setError(`Post is too long (max ${POST_MAX_CHARS} chars).`);
    if (trimNick.length > NICK_MAX_CHARS) return setError(`Nickname too long (max ${NICK_MAX_CHARS} chars).`);
    if (hasProfanity(trimContent) || hasProfanity(trimNick)) return setError('Your message contains inappropriate language. Please rephrase it.');
    if (isDuplicate(trimContent)) return setError('You just posted the same message. Please wait a moment.');
    const { allowed } = canPost();
    if (!allowed) return setError('You\'re posting too fast. Please wait a few minutes and try again.');

    setLoading(true);
    try {
      saveNickname(trimNick);
      recordPost();
      recordHash(trimContent);
      const { error: dbErr } = await community.createPost({ nickname: trimNick, content: trimContent, category });
      if (dbErr) throw dbErr;
      setContent('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onPosted?.();
    } catch (err) {
      console.error(err);
      setError('Failed to post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const charsLeft = POST_MAX_CHARS - content.length;
  const charsColor = charsLeft < 100 ? 'text-red-500' : charsLeft < 300 ? 'text-amber-500' : 'text-neutral-400';

  return (
    <div className="bg-white dark:bg-neutral-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {(nickname[0] || 'A').toUpperCase()}
        </div>
        {editingNick ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              value={nickname}
              onChange={e => setNickname(e.target.value.slice(0, NICK_MAX_CHARS))}
              onBlur={() => { saveNickname(nickname); setEditingNick(false); }}
              onKeyDown={e => e.key === 'Enter' && (saveNickname(nickname), setEditingNick(false))}
              className="flex-1 text-sm border border-indigo-300 rounded-lg px-3 py-1.5 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Your nickname"
              autoFocus
              maxLength={NICK_MAX_CHARS}
            />
            <button onClick={() => setEditingNick(false)} className="text-neutral-400 hover:text-neutral-600"><X size={16} /></button>
          </div>
        ) : (
          <button onClick={() => setEditingNick(true)} className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 transition-colors group">
            {nickname}
            <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-neutral-400">
          <ShieldCheck size={13} className="text-green-500" />
          <span>{remaining} post{remaining !== 1 ? 's' : ''} left</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Category Selector */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all
                ${category === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value.slice(0, POST_MAX_CHARS))}
            placeholder="Share a tip, ask for help, or just chat with your fellow students..."
            maxLength={POST_MAX_CHARS}
            rows={4}
            className="w-full text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 resize-none outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
          />
          <span className={`absolute bottom-2 right-3 text-xs ${charsColor}`}>{charsLeft}</span>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 rounded-xl">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2.5 rounded-xl">
            ✅ Posted successfully!
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-indigo-200 dark:hover:shadow-none"
          >
            {loading ? (
              <span className="flex items-center gap-2"><RefreshCw size={15} className="animate-spin" />Posting…</span>
            ) : (
              <><Send size={15} /> Post</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function Community() {
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage]             = useState(0);
  const [hasMore, setHasMore]       = useState(true);
  const [category, setCategory]     = useState('All');
  const [search, setSearch]         = useState('');
  const [liveCount, setLiveCount]   = useState(0);
  const searchTimer                 = useRef(null);
  const channelRef                  = useRef(null);

  // Page title
  useEffect(() => { document.title = 'Community | SaveethaAM'; }, []);

  const fetchPosts = useCallback(async (pg = 0, cat = category, q = search, replace = false) => {
    if (pg === 0) setLoading(true); else setLoadingMore(true);
    const { data, error } = await community.getPosts({ category: cat === 'All' ? null : cat, search: q, page: pg });
    if (!error && data) {
      setPosts(prev => replace ? data : [...prev, ...data]);
      setHasMore(data.length === 20);
    }
    setLoading(false);
    setLoadingMore(false);
  }, [category, search]);

  // Initial load
  useEffect(() => {
    setPage(0);
    fetchPosts(0, category, search, true);
  }, [category]);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(0);
      fetchPosts(0, category, search, true);
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = community.subscribeToNew((payload) => {
      setLiveCount(c => c + 1);
    });
    channelRef.current = channel;
    return () => { channel?.unsubscribe?.(); };
  }, []);

  const handleLoadNew = () => {
    setLiveCount(0);
    setPage(0);
    fetchPosts(0, category, search, true);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next, category, search, false);
  };

  const handleReact = async (postId, field) => {
    await community.react(postId, field);
  };

  return (
    <div className="relative w-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 min-h-screen font-sans overflow-x-hidden selection:bg-indigo-200">

      {/* ── Nav ── */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white size-4" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Saveetha<span className="text-indigo-600">AM</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
            <Link to="/" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 transition-colors">
              ← Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <div className="pt-24 pb-10 bg-gradient-to-b from-indigo-50 dark:from-indigo-950/20 to-white dark:to-black border-b border-neutral-100 dark:border-neutral-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Student Community</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white mb-3">
            💬 Discussion Board
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-sm md:text-base">
            A safe, anonymous space for SIMATS students. Share tips, ask questions, vent or celebrate — no login required.
          </p>
          {/* Stats pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="flex items-center gap-1.5 text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-full shadow-sm">
              <TrendingUp size={12} className="text-indigo-500" /> {posts.length}+ posts
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-full shadow-sm">
              <ShieldCheck size={12} className="text-green-500" /> Sanitized & Safe
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-full shadow-sm">
              <MessageSquare size={12} className="text-violet-500" /> Real-time updates
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">

          {/* ── Feed column ── */}
          <div className="min-w-0">
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search posts…"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
              </div>
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 appearance-none cursor-pointer font-medium"
                >
                  <option value="All">All Topics</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Live new posts banner */}
            {liveCount > 0 && (
              <button
                onClick={handleLoadNew}
                className="w-full mb-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all animate-bounce"
              >
                <RefreshCw size={14} />
                {liveCount} new post{liveCount > 1 ? 's' : ''} — Click to load
              </button>
            )}

            {/* Posts */}
            {loading ? (
              <div className="flex flex-col gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl h-32 animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <MessageSquare size={40} className="text-neutral-300 dark:text-neutral-700 mb-3" />
                <p className="text-neutral-500 font-semibold">No posts yet.</p>
                <p className="text-neutral-400 text-sm mt-1">Be the first to start a conversation!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} onReact={handleReact} />
                ))}
              </div>
            )}

            {/* Load more */}
            {!loading && hasMore && posts.length > 0 && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl py-3 transition-all disabled:opacity-50"
              >
                {loadingMore ? <RefreshCw size={15} className="animate-spin" /> : <ChevronDown size={15} />}
                {loadingMore ? 'Loading…' : 'Load more posts'}
              </button>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="flex flex-col gap-4">
            {/* Compose */}
            <ComposeBox onPosted={() => { setLiveCount(0); fetchPosts(0, category, search, true); }} />

            {/* Guidelines card */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 text-sm">
              <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Community Rules
              </h3>
              <ul className="text-amber-700 dark:text-amber-400 space-y-1.5 text-xs leading-relaxed">
                <li>🚫 No spam or repeated posts</li>
                <li>🚫 No personal attacks or hate speech</li>
                <li>✅ Be kind — everyone is a student here</li>
                <li>✅ Share tips about attendance, V-Study or ARMS</li>
                <li>🔒 Posts are anonymous but monitored</li>
              </ul>
            </div>

            {/* Categories card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
              <h3 className="font-bold text-neutral-800 dark:text-neutral-100 mb-3 flex items-center gap-1.5 text-sm">
                <Tag size={14} /> Browse by Topic
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {['All', ...CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all
                      ${category === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* About card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 text-xs text-neutral-500 dark:text-neutral-500 leading-relaxed">
              <p>SaveethaAM Community is a moderated, anonymous discussion board for students of SIMATS Engineering. All posts are sanitized against XSS attacks. Rate limiting and profanity filters are active.</p>
            </div>
          </aside>
        </div>
      </main>

      <CinematicFooter />
    </div>
  );
}
