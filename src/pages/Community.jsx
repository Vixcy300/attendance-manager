import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Send, Heart, ThumbsUp, Flame, Search, Filter,
  AlertCircle, Clock, RefreshCw, MessageSquare, Pencil, ShieldCheck,
  X, TrendingUp, Users, CornerDownRight, Plus, MessageCircle,
  ChevronDown, MoreHorizontal, ArrowUp, Zap
} from 'lucide-react';
import {
  community, sanitize, hasProfanity, canPost, recordPost,
  isDuplicate, recordHash, getOrCreateNickname, saveNickname,
  avatarGradient, CATEGORIES, POST_MAX_CHARS, REPLY_MAX_CHARS, NICK_MAX_CHARS,
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

const CAT_COLORS = {
  General:       'bg-slate-100 text-slate-600',
  Help:          'bg-amber-50 text-amber-700',
  Tips:          'bg-emerald-50 text-emerald-700',
  'V-Study':     'bg-violet-50 text-violet-700',
  ARMS:          'bg-red-50 text-red-700',
  Announcements: 'bg-indigo-50 text-indigo-700',
  Funny:         'bg-yellow-50 text-yellow-700',
};

// ---------------------------------------------------------------------------
// Avatar component
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
// Reply node (handles nesting)
// ---------------------------------------------------------------------------
function ReplyNode({ reply, allReplies, onReply, onLike, likedSet }) {
  const children = allReplies.filter(r => r.parent_id === reply.id);
  const liked = likedSet.has(reply.id);
  const [localLikes, setLocalLikes] = useState(reply.likes || 0);

  const handleLike = () => {
    if (liked) return;
    setLocalLikes(l => l + 1);
    onLike(reply.id);
  };

  return (
    <div>
      <div className="flex gap-3 group py-3">
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
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-all
                ${liked ? 'text-indigo-600 bg-indigo-50' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'}`}
            >
              <ThumbsUp size={11} /> {localLikes}
            </button>
            <button
              onClick={() => onReply(reply)}
              className="flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-all"
            >
              <CornerDownRight size={11} /> Reply
            </button>
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {children.length > 0 && (
        <div className="ml-11 border-l-2 border-neutral-100 pl-4">
          {children.map(child => (
            <ReplyNode
              key={child.id}
              reply={child}
              allReplies={allReplies}
              onReply={onReply}
              onLike={onLike}
              likedSet={likedSet}
            />
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
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null); // reply object or null (top-level)
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [likedSet, setLikedSet] = useState(new Set());
  const inputRef = useRef(null);

  const load = useCallback(async () => {
    const { data } = await community.getReplies(postId);
    if (data) setReplies(data);
    setLoading(false);
  }, [postId]);

  useEffect(() => { load(); }, [load]);

  const handleReply = (replyObj) => {
    setReplyingTo(replyObj);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleLike = async (replyId) => {
    setLikedSet(prev => new Set([...prev, replyId]));
    await community.likeReply(replyId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > REPLY_MAX_CHARS) return setError(`Max ${REPLY_MAX_CHARS} characters.`);
    if (hasProfanity(trimmed)) return setError('Please rephrase — inappropriate language detected.');

    setPosting(true);
    const { error: err } = await community.createReply({
      postId,
      parentId: replyingTo?.id || null,
      nickname,
      content: trimmed,
    });
    if (err) {
      setError('Failed to post. Try again.');
    } else {
      setContent('');
      setReplyingTo(null);
      await load();
    }
    setPosting(false);
  };

  const topLevel = replies.filter(r => !r.parent_id);

  return (
    <div className="border-t border-neutral-100 pt-4 mt-4">
      {/* Replies header */}
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle size={14} className="text-neutral-400" />
        <span className="text-sm font-semibold text-neutral-600">
          {replies.length === 0 ? 'No replies yet' : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3 py-2">
          {[...Array(2)].map((_, i) => (
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
          {topLevel.map(reply => (
            <ReplyNode
              key={reply.id}
              reply={reply}
              allReplies={replies}
              onReply={handleReply}
              onLike={handleLike}
              likedSet={likedSet}
            />
          ))}
        </div>
      )}

      {/* Reply input */}
      <form onSubmit={handleSubmit} className="mt-4">
        {replyingTo && (
          <div className="flex items-center gap-2 mb-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
            <CornerDownRight size={12} />
            Replying to <strong>{replyingTo.nickname}</strong>
            <button type="button" onClick={() => setReplyingTo(null)} className="ml-auto">
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex items-start gap-3">
          <Avatar name={nickname} size="sm" />
          <div className="flex-1">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={content}
                onChange={e => setContent(e.target.value.slice(0, REPLY_MAX_CHARS))}
                placeholder={replyingTo ? `Reply to ${replyingTo.nickname}…` : 'Write a reply…'}
                rows={2}
                className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 text-neutral-800 placeholder-neutral-400 resize-none outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all"
                maxLength={REPLY_MAX_CHARS}
              />
              <span className="absolute bottom-2 right-3 text-xs text-neutral-300">{REPLY_MAX_CHARS - content.length}</span>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={posting || !content.trim()}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
              >
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
// Compose modal
// ---------------------------------------------------------------------------
function ComposeModal({ nickname, onClose, onPosted }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const charsLeft = POST_MAX_CHARS - content.length;
  const { remaining } = canPost();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = content.trim();
    if (!trimmed) return setError('Write something first!');
    if (trimmed.length > POST_MAX_CHARS) return setError('Too long!');
    if (hasProfanity(trimmed) || hasProfanity(nickname)) return setError('Inappropriate language detected. Please rephrase.');
    if (isDuplicate(trimmed)) return setError('You just posted this. Wait a moment.');
    const { allowed } = canPost();
    if (!allowed) return setError('Posting too fast. Wait a few minutes.');

    setPosting(true);
    try {
      recordPost();
      recordHash(trimmed);
      saveNickname(nickname);
      const { error: err } = await community.createPost({ nickname, content: trimmed, category });
      if (err) throw err;
      onPosted?.();
      onClose();
    } catch {
      setError('Failed to post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-xl bg-white sm:rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-slide-up">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <Avatar name={nickname} size="sm" />
            <div>
              <p className="text-sm font-semibold text-neutral-800">{nickname}</p>
              <p className="text-xs text-neutral-400">Posting anonymously</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Category chips */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Topic</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => setCategory(cat)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all border
                    ${category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-neutral-600 border-neutral-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="relative">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value.slice(0, POST_MAX_CHARS))}
              placeholder="What's on your mind? Share a tip, ask for help, or just chat with fellow students…"
              rows={5}
              autoFocus
              maxLength={POST_MAX_CHARS}
              className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 text-neutral-800 placeholder-neutral-400 resize-none outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all leading-relaxed"
            />
            <span className={`absolute bottom-2 right-3 text-xs ${charsLeft < 100 ? 'text-red-400' : 'text-neutral-300'}`}>{charsLeft}</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-green-500" />
              {remaining} post{remaining !== 1 ? 's' : ''} remaining
            </span>
            <button type="submit" disabled={posting || !content.trim()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm">
              {posting ? <><RefreshCw size={14} className="animate-spin" /> Posting…</> : <><Send size={14} /> Post</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Post card
// ---------------------------------------------------------------------------
function PostCard({ post, nickname, expanded, onToggle }) {
  const [reacted, setReacted] = useState({});
  const [counts, setCounts] = useState({ likes: post.likes || 0, hearts: post.hearts || 0, fires: post.fires || 0 });

  const handleReact = async (field) => {
    const key = post.id + field;
    if (reacted[key]) return;
    setReacted(prev => ({ ...prev, [key]: true }));
    setCounts(prev => ({ ...prev, [field]: prev[field] + 1 }));
    await community.react(post.id, field);
  };

  const catColor = CAT_COLORS[post.category] || CAT_COLORS.General;
  const replyCount = post.reply_count || 0;

  return (
    <article className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden
      ${expanded ? 'border-indigo-200 shadow-md shadow-indigo-50' : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'}`}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          <Avatar name={post.nickname} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-sm font-semibold text-neutral-800">{post.nickname}</span>
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

        {/* Reactions + toggle */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {[
            { field: 'likes',  icon: ThumbsUp, activeColor: 'text-indigo-600 bg-indigo-50' },
            { field: 'hearts', icon: Heart,    activeColor: 'text-rose-600 bg-rose-50' },
            { field: 'fires',  icon: Flame,    activeColor: 'text-orange-600 bg-orange-50' },
          ].map(({ field, icon: Icon, activeColor }) => {
            const isActive = reacted[post.id + field];
            return (
              <button key={field} onClick={() => handleReact(field)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all select-none
                  ${isActive ? `${activeColor} cursor-default` : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 cursor-pointer border border-neutral-100'}`}>
                <Icon size={12} /> <span>{counts[field]}</span>
              </button>
            );
          })}

          <button onClick={onToggle}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
              ${expanded ? 'bg-indigo-600 text-white' : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'}`}>
            <MessageCircle size={12} />
            {replyCount > 0 ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}
            {!expanded && <ChevronDown size={11} />}
          </button>
        </div>
      </div>

      {/* Expanded reply thread */}
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
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage]             = useState(0);
  const [hasMore, setHasMore]       = useState(true);
  const [category, setCategory]     = useState('All');
  const [search, setSearch]         = useState('');
  const [sort, setSort]             = useState('latest');
  const [expandedId, setExpandedId] = useState(null);
  const [liveCount, setLiveCount]   = useState(0);
  const [showCompose, setShowCompose] = useState(false);
  const [nickname, setNickname]     = useState('');
  const [editingNick, setEditingNick] = useState(false);
  const [nickDraft, setNickDraft]   = useState('');
  const searchTimer                 = useRef(null);

  useEffect(() => {
    document.title = 'Community | SaveethaAM';
    const n = getOrCreateNickname();
    setNickname(n);
    setNickDraft(n);
  }, []);

  const fetchPosts = useCallback(async (pg = 0, cat = category, q = search, s = sort, replace = false) => {
    if (pg === 0) setLoading(true); else setLoadingMore(true);
    const { data, error } = await community.getPosts({ category: cat === 'All' ? null : cat, search: q, page: pg, sort: s });
    if (!error && data) {
      setPosts(prev => replace ? data : [...prev, ...data]);
      setHasMore(data.length === 20);
    }
    setLoading(false);
    setLoadingMore(false);
  }, [category, search, sort]);

  useEffect(() => { setPage(0); fetchPosts(0, category, search, sort, true); }, [category, sort]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(0);
      fetchPosts(0, category, search, sort, true);
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  useEffect(() => {
    const channel = community.subscribeToNew(() => setLiveCount(c => c + 1));
    return () => channel?.unsubscribe?.();
  }, []);

  const handleLoadNew = () => {
    setLiveCount(0);
    setPage(0);
    fetchPosts(0, category, search, sort, true);
  };

  const handleSaveNick = () => {
    const n = nickDraft.trim().slice(0, NICK_MAX_CHARS);
    if (n) { setNickname(n); saveNickname(n); }
    setEditingNick(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans selection:bg-indigo-100">

      {/* ── Navbar ── */}
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
            {/* Nickname editor */}
            {editingNick ? (
              <div className="flex items-center gap-2">
                <input
                  value={nickDraft}
                  onChange={e => setNickDraft(e.target.value.slice(0, NICK_MAX_CHARS))}
                  onKeyDown={e => e.key === 'Enter' && handleSaveNick()}
                  autoFocus
                  className="text-xs border border-indigo-300 rounded-lg px-2 py-1.5 w-32 outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                />
                <button onClick={handleSaveNick} className="text-xs bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg font-medium">Save</button>
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

            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-indigo-200 active:scale-95"
            >
              <Plus size={15} /> New Post
            </button>

            <Link to="/" className="hidden sm:block text-sm font-medium text-neutral-500 hover:text-neutral-800 transition-colors">
              ← Back
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-[260px_1fr] gap-6 mt-4">

          {/* ── Left Sidebar ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">

              {/* About card */}
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
                  An anonymous space to share tips, ask questions, and connect with your fellow students. No login needed.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <TrendingUp size={11} className="text-indigo-500" />
                  <span>{posts.length} posts</span>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Topics</p>
                <div className="space-y-1">
                  {['All', ...CATEGORIES].map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left
                        ${category === cat ? 'bg-indigo-600 text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Community Rules
                </p>
                <ul className="text-xs text-amber-700 space-y-1.5 leading-relaxed">
                  <li>🚫 No spam or repeated content</li>
                  <li>🚫 No hate speech or personal attacks</li>
                  <li>✅ Be respectful — we're all students</li>
                  <li>✅ Share tips about attendance, ARMS, V-Study</li>
                  <li>🔒 All posts are anonymous &amp; monitored</li>
                </ul>
              </div>
            </div>
          </aside>

          {/* ── Feed ── */}
          <div className="min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[160px]">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search posts…"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Mobile category select */}
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="lg:hidden text-sm bg-white border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400 appearance-none font-medium"
              >
                <option value="All">All Topics</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>

              {/* Sort */}
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

            {/* New posts banner */}
            {liveCount > 0 && (
              <button onClick={handleLoadNew}
                className="w-full mb-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all shadow-sm">
                <RefreshCw size={14} />
                {liveCount} new post{liveCount > 1 ? 's' : ''} — Click to refresh
              </button>
            )}

            {/* Post list */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
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
                  <PostCard
                    key={post.id}
                    post={post}
                    nickname={nickname}
                    expanded={expandedId === post.id}
                    onToggle={() => setExpandedId(prev => prev === post.id ? null : post.id)}
                  />
                ))}
              </div>
            )}

            {/* Load more */}
            {!loading && hasMore && posts.length > 0 && (
              <button onClick={() => { const next = page + 1; setPage(next); fetchPosts(next, category, search, sort, false); }}
                disabled={loadingMore}
                className="w-full mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-xl py-3 transition-all disabled:opacity-50">
                {loadingMore ? <RefreshCw size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ── Compose Modal ── */}
      {showCompose && (
        <ComposeModal
          nickname={nickname}
          onClose={() => setShowCompose(false)}
          onPosted={() => { setLiveCount(0); setPage(0); fetchPosts(0, category, search, sort, true); }}
        />
      )}
    </div>
  );
}
