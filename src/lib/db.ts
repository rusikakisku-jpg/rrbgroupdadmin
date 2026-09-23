import fs from 'fs';
import path from 'path';
import { Post, Setting, SubscriberItem } from './types';

// Shared database JSON location candidate paths
function getDataFilePath(): string {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'data', 'db.json'),
    path.join(process.cwd(), '..', 'rrbgroupdanswerkey', 'src', 'data', 'db.json'),
    path.join(process.cwd(), '..', 'testrrbgroupdanswerkey', 'src', 'data', 'db.json'),
    path.join(process.cwd(), '..', 'rrb-nextjs', 'src', 'data', 'db.json'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return path.join(process.cwd(), 'src', 'data', 'db.json');
}

interface DbSchema {
  posts: Post[];
  settings: Setting[];
  users: any[];
  comments: any[];
  subscribers: any[];
}

function readDb(): DbSchema {
  try {
    const targetPath = getDataFilePath();
    if (!fs.existsSync(targetPath)) {
      return { posts: [], settings: [], users: [], comments: [], subscribers: [] };
    }
    const jsonText = fs.readFileSync(targetPath, 'utf-8');
    return JSON.parse(jsonText);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { posts: [], settings: [], users: [], comments: [], subscribers: [] };
  }
}

function writeDb(data: DbSchema): boolean {
  try {
    const targetPath = getDataFilePath();
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

export function getAllPostsAdmin(): Post[] {
  const db = readDb();
  return db.posts.sort((a, b) => b.id - a.id);
}

export function savePost(data: Partial<Post>): boolean {
  const db = readDb();
  if (data.id) {
    const idx = db.posts.findIndex((p) => p.id === data.id);
    if (idx !== -1) {
      db.posts[idx] = { ...db.posts[idx], ...data } as Post;
    }
  } else {
    const newPost: Post = {
      id: Date.now(),
      title: data.title || '',
      slug: data.slug || '',
      cover_image: data.cover_image || '',
      content: data.content || '',
      excerpt: data.excerpt || '',
      category: data.category || 'General',
      status: data.status || 'publish',
      views: 0,
      created_at: data.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
      tags: data.tags || '',
      author_name: data.author_name || 'Admin',
    };
    db.posts.unshift(newPost);
  }
  return writeDb(db);
}

export function deletePost(id: number): boolean {
  const db = readDb();
  db.posts = db.posts.filter((p) => p.id !== id);
  return writeDb(db);
}

export function getSettings(): Record<string, string> {
  const db = readDb();
  const settings: Record<string, string> = {};
  db.settings.forEach((r) => {
    settings[r.setting_key] = r.setting_value;
  });
  return settings;
}

export function getSubscribers(): SubscriberItem[] {
  const db = readDb();
  return Array.isArray(db.subscribers) ? db.subscribers : [];
}

export function deleteSubscriber(id: number): boolean {
  const db = readDb();
  if (Array.isArray(db.subscribers)) {
    db.subscribers = db.subscribers.filter((s) => s.id !== id);
    return writeDb(db);
  }
  return false;
}

export function addSubscriber(email: string): boolean {
  const db = readDb();
  if (!Array.isArray(db.subscribers)) {
    db.subscribers = [];
  }
  const cleanEmail = email.trim().toLowerCase();
  const exists = db.subscribers.some((s) => s.email?.toLowerCase() === cleanEmail);
  if (exists) return true;
  const newSub: SubscriberItem = {
    id: Date.now(),
    email: cleanEmail,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  db.subscribers.unshift(newSub);
  return writeDb(db);
}
