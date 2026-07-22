import { supabase } from './supabase';
import DOMPurify from 'dompurify';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const POST_MAX_CHARS  = 2000;
export const REPLY_MAX_CHARS = 1000;
export const NICK_MAX_CHARS  = 30;
export const RATE_LIMIT_MAX  = 3;
export const RATE_LIMIT_MS   = 5 * 60 * 1000;
export const POSTS_PER_PAGE  = 20;

export const CATEGORIES = ['General', 'Help', 'Tips', 'V-Study', 'ARMS', 'Announcements', 'Funny'];

// ---------------------------------------------------------------------------
// Safety
// ---------------------------------------------------------------------------
export function sanitize(text) {
  if (typeof window === 'undefined') return text;
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

const BLOCKLIST = [
  /\bfuck\b/i, /\bshit\b/i, /\bbitch\b/i, /\basshole\b/i,
  /\bwhore\b/i, /\bslut\b/i, /\bnigger\b/i, /\bfaggot\b/i,
];
export function hasProfanity(text) {
  return BLOCKLIST.some(rx => rx.test(text));
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
const RL_KEY = 'community_posts_rl';
export function canPost() {
  try {
    const raw = localStorage.getItem(RL_KEY);
    const timestamps = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const recent = timestamps.filter(t => now - t < RATE_LIMIT_MS);
    return { allowed: recent.length < RATE_LIMIT_MAX, remaining: RATE_LIMIT_MAX - recent.length };
  } catch { return { allowed: true, remaining: RATE_LIMIT_MAX }; }
}
export function recordPost() {
  try {
    const raw = localStorage.getItem(RL_KEY);
    const timestamps = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const recent = timestamps.filter(t => now - t < RATE_LIMIT_MS);
    recent.push(now);
    localStorage.setItem(RL_KEY, JSON.stringify(recent));
  } catch {}
}

// ---------------------------------------------------------------------------
// Duplicate guard
// ---------------------------------------------------------------------------
const DUP_KEY = 'community_last_hash';
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return String(h);
}
export function isDuplicate(text) {
  try {
    const raw = localStorage.getItem(DUP_KEY);
    if (!raw) return false;
    const { hash, ts } = JSON.parse(raw);
    return hash === simpleHash(text) && Date.now() - ts < 60_000;
  } catch { return false; }
}
export function recordHash(text) {
  try {
    localStorage.setItem(DUP_KEY, JSON.stringify({ hash: simpleHash(text), ts: Date.now() }));
  } catch {}
}

// ---------------------------------------------------------------------------
// Nickname
// ---------------------------------------------------------------------------
const NICK_KEY = 'community_nickname';
const ADJECTIVES = ['Swift', 'Clever', 'Bright', 'Bold', 'Calm', 'Daring', 'Epic', 'Fearless', 'Gentle', 'Happy'];
const NOUNS      = ['Panda', 'Eagle', 'Tiger', 'Fox', 'Wolf', 'Hawk', 'Bear', 'Lynx', 'Orca', 'Deer'];
export function getOrCreateNickname() {
  try {
    const saved = localStorage.getItem(NICK_KEY);
    if (saved) return saved;
    const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num  = Math.floor(Math.random() * 900) + 100;
    const nick = `${adj}${noun}${num}`;
    localStorage.setItem(NICK_KEY, nick);
    return nick;
  } catch { return 'AnonUser'; }
}
export function saveNickname(nick) {
  try { localStorage.setItem(NICK_KEY, nick.trim().slice(0, NICK_MAX_CHARS)); } catch {}
}

// ---------------------------------------------------------------------------
// Avatar color (deterministic from nickname)
// ---------------------------------------------------------------------------
const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-500',
  'from-rose-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
  'from-fuchsia-500 to-purple-500',
];
export function avatarGradient(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

// ---------------------------------------------------------------------------
// Supabase: Posts
// ---------------------------------------------------------------------------
export const community = {
  async getPosts({ category = null, search = '', page = 0, sort = 'latest' } = {}) {
    let q = supabase
      .from('community_posts')
      .select('*')
      .range(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE - 1);

    if (category && category !== 'All') q = q.eq('category', category);
    if (search.trim()) q = q.ilike('content', `%${search.trim()}%`);

    if (sort === 'hot') {
      q = q.order('likes', { ascending: false });
    } else {
      q = q.order('created_at', { ascending: false });
    }
    return q;
  },

  async createPost({ nickname, content, category }) {
    return supabase.from('community_posts').insert([{
      nickname: sanitize(nickname).slice(0, NICK_MAX_CHARS),
      content:  sanitize(content).slice(0, POST_MAX_CHARS),
      category,
      likes: 0,
      hearts: 0,
      fires: 0,
      reply_count: 0,
    }]).select().single();
  },

  async deletePost(postId) {
    return supabase.from('community_posts').delete().eq('id', postId);
  },

  async react(postId, field) {
    return supabase.rpc('increment_reaction', { post_id: postId, field_name: field });
  },

  // ─── Replies ───────────────────────────────────────────────────────────
  async getReplies(postId) {
    return supabase
      .from('community_replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
  },

  async createReply({ postId, parentId, nickname, content }) {
    const { data, error } = await supabase.from('community_replies').insert([{
      post_id:   postId,
      parent_id: parentId || null,
      nickname:  sanitize(nickname).slice(0, NICK_MAX_CHARS),
      content:   sanitize(content).slice(0, REPLY_MAX_CHARS),
      likes:     0,
    }]).select().single();

    // Increment the reply_count on the parent post
    if (!error) {
      await supabase.rpc('increment_reply_count', { post_id: postId });
    }
    return { data, error };
  },

  async likeReply(replyId) {
    return supabase.rpc('increment_reply_like', { reply_id: replyId });
  },

  subscribeToNew(callback) {
    return supabase.channel('community_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, callback)
      .subscribe();
  },
};
