// Community service — uses Supabase when configured, localStorage otherwise
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_KEY);
const supabase = USE_SUPABASE ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const STORAGE_KEY = 'buildit-community';

const SEED_POSTS = [
  { id: 'seed-1', studentName: 'Maya R.', projectTitle: 'Soccer-Powered Catapult', category: 'engineering', caption: 'Mine launched a paper ball over 2 meters! Adjusting the rubber band tension was the key 🎯 Took 3 tries to get it right.', photo: null, likes: 23, likedBy: [], createdAt: Date.now() - 2 * 86400000 },
  { id: 'seed-2', studentName: 'Carlos M.', projectTitle: 'Mini Solar Oven', category: 'science', caption: 'Melted chocolate in under 20 minutes using only sunlight and foil! My mom was so surprised 🌞', photo: null, likes: 41, likedBy: [], createdAt: Date.now() - 5 * 86400000 },
  { id: 'seed-3', studentName: 'Priya K.', projectTitle: 'Cardboard Robo-Hand', category: 'engineering', caption: 'My robo-hand can pick up a juice box! Used fishing line instead of string — way stronger 💪', photo: null, likes: 67, likedBy: [], createdAt: Date.now() - 86400000 },
  { id: 'seed-4', studentName: 'Jordan L.', projectTitle: 'Music Visualizer LEDs', category: 'technology', caption: 'Connected an Arduino to LEDs that pulse with music. Took 2 weekends but TOTALLY worth it 🎵', photo: null, likes: 89, likedBy: [], createdAt: Date.now() - 3 * 86400000 },
  { id: 'seed-5', studentName: 'Aisha T.', projectTitle: 'Plant Growth Tracker', category: 'science', caption: 'My bean plant grew 3cm in one week! Made a graph comparing window vs shade plants. Science!! 🌱', photo: null, likes: 34, likedBy: [], createdAt: Date.now() - 7 * 86400000 },
  { id: 'seed-6', studentName: 'Finn O.', projectTitle: 'Marble Run Math Machine', category: 'math', caption: 'Made a machine that counts marbles using gravity — can track up to 99! My teacher loved it 🔢', photo: null, likes: 28, likedBy: [], createdAt: Date.now() - 4 * 86400000 },
];

function loadLocal() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    // first load — seed with example posts
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
    return SEED_POSTS;
  } catch { return SEED_POSTS; }
}

function saveLocal(posts) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); } catch {}
}

export async function fetchPosts(category = 'all') {
  if (USE_SUPABASE) {
    let query = supabase
      .from('community_posts')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (category !== 'all') query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    return data.map(p => ({
      id: p.id,
      studentName: p.student_name,
      projectTitle: p.project_title,
      category: p.category,
      caption: p.caption,
      photo: p.photo_url,
      likes: p.likes,
      likedBy: [],
      createdAt: new Date(p.created_at).getTime(),
    }));
  }

  const posts = loadLocal();
  if (category === 'all') return [...posts].sort((a, b) => b.createdAt - a.createdAt);
  return posts.filter(p => p.category === category).sort((a, b) => b.createdAt - a.createdAt);
}

export async function createPost({ studentName, projectTitle, category, caption, photo }) {
  if (USE_SUPABASE) {
    let photoUrl = null;
    if (photo) {
      const filename = `${Date.now()}.jpg`;
      const blob = await (await fetch(`data:image/jpeg;base64,${photo}`)).blob();
      const { data: upload, error: uploadErr } = await supabase.storage
        .from('community-photos')
        .upload(filename, blob, { contentType: 'image/jpeg' });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('community-photos').getPublicUrl(filename);
        photoUrl = urlData.publicUrl;
      }
    }
    const { data, error } = await supabase.from('community_posts').insert({
      student_name: studentName,
      project_title: projectTitle,
      category,
      caption,
      photo_url: photoUrl,
      likes: 0,
      approved: true,
    }).select().single();
    if (error) throw error;
    return data;
  }

  const posts = loadLocal();
  const newPost = {
    id: `post-${Date.now()}`,
    studentName,
    projectTitle,
    category,
    caption,
    photo: photo ? `data:image/jpeg;base64,${photo}` : null,
    likes: 0,
    likedBy: [],
    createdAt: Date.now(),
  };
  saveLocal([newPost, ...posts]);
  return newPost;
}

export async function toggleLike(postId, sessionId) {
  if (USE_SUPABASE) {
    const { data: post } = await supabase.from('community_posts').select('likes').eq('id', postId).single();
    await supabase.from('community_posts').update({ likes: (post?.likes || 0) + 1 }).eq('id', postId);
    return;
  }

  const posts = loadLocal();
  const updated = posts.map(p => {
    if (p.id !== postId) return p;
    const alreadyLiked = p.likedBy?.includes(sessionId);
    return {
      ...p,
      likes: alreadyLiked ? p.likes - 1 : p.likes + 1,
      likedBy: alreadyLiked
        ? p.likedBy.filter(id => id !== sessionId)
        : [...(p.likedBy || []), sessionId],
    };
  });
  saveLocal(updated);
  return updated.find(p => p.id === postId);
}
