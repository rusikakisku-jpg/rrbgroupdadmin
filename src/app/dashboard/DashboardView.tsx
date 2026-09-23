'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Post, MenuItem, CommentItem, SubscriberItem } from '@/lib/types';
import {
  ShieldCheck,
  KeyRound,
  LayoutGrid,
  FileText,
  PlusCircle,
  Tags,
  Menu as MenuIcon,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Globe,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  ArrowUp,
  ArrowDown,
  Search,
  ExternalLink,
  X,
  Upload,
  Link2,
  Image as ImageIcon,
  Code,
  Edit,
  ZoomIn,
  Copy,
  Check,
  Calendar,
  RotateCcw,
  ArrowLeft,
  FolderOpen,
  Navigation,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const TinyEditor = dynamic(
  () => import('@tinymce/tinymce-react').then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: '320px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        Loading TinyMCE Editor...
      </div>
    ),
  }
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://rrbgroupdanswerkey.rusikakisku.workers.dev';

export type TabType = 'dashboard' | 'list' | 'add' | 'edit' | 'categories' | 'menu' | 'comments' | 'subscribers' | 'settings';

interface DashboardViewProps {
  initialTab?: TabType;
}

export default function DashboardView({ initialTab = 'dashboard' }: DashboardViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [loading, setLoading] = useState(true);
  const [successAlert, setSuccessAlert] = useState('');
  const [errorAlert, setErrorAlert] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'publish' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Pagination states for Articles List
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Auto-reset page to 1 when search query, filter, or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, itemsPerPage]);

  // Image Preview Lightbox state
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; slug?: string; category?: string } | null>(null);
  const [copiedImageLink, setCopiedImageLink] = useState(false);

  // Post Editor state
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [category, setCategory] = useState('Notification');
  const [status, setStatus] = useState<'publish' | 'draft'>('publish');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageMode, setCoverImageMode] = useState<'url' | 'upload'>('url');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [authorName, setAuthorName] = useState('Admin');
  const [isRawHtmlMode, setIsRawHtmlMode] = useState(false);

  // SEO-friendly and unique slug generator
  const generateSeoSlug = (rawTitle: string, currentId: number | null = editId, allPosts: Post[] = posts): string => {
    if (!rawTitle) return '';
    const cleanSlug = rawTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) return 'article-' + Date.now();

    let uniqueSlug = cleanSlug;
    let counter = 2;
    while (allPosts.some((p) => p.id !== currentId && p.slug === uniqueSlug)) {
      uniqueSlug = `${cleanSlug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  };

  // Categories & Menu Parsed
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [hiddenCategoriesList, setHiddenCategoriesList] = useState<string[]>([]);
  const [menuList, setMenuList] = useState<MenuItem[]>([]);

  // Modals state
  const [showCatModal, setShowCatModal] = useState(false);
  const [catModalMode, setCatModalMode] = useState<'add' | 'edit'>('add');
  const [catInputName, setCatInputName] = useState('');
  const [catOriginalName, setCatOriginalName] = useState('');

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuModalMode, setMenuModalMode] = useState<'add' | 'edit'>('add');
  const [menuInputTitle, setMenuInputTitle] = useState('');
  const [menuInputUrl, setMenuInputUrl] = useState('');
  const [menuEditIndex, setMenuEditIndex] = useState<number | null>(null);

  // Search & Filter States for Categories & Menu Tabs
  const [catSearch, setCatSearch] = useState('');
  const [catStatusFilter, setCatStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [settingsSectionTab, setSettingsSectionTab] = useState<'all' | 'general' | 'seo' | 'ads' | 'integrations' | 'robots'>('all');

  // Settings form states
  const [siteTitleVal, setSiteTitleVal] = useState('RRB Group D Answer Key');
  const [siteTaglineVal, setSiteTaglineVal] = useState('Notification,Answer key,Result');
  const [siteDescVal, setSiteDescVal] = useState('Official Railway Recruitment Board RRB Group D Answer Key Updates 2026.');
  const [defaultMetaDescVal, setDefaultMetaDescVal] = useState('');
  const [siteLogoVal, setSiteLogoVal] = useState('');
  const [siteFaviconVal, setSiteFaviconVal] = useState('');
  const [adsStatusVal, setAdsStatusVal] = useState('0');
  const [adHeaderVal, setAdHeaderVal] = useState('');
  const [adTopVal, setAdTopVal] = useState('');
  const [adBottomVal, setAdBottomVal] = useState('');
  const [adSidebarVal, setAdSidebarVal] = useState('');
  const [tinymceApiKeyVal, setTinymceApiKeyVal] = useState('');
  const [gscVal, setGscVal] = useState('');
  const [gaVal, setGaVal] = useState('');
  const [oneSignalAppIdVal, setOneSignalAppIdVal] = useState('');
  const [oneSignalApiKeyVal, setOneSignalApiKeyVal] = useState('');
  const [robotsTxtVal, setRobotsTxtVal] = useState('User-agent: *\nAllow: /');

  // Sync tab with initialTab prop
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Client Authentication Guard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('admin_logged_in');
      if (!isAuth) {
        router.push('/');
      }
    }
  }, [router]);

  // Close image preview lightbox on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewImage) {
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  // Load All Data
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Posts
      try {
        const postsRes = await fetch(`${API_BASE}/api/posts?status=all`, { cache: 'no-store' });
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(Array.isArray(postsData) ? postsData : []);
        } else {
          setPosts([]);
        }
      } catch (_) {
        setPosts([]);
      }

      // 2. Fetch Settings
      try {
        const settingsRes = await fetch(`${API_BASE}/api/settings`, { cache: 'no-store' });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData && typeof settingsData === 'object') {
            setSettingsMap(settingsData);

            if (settingsData.site_title) setSiteTitleVal(settingsData.site_title);
            if (settingsData.site_tagline) setSiteTaglineVal(settingsData.site_tagline);
            if (settingsData.site_description) setSiteDescVal(settingsData.site_description);
            if (settingsData.default_meta_description) setDefaultMetaDescVal(settingsData.default_meta_description);
            if (settingsData.site_logo) setSiteLogoVal(settingsData.site_logo);
            if (settingsData.site_favicon) setSiteFaviconVal(settingsData.site_favicon);
            if (settingsData.ads_status !== undefined) setAdsStatusVal(settingsData.ads_status);
            if (settingsData.google_adsense_header) setAdHeaderVal(settingsData.google_adsense_header);
            if (settingsData.google_adsense_top) setAdTopVal(settingsData.google_adsense_top);
            if (settingsData.google_adsense_bottom) setAdBottomVal(settingsData.google_adsense_bottom);
            if (settingsData.google_adsense_sidebar) setAdSidebarVal(settingsData.google_adsense_sidebar);
            if (settingsData.tinymce_api_key) setTinymceApiKeyVal(settingsData.tinymce_api_key);
            if (settingsData.google_search_console) setGscVal(settingsData.google_search_console);
            if (settingsData.google_analytics) setGaVal(settingsData.google_analytics);
            if (settingsData.onesignal_app_id) setOneSignalAppIdVal(settingsData.onesignal_app_id);
            if (settingsData.onesignal_api_key) setOneSignalApiKeyVal(settingsData.onesignal_api_key);
            if (settingsData.robots_txt) setRobotsTxtVal(settingsData.robots_txt);

            // Parse Categories
            const catsRaw = settingsData.site_categories || 'Notification, Answer Key, Admit Card, Result, Syllabus';
            const catsArr = catsRaw.split(',').map((c: string) => c.trim()).filter(Boolean);
            setCategoriesList(catsArr);

            const hiddenCatsRaw = settingsData.hidden_categories || '';
            const hiddenCatsArr = hiddenCatsRaw.split(',').map((c: string) => c.trim()).filter(Boolean);
            setHiddenCategoriesList(hiddenCatsArr);

            // Parse Menu
            try {
              if (settingsData.site_menu) {
                setMenuList(JSON.parse(settingsData.site_menu));
              } else {
                setMenuList([
                  { title: 'Home', url: '/', visible: 1 },
                  { title: 'Notification', url: '/notification/', visible: 1 },
                  { title: 'Answer Key', url: '/answer-key/', visible: 0 },
                  { title: 'Admit Card', url: '/admit-card/', visible: 0 },
                  { title: 'Result', url: '/result/', visible: 0 },
                  { title: 'Syllabus', url: '/syllabus/', visible: 1 },
                ]);
              }
            } catch (_) {}
          }
        }
      } catch (_) {}

      // 3. Fetch Comments
      try {
        const commentsRes = await fetch(`${API_BASE}/api/comments`, { cache: 'no-store' });
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(Array.isArray(commentsData) ? commentsData : []);
        } else {
          setComments([]);
        }
      } catch (_) {
        setComments([]);
      }

      // 4. Fetch Subscribers
      try {
        const subRes = await fetch(`${API_BASE}/api/subscribers`, { cache: 'no-store' });
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscribers(Array.isArray(subData) ? subData : []);
        } else {
          setSubscribers([]);
        }
      } catch (_) {
        setSubscribers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setEditId(null);
    setActiveTab(tab);
    setMobileMenuOpen(false);
    const targetUrl = tab === 'dashboard' ? '/dashboard/' : `/dashboard/${tab}/`;
    if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
      window.history.pushState({ tab }, '', targetUrl);
    }
  };

  // Listen to browser Back/Forward navigation for instant silent tab switching
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.replace(/\/+$/, '');
        const parts = path.split('/');
        const currentTab = parts[parts.length - 1];
        const validTabs: TabType[] = ['dashboard', 'list', 'add', 'edit', 'categories', 'menu', 'comments', 'subscribers', 'settings'];
        if (validTabs.includes(currentTab as TabType)) {
          setEditId(null);
          setActiveTab(currentTab as TabType);
          setMobileMenuOpen(false);
        } else if (path === '/dashboard' || path === '') {
          setEditId(null);
          setActiveTab('dashboard');
          setMobileMenuOpen(false);
        }

        const isEditRoute = window.location.pathname.includes('/edit');
        const params = new URLSearchParams(window.location.search);
        const paramId = params.get('id');
        if (isEditRoute && paramId && posts.length > 0) {
          const targetPost = posts.find((p) => String(p.id) === String(paramId));
          if (targetPost) {
            setEditId(targetPost.id);
            setTitle(targetPost.title);
            setSlug(targetPost.slug);
            setCategory(targetPost.category);
            setStatus(targetPost.status);
            setCoverImage(targetPost.cover_image || '');
            setCoverImageMode(targetPost.cover_image?.startsWith('data:') ? 'upload' : 'url');
            setExcerpt(targetPost.excerpt || '');
            setContent(targetPost.content || '');
            setTags(targetPost.tags || '');
            setAuthorName(targetPost.author_name || 'Admin');
            setActiveTab('edit');
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [posts]);

  useEffect(() => {
    loadData();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessAlert(msg);
    setTimeout(() => setSuccessAlert(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorAlert(msg);
    setTimeout(() => setErrorAlert(''), 4000);
  };

  useEffect(() => {
    if (posts.length > 0 && typeof window !== 'undefined') {
      const isEditRoute = window.location.pathname.includes('/edit');
      const params = new URLSearchParams(window.location.search);
      const paramId = params.get('id');
      if (isEditRoute && paramId) {
        const targetPost = posts.find((p) => String(p.id) === String(paramId));
        if (targetPost) {
          setEditId(targetPost.id);
          setTitle(targetPost.title);
          setSlug(targetPost.slug);
          setCategory(targetPost.category);
          setStatus(targetPost.status);
          setCoverImage(targetPost.cover_image || '');
          setCoverImageMode(targetPost.cover_image?.startsWith('data:') ? 'upload' : 'url');
          setExcerpt(targetPost.excerpt || '');
          setContent(targetPost.content || '');
          setTags(targetPost.tags || '');
          setAuthorName(targetPost.author_name || 'Admin');
          setActiveTab('edit');
        }
      }
    }
  }, [posts]);

  // --- POST ACTIONS ---
  const handleOpenAddForm = () => {
    setEditId(null);
    setTitle('');
    setSlug('');
    setIsSlugManuallyEdited(false);
    setCategory(categoriesList[0] || 'Notification');
    setStatus('publish');
    setCoverImage('');
    setCoverImageMode('url');
    setExcerpt('');
    setContent('');
    setTags('');
    setAuthorName('Admin');
    setIsRawHtmlMode(false);
    setActiveTab('add');
    setMobileMenuOpen(false);
    const targetUrl = '/dashboard/add/';
    if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
      window.history.pushState({ tab: 'add' }, '', targetUrl);
    }
  };

  const handleEditPost = (p: Post) => {
    setEditId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setIsSlugManuallyEdited(true);
    setCategory(p.category);
    setStatus(p.status);
    setCoverImage(p.cover_image || '');
    setCoverImageMode(p.cover_image?.startsWith('data:') ? 'upload' : 'url');
    setExcerpt(p.excerpt || '');
    setContent(p.content || '');
    setTags(p.tags || '');
    setAuthorName(p.author_name || 'Admin');
    setIsRawHtmlMode(false);
    setActiveTab('edit');
    setMobileMenuOpen(false);
    const targetUrl = `/dashboard/edit/?id=${p.id}`;
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab: 'edit', id: p.id }, '', targetUrl);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError('Image size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      // Auto-compress & convert to modern WebP format
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        const maxWidth = 1200;
        const maxHeight = 800;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const compressedWebp = canvas.toDataURL('image/webp', 0.82);
            setCoverImage(compressedWebp);
            showSuccess('Image automatically compressed to WebP!');
            return;
          } catch (_) {
            // fallback if canvas toDataURL fails
          }
        }
        setCoverImage(rawDataUrl);
        showSuccess('Image selected & loaded for cover!');
      };
      img.onerror = () => {
        setCoverImage(rawDataUrl);
        showSuccess('Image selected & loaded for cover!');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showError('Title and Content are required!');
      return;
    }

    // 1. Generate guaranteed unique & SEO-friendly slug
    let rawSlug = slug.trim()
      ? slug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
      : generateSeoSlug(title, editId, posts);

    if (!rawSlug) rawSlug = 'article-' + Date.now();

    let uniqueFinalSlug = rawSlug;
    let counter = 2;
    while (posts.some((p) => p.id !== editId && p.slug === uniqueFinalSlug)) {
      uniqueFinalSlug = `${rawSlug}-${counter}`;
      counter++;
    }

    // 2. SEO Fallbacks: Excerpt falls back to first 160 clean chars of content if empty
    const cleanContentText = content.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    const finalExcerpt = excerpt.trim() || cleanContentText.slice(0, 160);

    try {
      const res = await fetch(`${API_BASE}/api/admin/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editId || undefined,
          title: title.trim(),
          slug: uniqueFinalSlug,
          category,
          status,
          cover_image: coverImage.trim(),
          excerpt: finalExcerpt,
          content,
          tags: tags.trim(),
          author_name: authorName.trim() || 'Admin',
        }),
      });

      if (res.ok) {
        showSuccess(editId ? 'Post updated successfully!' : 'Post created successfully!');
        loadData();
        handleTabChange('list');
      } else {
        showError('Failed to save post.');
      }
    } catch (_) {
      showError('Error saving post.');
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      if (res.ok) {
        showSuccess('Post deleted successfully!');
        loadData();
      }
    } catch (_) {
      showError('Error deleting post.');
    }
  };

  // --- CATEGORIES ACTIONS ---
  const saveCategoriesToSettings = async (newCats: string[], newHidden: string[]) => {
    const catsStr = newCats.join(', ');
    const hiddenStr = newHidden.join(', ');
    try {
      await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_categories: catsStr,
          hidden_categories: hiddenStr,
        }),
      });
      setCategoriesList(newCats);
      setHiddenCategoriesList(newHidden);
      showSuccess('Categories updated successfully!');
    } catch (_) {
      showError('Failed to update categories.');
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = catInputName.trim();
    if (!name) return;
    if (categoriesList.some((c) => c.toLowerCase() === name.toLowerCase())) {
      showError('Category already exists!');
      return;
    }
    const updated = [...categoriesList, name];
    saveCategoriesToSettings(updated, hiddenCategoriesList);
    setShowCatModal(false);
  };

  const handleEditCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newName = catInputName.trim();
    if (!newName) return;
    const updated = categoriesList.map((c) => (c.toLowerCase() === catOriginalName.toLowerCase() ? newName : c));
    const updatedHidden = hiddenCategoriesList.map((c) => (c.toLowerCase() === catOriginalName.toLowerCase() ? newName : c));
    saveCategoriesToSettings(updated, updatedHidden);
    setShowCatModal(false);
  };

  const handleToggleCategoryVisibility = (catName: string) => {
    const isHidden = hiddenCategoriesList.some((c) => c.toLowerCase() === catName.toLowerCase());
    let updatedHidden: string[];
    if (isHidden) {
      updatedHidden = hiddenCategoriesList.filter((c) => c.toLowerCase() !== catName.toLowerCase());
    } else {
      updatedHidden = [...hiddenCategoriesList, catName];
    }
    saveCategoriesToSettings(categoriesList, updatedHidden);
  };

  const handleDeleteCategory = (catName: string) => {
    if (!confirm(`Are you sure you want to delete category '${catName}'?`)) return;
    const updatedCats = categoriesList.filter((c) => c.toLowerCase() !== catName.toLowerCase());
    const updatedHidden = hiddenCategoriesList.filter((c) => c.toLowerCase() !== catName.toLowerCase());
    saveCategoriesToSettings(updatedCats, updatedHidden);
  };

  // --- MENU ACTIONS ---
  const saveMenuToSettings = async (newMenu: MenuItem[]) => {
    try {
      await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_menu: JSON.stringify(newMenu),
        }),
      });
      setMenuList(newMenu);
      showSuccess('Menu items updated successfully!');
    } catch (_) {
      showError('Failed to update menu.');
    }
  };

  const handleAddMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuInputTitle.trim() || !menuInputUrl.trim()) return;
    const newItem: MenuItem = {
      title: menuInputTitle.trim(),
      url: menuInputUrl.trim(),
      visible: 1,
    };
    saveMenuToSettings([...menuList, newItem]);
    setShowMenuModal(false);
  };

  const handleEditMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (menuEditIndex === null || !menuInputTitle.trim() || !menuInputUrl.trim()) return;
    const updated = [...menuList];
    updated[menuEditIndex] = {
      ...updated[menuEditIndex],
      title: menuInputTitle.trim(),
      url: menuInputUrl.trim(),
    };
    saveMenuToSettings(updated);
    setShowMenuModal(false);
  };

  const handleToggleMenuVisibility = (idx: number) => {
    const updated = [...menuList];
    updated[idx].visible = updated[idx].visible === 1 ? 0 : 1;
    saveMenuToSettings(updated);
  };

  const handleMoveMenu = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= menuList.length) return;
    const updated = [...menuList];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    saveMenuToSettings(updated);
  };

  const handleDeleteMenuItem = (idx: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    const updated = menuList.filter((_, i) => i !== idx);
    saveMenuToSettings(updated);
  };

  // --- SETTINGS SUBMIT ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_title: siteTitleVal,
          site_tagline: siteTaglineVal,
          site_description: siteDescVal,
          default_meta_description: defaultMetaDescVal,
          site_logo: siteLogoVal,
          site_favicon: siteFaviconVal,
          ads_status: adsStatusVal,
          google_adsense_header: adHeaderVal,
          google_adsense_top: adTopVal,
          google_adsense_bottom: adBottomVal,
          google_adsense_sidebar: adSidebarVal,
          tinymce_api_key: tinymceApiKeyVal,
          google_search_console: gscVal,
          google_analytics: gaVal,
          onesignal_app_id: oneSignalAppIdVal,
          onesignal_api_key: oneSignalApiKeyVal,
          robots_txt: robotsTxtVal,
        }),
      });

      if (res.ok) {
        showSuccess('Website settings saved successfully!');
      } else {
        showError('Failed to save settings.');
      }
    } catch (_) {
      showError('Error saving settings.');
    }
  };

  // Calculated Stats
  const totalPosts = Array.isArray(posts) ? posts.length : 0;
  const publishedPosts = Array.isArray(posts) ? posts.filter((p) => p.status === 'publish').length : 0;
  const draftPosts = Array.isArray(posts) ? posts.filter((p) => p.status === 'draft').length : 0;
  const totalViews = Array.isArray(posts) ? posts.reduce((sum, p) => sum + (p.views || 0), 0) : 0;
  const totalSubscribers = Array.isArray(subscribers) ? subscribers.length : 0;
  const totalComments = Array.isArray(comments) ? comments.length : 0;

  // Filtered Posts
  const filteredPosts = Array.isArray(posts)
    ? posts.filter((p) => {
        const matchesSearch =
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
      })
    : [];

  // Pagination calculations for Articles Manager
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredPosts.length);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  const getPaginationRange = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, '...', total];
    }
    if (current >= total - 2) {
      return [1, '...', total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <KeyRound style={{ width: '26px', height: '26px', color: '#38bdf8' }} />
            <span>RRB Admin</span>
          </div>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <ul className="sidebar-menu">
          <li>
            <button
              className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleTabChange('dashboard')}
            >
              <LayoutGrid style={{ width: '18px', height: '18px' }} />
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-link ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => handleTabChange('list')}
            >
              <FileText style={{ width: '18px', height: '18px' }} />
              <span>All Articles</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-link ${activeTab === 'add' ? 'active' : ''}`}
              onClick={handleOpenAddForm}
            >
              <PlusCircle style={{ width: '18px', height: '18px' }} />
              <span>Add New Article</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-link ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => handleTabChange('categories')}
            >
              <Tags style={{ width: '18px', height: '18px' }} />
              <span>Categories</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-link ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => handleTabChange('menu')}
            >
              <MenuIcon style={{ width: '18px', height: '18px' }} />
              <span>Header Menu</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-link ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => handleTabChange('comments')}
            >
              <MessageSquare style={{ width: '18px', height: '18px' }} />
              <span>Comments ({totalComments})</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-link ${activeTab === 'subscribers' ? 'active' : ''}`}
              onClick={() => handleTabChange('subscribers')}
            >
              <Users style={{ width: '18px', height: '18px' }} />
              <span>Subscribers ({totalSubscribers})</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              <Settings style={{ width: '18px', height: '18px' }} />
              <span>Settings</span>
            </button>
          </li>
        </ul>

        {/* SIDEBAR FOOTER ACTIONS (View Live Website & Logout) */}
        <div className="sidebar-footer-actions">
          <a
            href="https://rrbgroupdanswerkey.pages.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-action-btn view-site-btn"
          >
            <Globe style={{ width: '16px', height: '16px' }} />
            <span>View Live Website</span>
          </a>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('admin_logged_in');
                sessionStorage.removeItem('admin_token');
              }
              router.push('/');
            }}
            className="sidebar-action-btn logout-btn"
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BACKDROP */}
      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="admin-main">
        {/* HEADER BAR */}
        <div className="admin-header">
          <div className="admin-header-title-wrap">
            <button
              type="button"
              className="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <MenuIcon style={{ width: '22px', height: '22px' }} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', margin: 0 }}>
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'list' && 'Articles Manager'}
                {activeTab === 'add' && 'Create New Article'}
                {activeTab === 'edit' && 'Edit Article'}
                {activeTab === 'categories' && 'Categories Management'}
                {activeTab === 'menu' && 'Header Menu Management'}
                {activeTab === 'comments' && 'Comments Moderation'}
                {activeTab === 'subscribers' && 'Subscribers List'}
                {activeTab === 'settings' && 'Website Settings'}
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Manage your Railway Recruitment Board portal content & configuration
              </p>
            </div>
          </div>

          <div className="admin-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <a
              href="https://rrbgroupdanswerkey.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <Globe style={{ width: '16px', height: '16px' }} /> <span className="btn-label-text">View Live Website</span>
            </a>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('admin_logged_in');
                  sessionStorage.removeItem('admin_token');
                }
                router.push('/');
              }}
              className="btn"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} /> <span className="btn-label-text">Logout</span>
            </button>
          </div>
        </div>

        {/* FLOATING TOAST NOTIFICATIONS */}
        <div className="toast-container">
          {successAlert && (
            <div className="toast-item toast-success">
              <CheckCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
              <span>{successAlert}</span>
              <button className="toast-close" onClick={() => setSuccessAlert('')} aria-label="Close notification">
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          )}
          {errorAlert && (
            <div className="toast-item toast-error">
              <AlertCircle style={{ width: '20px', height: '20px', flexShrink: 0 }} />
              <span>{errorAlert}</span>
              <button className="toast-close" onClick={() => setErrorAlert('')} aria-label="Close notification">
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          )}
        </div>

        <div className="admin-body">
          {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <FileText style={{ width: '24px', height: '24px' }} />
                </div>
                <div>
                  <div className="stat-number">{totalPosts}</div>
                  <div className="stat-label">Total Articles</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <Globe style={{ width: '24px', height: '24px' }} />
                </div>
                <div>
                  <div className="stat-number">{publishedPosts}</div>
                  <div className="stat-label">Published Articles</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <Eye style={{ width: '24px', height: '24px' }} />
                </div>
                <div>
                  <div className="stat-number">{totalViews.toLocaleString()}</div>
                  <div className="stat-label">Article Views</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  <Users style={{ width: '24px', height: '24px' }} />
                </div>
                <div>
                  <div className="stat-number">{totalSubscribers}</div>
                  <div className="stat-label">Subscribers</div>
                </div>
              </div>
            </div>

            {/* Recent Articles Card */}
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'white', margin: 0, fontWeight: 700 }}>Recent Articles</h3>
                <button className="btn btn-secondary" onClick={() => handleTabChange('list')} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                  View All →
                </button>
              </div>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600, color: 'white' }}>{p.title}</td>
                        <td><span style={{ background: '#0f172a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>{p.category}</span></td>
                        <td>
                          <span className={`status-badge ${p.status}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn-icon btn-edit" onClick={() => handleEditPost(p)}>
                            <Edit3 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: ALL ARTICLES LIST (PREMIUM PROFESSIONAL UI) */}
        {activeTab === 'list' && (
          <div className="articles-manager-container">
            {/* Quick Metrics & Status Filter Strip */}
            <div className="articles-metrics-strip">
              <button
                type="button"
                className={`metric-pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <span className="metric-pill-indicator all" />
                <span className="metric-pill-label">All Articles</span>
                <span className="metric-pill-badge">{posts.length}</span>
              </button>

              <button
                type="button"
                className={`metric-pill-btn ${statusFilter === 'publish' ? 'active' : ''}`}
                onClick={() => setStatusFilter('publish')}
              >
                <span className="metric-pill-indicator published" />
                <span className="metric-pill-label">Published</span>
                <span className="metric-pill-badge">{publishedPosts}</span>
              </button>

              <button
                type="button"
                className={`metric-pill-btn ${statusFilter === 'draft' ? 'active' : ''}`}
                onClick={() => setStatusFilter('draft')}
              >
                <span className="metric-pill-indicator draft" />
                <span className="metric-pill-label">Drafts</span>
                <span className="metric-pill-badge">{draftPosts}</span>
              </button>

              <div className="metric-pill-stat">
                <Eye style={{ width: '14px', height: '14px', color: '#38bdf8' }} />
                <span className="metric-pill-label">Total Views</span>
                <span className="metric-pill-value">{totalViews.toLocaleString()}</span>
              </div>
            </div>

            {/* Main Articles Card */}
            <div className="admin-card articles-card">
              {/* Filter & Action Toolbar */}
              <div className="articles-toolbar">
                <div className="articles-toolbar-left">
                  {/* Search Box */}
                  <div className="articles-search-box">
                    <Search className="search-icon" />
                    <input
                      type="text"
                      className="articles-search-input"
                      placeholder="Search articles by title or slug..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="articles-search-clear"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search query"
                      >
                        <X style={{ width: '14px', height: '14px' }} />
                      </button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="articles-select-wrapper">
                    <select
                      className="articles-select"
                      value={statusFilter}
                      onChange={(e: any) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status ({posts.length})</option>
                      <option value="publish">Published ({publishedPosts})</option>
                      <option value="draft">Draft ({draftPosts})</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div className="articles-select-wrapper">
                    <select
                      className="articles-select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="all">All Categories ({categoriesList.length})</option>
                      {categoriesList.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Reset Filters button */}
                  {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                    <button
                      type="button"
                      className="articles-reset-btn"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setCategoryFilter('all');
                      }}
                      title="Reset all filters"
                    >
                      <RotateCcw style={{ width: '14px', height: '14px' }} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="articles-toolbar-right">
                  <button className="btn btn-primary add-article-gradient-btn" onClick={handleOpenAddForm}>
                    <PlusCircle style={{ width: '18px', height: '18px' }} />
                    <span>Create Article</span>
                  </button>
                </div>
              </div>

              {/* Active Filter Helper Feedback */}
              {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <div className="articles-active-filters-info">
                  <span>
                    Showing <strong>{filteredPosts.length}</strong> of {posts.length} articles
                  </span>
                  {searchQuery && <span className="filter-tag">Search: &quot;{searchQuery}&quot;</span>}
                  {statusFilter !== 'all' && <span className="filter-tag">Status: {statusFilter}</span>}
                  {categoryFilter !== 'all' && <span className="filter-tag">Category: {categoryFilter}</span>}
                </div>
              )}

              {/* DESKTOP & TABLET: Premium Data Table (> 640px) */}
              <div className="articles-desktop-table-container">
                <table className="admin-table articles-premium-table">
                  <thead>
                    <tr>
                      <th style={{ width: '90px' }}>Cover</th>
                      <th>Article Details</th>
                      <th style={{ width: '150px' }}>Category</th>
                      <th style={{ width: '110px' }}>Views</th>
                      <th style={{ width: '120px' }}>Date</th>
                      <th style={{ width: '110px' }}>Status</th>
                      <th style={{ textAlign: 'right', width: '160px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="articles-empty-td">
                          <div className="articles-empty-state">
                            <div className="empty-icon-box">
                              <FileText style={{ width: '32px', height: '32px', color: '#64748b' }} />
                            </div>
                            <h4 style={{ color: 'white', margin: '14px 0 6px 0', fontSize: '1.1rem', fontWeight: 700 }}>
                              No articles found
                            </h4>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.88rem', maxWidth: '380px' }}>
                              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                                ? 'No articles match your search or filter criteria. Try resetting your filters.'
                                : 'You have not created any articles yet. Click "Create Article" to get started!'}
                            </p>
                            {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ marginTop: '14px' }}
                                onClick={() => {
                                  setSearchQuery('');
                                  setStatusFilter('all');
                                  setCategoryFilter('all');
                                }}
                              >
                                <RotateCcw style={{ width: '14px', height: '14px' }} /> Clear Filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedPosts.map((p) => (
                        <tr key={p.id} className="article-row">
                          {/* 1. Cover Image Thumbnail */}
                          <td className="article-thumb-cell">
                            {p.cover_image ? (
                              <div
                                className="article-thumb-preview-box"
                                onClick={() =>
                                  setPreviewImage({
                                    url: p.cover_image!,
                                    title: p.title,
                                    slug: p.slug,
                                    category: p.category,
                                  })
                                }
                                title="Click to preview cover image"
                              >
                                <img
                                  src={p.cover_image}
                                  alt={p.title}
                                  className="article-thumb-image"
                                  loading="lazy"
                                />
                                <div className="article-thumb-hover-overlay">
                                  <ZoomIn style={{ width: '16px', height: '16px', color: '#ffffff' }} />
                                </div>
                              </div>
                            ) : (
                              <div className="article-thumb-empty-box" title="No cover image set">
                                <ImageIcon style={{ width: '18px', height: '18px', color: '#64748b' }} />
                                <span>No Img</span>
                              </div>
                            )}
                          </td>

                          {/* 2. Article Title & Slug */}
                          <td>
                            <div
                              className="article-title-text"
                              onClick={() => handleEditPost(p)}
                              title="Click to edit article"
                            >
                              {p.title}
                            </div>
                            <div className="article-slug-row">
                              <span className="article-slug-text">/{p.slug}</span>
                              <a
                                href={`https://rrbgroupdanswerkey.pages.dev/${p.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="article-slug-link-icon"
                                title="View live article"
                              >
                                <ExternalLink style={{ width: '12px', height: '12px' }} />
                              </a>
                            </div>
                          </td>

                          {/* 3. Category */}
                          <td>
                            <span className="article-category-badge">
                              {p.category}
                            </span>
                          </td>

                          {/* 4. Views */}
                          <td>
                            <div className="article-views-cell">
                              <Eye style={{ width: '14px', height: '14px', color: '#38bdf8' }} />
                              <span>{(p.views || 0).toLocaleString()}</span>
                            </div>
                          </td>

                          {/* 5. Date */}
                          <td>
                            <div className="article-date-cell">
                              <Calendar style={{ width: '13px', height: '13px', color: '#64748b' }} />
                              <span>{p.created_at ? p.created_at.split(' ')[0] : 'Today'}</span>
                            </div>
                          </td>

                          {/* 6. Status */}
                          <td>
                            <span className={`status-badge ${p.status}`}>
                              <span className="status-indicator-dot" />
                              {p.status}
                            </span>
                          </td>

                          {/* 7. Action Buttons */}
                          <td style={{ textAlign: 'right' }}>
                            <div className="articles-action-buttons">
                              <a
                                href={`https://rrbgroupdanswerkey.pages.dev/${p.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-table-action btn-table-preview"
                                title="Preview Live Website"
                              >
                                <ExternalLink style={{ width: '14px', height: '14px' }} />
                              </a>
                              {p.cover_image && (
                                <button
                                  type="button"
                                  className="btn-table-action btn-table-image"
                                  title="Preview Cover Image"
                                  onClick={() =>
                                    setPreviewImage({
                                      url: p.cover_image!,
                                      title: p.title,
                                      slug: p.slug,
                                      category: p.category,
                                    })
                                  }
                                >
                                  <ImageIcon style={{ width: '14px', height: '14px' }} />
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-table-action btn-table-edit"
                                title="Edit Article"
                                onClick={() => handleEditPost(p)}
                              >
                                <Edit3 style={{ width: '14px', height: '14px' }} />
                              </button>
                              <button
                                type="button"
                                className="btn-table-action btn-table-delete"
                                title="Delete Article"
                                onClick={() => handleDeletePost(p.id)}
                              >
                                <Trash2 style={{ width: '14px', height: '14px' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE ADAPTIVE CARDS VIEW (<= 640px) */}
              <div className="articles-mobile-cards-container">
                {filteredPosts.length === 0 ? (
                  <div className="articles-empty-state">
                    <div className="empty-icon-box">
                      <FileText style={{ width: '32px', height: '32px', color: '#64748b' }} />
                    </div>
                    <h4 style={{ color: 'white', margin: '12px 0 4px 0', fontSize: '1.05rem', fontWeight: 700 }}>
                      No articles found
                    </h4>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.84rem' }}>
                      No articles match your criteria.
                    </p>
                    {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '12px' }}
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                          setCategoryFilter('all');
                        }}
                      >
                        <RotateCcw style={{ width: '13px', height: '13px' }} /> Reset Filters
                      </button>
                    )}
                  </div>
                ) : (
                  paginatedPosts.map((p) => (
                    <div key={p.id} className="article-mobile-item-card">
                      {/* Top Row: Thumbnail + Info */}
                      <div className="article-mobile-item-top">
                        {p.cover_image ? (
                          <div
                            className="article-mobile-item-thumb"
                            onClick={() =>
                              setPreviewImage({
                                url: p.cover_image!,
                                title: p.title,
                                slug: p.slug,
                                category: p.category,
                              })
                            }
                            title="Tap to preview image"
                          >
                            <img src={p.cover_image} alt={p.title} loading="lazy" />
                            <div className="article-mobile-thumb-badge">
                              <ZoomIn style={{ width: '11px', height: '11px' }} />
                            </div>
                          </div>
                        ) : (
                          <div className="article-mobile-item-thumb empty">
                            <ImageIcon style={{ width: '18px', height: '18px', color: '#64748b' }} />
                          </div>
                        )}

                        <div className="article-mobile-item-details">
                          <div
                            className="article-mobile-item-title"
                            onClick={() => handleEditPost(p)}
                          >
                            {p.title}
                          </div>
                          <div className="article-mobile-item-slug">/{p.slug}</div>
                          <div className="article-mobile-item-badges">
                            <span className={`status-badge ${p.status}`}>
                              <span className="status-indicator-dot" />
                              {p.status}
                            </span>
                            <span className="article-category-badge small">
                              {p.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Meta Row: Views & Date */}
                      <div className="article-mobile-item-meta">
                        <div className="meta-stat">
                          <Eye style={{ width: '13px', height: '13px', color: '#38bdf8' }} />
                          <span>{(p.views || 0).toLocaleString()} views</span>
                        </div>
                        <div className="meta-stat">
                          <Calendar style={{ width: '13px', height: '13px', color: '#64748b' }} />
                          <span>{p.created_at ? p.created_at.split(' ')[0] : 'Today'}</span>
                        </div>
                      </div>

                      {/* Actions Grid */}
                      <div className="article-mobile-item-actions">
                        <a
                          href={`https://rrbgroupdanswerkey.pages.dev/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-mobile-card-action live"
                        >
                          <ExternalLink style={{ width: '13px', height: '13px' }} />
                          <span>Live</span>
                        </a>
                        {p.cover_image && (
                          <button
                            type="button"
                            className="btn-mobile-card-action image"
                            onClick={() =>
                              setPreviewImage({
                                url: p.cover_image!,
                                title: p.title,
                                slug: p.slug,
                                category: p.category,
                              })
                            }
                          >
                            <ImageIcon style={{ width: '13px', height: '13px' }} />
                            <span>Image</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-mobile-card-action edit"
                          onClick={() => handleEditPost(p)}
                        >
                          <Edit3 style={{ width: '13px', height: '13px' }} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-mobile-card-action delete"
                          onClick={() => handleDeletePost(p.id)}
                        >
                          <Trash2 style={{ width: '13px', height: '13px' }} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* BEAUTIFUL PREMIUM ARTICLES PAGINATION TOOLBAR */}
              {filteredPosts.length > 0 && (
                <div className="articles-pagination-toolbar">
                  {/* Left: Summary & Per-Page Selector */}
                  <div className="pagination-summary-wrap">
                    <span className="pagination-info-text">
                      Showing <strong className="pagination-highlight">{startIndex + 1}–{endIndex}</strong> of{' '}
                      <strong className="pagination-highlight">{filteredPosts.length}</strong> articles
                    </span>

                    <div className="pagination-per-page-wrap">
                      <label htmlFor="articles-per-page-select" className="pagination-per-page-label">
                        Per page:
                      </label>
                      <select
                        id="articles-per-page-select"
                        className="pagination-per-page-select"
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>

                  {/* Right: Modern Page Navigation Buttons */}
                  {totalPages > 1 && (
                    <div className="pagination-nav-wrap">
                      {/* Prev Button */}
                      <button
                        type="button"
                        className="pagination-arrow-btn"
                        disabled={safeCurrentPage <= 1}
                        onClick={() => {
                          if (safeCurrentPage > 1) {
                            setCurrentPage(safeCurrentPage - 1);
                          }
                        }}
                        aria-label="Previous Page"
                      >
                        <ChevronLeft style={{ width: '15px', height: '15px' }} />
                        <span>Prev</span>
                      </button>

                      {/* Numbered Page Buttons */}
                      <div className="pagination-numbers-list">
                        {getPaginationRange(safeCurrentPage, totalPages).map((item, idx) => {
                          if (item === '...') {
                            return (
                              <span key={`dots-${idx}`} className="pagination-dots">
                                &hellip;
                              </span>
                            );
                          }

                          const pageNum = item as number;
                          const isActive = pageNum === safeCurrentPage;

                          return (
                            <button
                              key={`page-${pageNum}`}
                              type="button"
                              className={`pagination-page-btn ${isActive ? 'active' : ''}`}
                              onClick={() => setCurrentPage(pageNum)}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        type="button"
                        className="pagination-arrow-btn"
                        disabled={safeCurrentPage >= totalPages}
                        onClick={() => {
                          if (safeCurrentPage < totalPages) {
                            setCurrentPage(safeCurrentPage + 1);
                          }
                        }}
                        aria-label="Next Page"
                      >
                        <span>Next</span>
                        <ChevronRight style={{ width: '15px', height: '15px' }} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ADD / EDIT ARTICLE FORM (PROFESSIONAL PREMIUM EDITORIAL UI) */}
        {(activeTab === 'add' || activeTab === 'edit') && (
          <form onSubmit={handleSavePost} className="editor-page-container">
            {/* Top Command Bar */}
            <div className="editor-top-bar">
              <div className="editor-top-bar-left">
                <button
                  type="button"
                  className="editor-back-btn"
                  onClick={() => handleTabChange('list')}
                  title="Back to all articles list"
                >
                  <ArrowLeft style={{ width: '16px', height: '16px' }} />
                  <span>All Articles</span>
                </button>

                <div className="editor-breadcrumb-divider">/</div>

                <div className="editor-header-title-badge">
                  {editId ? (
                    <span className="editor-badge-chip edit">
                      <Edit3 style={{ width: '13px', height: '13px' }} />
                      <span>Edit Article #{editId}</span>
                    </span>
                  ) : (
                    <span className="editor-badge-chip create">
                      <PlusCircle style={{ width: '13px', height: '13px' }} />
                      <span>Create New Article</span>
                    </span>
                  )}
                </div>

                {editId && slug && (
                  <a
                    href={`https://rrbgroupdanswerkey.pages.dev/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="editor-live-link-btn"
                    title="Preview article on live website"
                  >
                    <ExternalLink style={{ width: '13px', height: '13px' }} />
                    <span>View Live</span>
                  </a>
                )}
              </div>

              <div className="editor-top-bar-right">
                <button
                  type="button"
                  className="btn btn-secondary editor-cancel-btn"
                  onClick={() => handleTabChange('list')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary editor-save-primary-btn"
                >
                  <Save style={{ width: '16px', height: '16px' }} />
                  <span>{editId ? 'Update Article' : 'Publish Article'}</span>
                </button>
              </div>
            </div>

            {/* 2-Column Responsive Layout */}
            <div className="editor-layout-grid">
              {/* Left Main Column: Creative Writing Area */}
              <div className="editor-main-column">
                {/* 1. Article Title & Permalink Card */}
                <div className="editor-card">
                  <div className="form-group editor-title-group">
                    <div className="editor-field-header">
                      <label className="form-label editor-label">
                        Article Title <span className="req-star">*</span>
                      </label>
                      <span className="editor-char-counter">
                        {title.length} characters
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      className="form-control editor-title-input"
                      placeholder="Enter a clear, engaging article title..."
                      value={title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setTitle(newTitle);
                        if (!isSlugManuallyEdited) {
                          setSlug(generateSeoSlug(newTitle, editId, posts));
                        }
                      }}
                    />
                  </div>

                  {/* 2. Custom Slug / Permalink with Interactive URL Bar */}
                  <div className="form-group editor-slug-group">
                    <div className="editor-field-header">
                      <label className="form-label editor-label" style={{ margin: 0 }}>
                        Permalink URL Slug <span className="req-star">*</span>
                      </label>
                      <button
                        type="button"
                        className="editor-resync-slug-btn"
                        onClick={() => {
                          const autoSlug = generateSeoSlug(title, editId, posts);
                          setSlug(autoSlug);
                          setIsSlugManuallyEdited(false);
                          showSuccess('SEO Slug re-generated from title!');
                        }}
                        title="Re-generate URL slug automatically from the current article title"
                      >
                        <RotateCcw style={{ width: '12px', height: '12px' }} />
                        <span>Re-sync Title</span>
                      </button>
                    </div>

                    <div className="editor-slug-input-wrapper">
                      <span className="editor-slug-prefix">
                        rrbgroupdanswerkey.pages.dev/
                      </span>
                      <input
                        type="text"
                        required
                        className="form-control editor-slug-input"
                        placeholder="article-slug-url"
                        value={slug}
                        onChange={(e) => {
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'));
                          setIsSlugManuallyEdited(true);
                        }}
                      />
                    </div>

                    <div className="editor-slug-status-hint">
                      {posts.some((p) => p.id !== editId && p.slug === slug) ? (
                        <div className="slug-hint-warning">
                          <AlertCircle style={{ width: '14px', height: '14px' }} />
                          <span>Slug already in use by another article. A unique counter (-2, -3) will be appended automatically.</span>
                        </div>
                      ) : (
                        <div className="slug-hint-success">
                          <CheckCircle style={{ width: '14px', height: '14px' }} />
                          <span>SEO URL is clean &amp; unique: <code>/{slug || 'your-slug'}</code></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Short Excerpt & Meta Description */}
                  <div className="form-group editor-excerpt-group" style={{ marginBottom: 0 }}>
                    <div className="editor-field-header">
                      <label className="form-label editor-label">
                        Post Excerpt &amp; Meta Description
                      </label>
                      <span className="editor-char-counter">
                        {excerpt.length}/160 chars (Recommended: 120-160)
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      className="form-control editor-excerpt-textarea"
                      placeholder="Write a concise overview of the article. This is used as the Google Search Meta Description and post card summary (defaults to first 160 chars of content if empty)..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                    />
                  </div>
                </div>

                {/* 2. Content Editor Card (TinyMCE Visual / Raw HTML) */}
                <div className="editor-card">
                  <div className="editor-content-card-header">
                    <div className="editor-section-heading">
                      <FileText style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
                      <span>Article Content &amp; Formatting</span>
                      <span className="req-star">*</span>
                    </div>

                    <button
                      type="button"
                      className={`editor-mode-toggle-btn ${isRawHtmlMode ? 'active-code' : 'active-visual'}`}
                      onClick={() => setIsRawHtmlMode(!isRawHtmlMode)}
                      title={isRawHtmlMode ? 'Switch to TinyMCE Visual Editor' : 'Switch to Raw HTML Code Editor'}
                    >
                      {isRawHtmlMode ? (
                        <>
                          <Edit style={{ width: '14px', height: '14px' }} />
                          <span>Switch to Visual Editor</span>
                        </>
                      ) : (
                        <>
                          <Code style={{ width: '14px', height: '14px' }} />
                          <span>Switch to Raw HTML</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isRawHtmlMode ? (
                    <div className="editor-raw-html-container">
                      <div className="raw-html-header-strip">
                        <span className="raw-html-tag">&lt;/&gt; Raw HTML Source Code</span>
                        <span className="raw-html-hint">Direct HTML tags, embeds, tables, and scripts are supported</span>
                      </div>
                      <textarea
                        rows={22}
                        required
                        className="form-control editor-raw-html-textarea"
                        placeholder="Write or paste your custom HTML code here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="editor-tinymce-container">
                      <TinyEditor
                        tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/7.6.0/tinymce.min.js"
                        value={content}
                        onEditorChange={(newContent: string) => setContent(newContent)}
                        init={{
                          height: 580,
                          menubar: 'file edit view insert format tools table help',
                          skin: 'oxide-dark',
                          content_css: 'dark',
                          plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'directionality'
                          ],
                          toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                            'bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'table link image media | removeformat code fullscreen | help',
                          content_style: 'body { font-family: Plus Jakarta Sans, system-ui, -apple-system, sans-serif; font-size: 15px; color: #e2e8f0; background-color: #0f172a; line-height: 1.65; padding: 14px; } a { color: #38bdf8; } table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; } th, td { border: 1px solid #334155; padding: 8px 12px; } th { background-color: #1e293b; color: #f8fafc; font-weight: bold; }',
                          branding: false,
                          promotion: false,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar Column: Publishing & Metadata Cards */}
              <div className="editor-sidebar-column">
                {/* 1. Publishing Status & Action Card */}
                <div className="editor-sidebar-card">
                  <div className="sidebar-card-header">
                    <Save style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
                    <h4>Publish Settings</h4>
                  </div>

                  {/* Status, Category & Author Fields in Responsive Row */}
                  <div className="editor-publish-fields-grid">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label editor-label">
                        Publishing Status <span className="req-star">*</span>
                      </label>
                      <select
                        className="form-control editor-select"
                        value={status}
                        onChange={(e: any) => setStatus(e.target.value)}
                      >
                        <option value="publish">● Published (Live Immediately)</option>
                        <option value="draft">● Draft (Private / Unpublished)</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label editor-label">
                        Article Category <span className="req-star">*</span>
                      </label>
                      <select
                        className="form-control editor-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {categoriesList.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label editor-label">Author Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Admin"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Primary Save Button in Sidebar */}
                  <div className="sidebar-publish-actions">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block sidebar-publish-btn"
                    >
                      <Save style={{ width: '16px', height: '16px' }} />
                      <span>{editId ? 'Update Article Now' : 'Publish Article Now'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-block"
                      onClick={() => handleTabChange('list')}
                    >
                      Cancel / Back
                    </button>
                  </div>
                </div>

                {/* 2. Featured Cover Image Card */}
                <div className="editor-sidebar-card">
                  <div className="sidebar-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
                      <h4>Cover Image</h4>
                    </div>

                    {/* Mode Toggle Switch */}
                    <div className="cover-mode-toggle">
                      <button
                        type="button"
                        className={`cover-mode-btn ${coverImageMode === 'url' ? 'active' : ''}`}
                        onClick={() => setCoverImageMode('url')}
                      >
                        <Link2 style={{ width: '12px', height: '12px' }} />
                        <span>Link</span>
                      </button>
                      <button
                        type="button"
                        className={`cover-mode-btn ${coverImageMode === 'upload' ? 'active' : ''}`}
                        onClick={() => setCoverImageMode('upload')}
                      >
                        <Upload style={{ width: '12px', height: '12px' }} />
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>

                  {coverImageMode === 'url' ? (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label editor-label">Image Web URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://example.com/uploads/cover.jpg"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="cover-file-input"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageFileUpload}
                      />
                      <label htmlFor="cover-file-input" className="editor-upload-dropzone">
                        <Upload style={{ width: '28px', height: '28px', color: '#38bdf8', marginBottom: '6px' }} />
                        <span className="dropzone-main-text">Choose Image from Device</span>
                        <span className="dropzone-sub-text">PNG, JPG, WEBP up to 5MB</span>
                      </label>
                    </div>
                  )}

                  {/* Live Cover Image Preview Box */}
                  {coverImage ? (
                    <div className="editor-cover-preview-card">
                      <div
                        className="cover-preview-img-wrap"
                        onClick={() =>
                          setPreviewImage({
                            url: coverImage,
                            title: title || 'Cover Image Preview',
                            slug,
                            category,
                          })
                        }
                        title="Click to view full preview in lightbox"
                      >
                        <img src={coverImage} alt="Cover Preview" className="cover-preview-img" />
                        <div className="cover-preview-overlay">
                          <ZoomIn style={{ width: '18px', height: '18px', color: '#ffffff' }} />
                          <span>Click to Zoom</span>
                        </div>
                      </div>

                      <div className="cover-preview-footer-bar">
                        <span className="cover-preview-info-tag">
                          {coverImage.startsWith('data:') ? 'Local Base64 File' : 'External URL'}
                        </span>
                        <button
                          type="button"
                          className="cover-remove-btn"
                          onClick={() => setCoverImage('')}
                          title="Remove cover image"
                        >
                          <Trash2 style={{ width: '13px', height: '13px' }} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="editor-no-cover-box">
                      <ImageIcon style={{ width: '24px', height: '24px', color: '#475569' }} />
                      <span>No cover image selected</span>
                    </div>
                  )}
                </div>

                {/* 3. Tags & Keywords Card */}
                <div className="editor-sidebar-card">
                  <div className="sidebar-card-header">
                    <Tags style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
                    <h4>Tags &amp; Keywords</h4>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. RRB Group D, Answer Key, Cut Off"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                    <span className="editor-field-hint">
                      Separate multiple keywords with commas.
                    </span>
                  </div>
                </div>

                {/* 4. Google Search SEO Live Preview */}
                <div className="editor-sidebar-card">
                  <div className="sidebar-card-header">
                    <Globe style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
                    <h4>Google Search (SERP) Live Preview</h4>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                    Live simulation of how this article will appear on Google search results based on your Title, Permalink, and Excerpt.
                  </p>

                  {/* Google Search Result SERP Simulator */}
                  <div className="google-serp-preview-box">
                    <div className="serp-top-row">
                      <span className="serp-domain">https://rrbgroupdanswerkey.com &rsaquo; {slug || 'article-slug'}</span>
                    </div>
                    <h5 className="serp-title">
                      {title || 'Your Article Title Goes Here'}
                    </h5>
                    <p className="serp-desc">
                      {excerpt || (content ? content.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().slice(0, 160) : '') || 'Your article summary or meta description will appear here on Google search results...'}
                    </p>
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8' }}>Title Length:</span>
                      <span style={{ fontWeight: 600, color: title.length > 60 ? '#f43f5e' : (title.length >= 40 ? '#10b981' : '#38bdf8') }}>
                        {title.length}/60 chars
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8' }}>Snippet Length:</span>
                      <span style={{ fontWeight: 600, color: excerpt.length > 160 ? '#f43f5e' : (excerpt.length >= 100 ? '#10b981' : '#38bdf8') }}>
                        {excerpt.length}/160 chars
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Fixed Bottom Action Bar (shown on <= 640px) */}
            <div className="editor-mobile-bottom-bar">
              <button
                type="button"
                className="btn btn-secondary editor-mobile-cancel"
                onClick={() => handleTabChange('list')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary editor-mobile-submit"
              >
                <Save style={{ width: '16px', height: '16px' }} />
                <span>{editId ? 'Update Article' : 'Publish Article'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: CATEGORIES MANAGEMENT (PREMIUM ALL-DEVICE RESPONSIVE) */}
        {activeTab === 'categories' && (
          <div className="categories-page-container">
            {/* 1. Header Toolbar */}
            <div className="categories-top-bar">
              <div className="categories-top-bar-left">
                <div className="categories-header-icon-wrap">
                  <FolderOpen style={{ width: '22px', height: '22px', color: '#38bdf8' }} />
                </div>
                <div>
                  <h3 className="categories-header-title">Categories Management</h3>
                  <p className="categories-header-subtitle">
                    Organize, classify, and control article category visibility across your portal
                  </p>
                </div>
              </div>

              <div className="categories-top-bar-right">
                <button
                  type="button"
                  className="btn btn-primary categories-add-btn"
                  onClick={() => {
                    setCatModalMode('add');
                    setCatInputName('');
                    setShowCatModal(true);
                  }}
                >
                  <PlusCircle style={{ width: '16px', height: '16px' }} />
                  <span>Add New Category</span>
                </button>
              </div>
            </div>

            {/* 2. Metrics Strip */}
            <div className="categories-metrics-strip">
              <button
                type="button"
                className={`cat-metric-pill ${catStatusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCatStatusFilter('all')}
              >
                <span className="cat-metric-label">All Categories</span>
                <span className="cat-metric-badge all">{categoriesList.length}</span>
              </button>

              <button
                type="button"
                className={`cat-metric-pill ${catStatusFilter === 'visible' ? 'active' : ''}`}
                onClick={() => setCatStatusFilter('visible')}
              >
                <Eye style={{ width: '13px', height: '13px', color: '#34d399' }} />
                <span className="cat-metric-label">Visible</span>
                <span className="cat-metric-badge visible">
                  {categoriesList.filter((c) => !hiddenCategoriesList.some((h) => h.toLowerCase() === c.toLowerCase())).length}
                </span>
              </button>

              <button
                type="button"
                className={`cat-metric-pill ${catStatusFilter === 'hidden' ? 'active' : ''}`}
                onClick={() => setCatStatusFilter('hidden')}
              >
                <EyeOff style={{ width: '13px', height: '13px', color: '#f87171' }} />
                <span className="cat-metric-label">Hidden</span>
                <span className="cat-metric-badge hidden">
                  {categoriesList.filter((c) => hiddenCategoriesList.some((h) => h.toLowerCase() === c.toLowerCase())).length}
                </span>
              </button>

              <div className="cat-metric-stat-box">
                <span className="cat-metric-stat-label">Total Articles Linked:</span>
                <span className="cat-metric-stat-val">
                  {posts.filter((p) => categoriesList.some((c) => c.toLowerCase() === p.category.toLowerCase())).length}
                </span>
              </div>
            </div>

            {/* 3. Search & Filter Bar */}
            <div className="categories-search-bar">
              <div className="cat-search-input-wrap">
                <Search style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="cat-search-input"
                  placeholder="Search categories by name..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                />
                {catSearch && (
                  <button
                    type="button"
                    className="cat-search-clear-btn"
                    onClick={() => setCatSearch('')}
                    title="Clear search"
                  >
                    <X style={{ width: '14px', height: '14px' }} />
                  </button>
                )}
              </div>

              {(catSearch || catStatusFilter !== 'all') && (
                <button
                  type="button"
                  className="cat-reset-filters-btn"
                  onClick={() => {
                    setCatSearch('');
                    setCatStatusFilter('all');
                  }}
                >
                  <RotateCcw style={{ width: '13px', height: '13px' }} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* 4. Table / Cards Content */}
            {(() => {
              const filteredCats = categoriesList.filter((cat) => {
                const matchesSearch = !catSearch.trim() || cat.toLowerCase().includes(catSearch.trim().toLowerCase());
                const isHidden = hiddenCategoriesList.some((c) => c.toLowerCase() === cat.toLowerCase());
                const matchesStatus =
                  catStatusFilter === 'all' ||
                  (catStatusFilter === 'visible' && !isHidden) ||
                  (catStatusFilter === 'hidden' && isHidden);
                return matchesSearch && matchesStatus;
              });

              if (filteredCats.length === 0) {
                return (
                  <div className="categories-empty-card">
                    <div className="categories-empty-icon">
                      <FolderOpen style={{ width: '36px', height: '36px', color: '#64748b' }} />
                    </div>
                    <h4 className="categories-empty-title">No Categories Found</h4>
                    <p className="categories-empty-desc">
                      {catSearch
                        ? `No category matches "${catSearch}". Try another keyword or clear filters.`
                        : 'No categories created yet. Click "Add New Category" above to organize your articles.'}
                    </p>
                    {catSearch ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setCatSearch('');
                          setCatStatusFilter('all');
                        }}
                      >
                        Clear Search
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setCatModalMode('add');
                          setCatInputName('');
                          setShowCatModal(true);
                        }}
                      >
                        <PlusCircle style={{ width: '14px', height: '14px' }} />
                        <span>Add First Category</span>
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="categories-content-container">
                  {/* Desktop / Tablet Table */}
                  <div className="categories-desktop-table-wrap">
                    <table className="categories-table">
                      <thead>
                        <tr>
                          <th>Category Name</th>
                          <th>Articles Count</th>
                          <th>Public Visibility</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCats.map((cat) => {
                          const count = posts.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
                          const isHidden = hiddenCategoriesList.some((c) => c.toLowerCase() === cat.toLowerCase());
                          return (
                            <tr key={cat} className="categories-table-row">
                              <td>
                                <div className="cat-name-cell">
                                  <div className="cat-avatar-icon">
                                    <FolderOpen style={{ width: '15px', height: '15px', color: isHidden ? '#94a3b8' : '#38bdf8' }} />
                                  </div>
                                  <div>
                                    <span className="cat-name-text">{cat}</span>
                                    <div className="cat-slug-sub">
                                      category: <code>{cat.toLowerCase().replace(/\s+/g, '-')}</code>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`cat-articles-pill ${count > 0 ? 'has-articles' : 'empty-articles'}`}>
                                  <FileText style={{ width: '12px', height: '12px' }} />
                                  <span>{count} {count === 1 ? 'Article' : 'Articles'}</span>
                                </span>
                              </td>
                              <td>
                                {isHidden ? (
                                  <span className="status-badge draft">
                                    <EyeOff style={{ width: '12px', height: '12px' }} />
                                    <span>Hidden</span>
                                  </span>
                                ) : (
                                  <span className="status-badge publish">
                                    <Eye style={{ width: '12px', height: '12px' }} />
                                    <span>Visible</span>
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div className="cat-actions-row">
                                  <button
                                    type="button"
                                    className={`btn-icon ${isHidden ? 'cat-btn-show' : 'cat-btn-hide'}`}
                                    title={isHidden ? 'Make Category Visible' : 'Hide Category from Visitors'}
                                    onClick={() => handleToggleCategoryVisibility(cat)}
                                  >
                                    {isHidden ? (
                                      <Eye style={{ width: '15px', height: '15px' }} />
                                    ) : (
                                      <EyeOff style={{ width: '15px', height: '15px' }} />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-icon btn-edit"
                                    title="Edit Category Name"
                                    onClick={() => {
                                      setCatModalMode('edit');
                                      setCatOriginalName(cat);
                                      setCatInputName(cat);
                                      setShowCatModal(true);
                                    }}
                                  >
                                    <Edit3 style={{ width: '15px', height: '15px' }} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-icon btn-delete"
                                    title="Delete Category"
                                    onClick={() => handleDeleteCategory(cat)}
                                  >
                                    <Trash2 style={{ width: '15px', height: '15px' }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Touch Cards */}
                  <div className="categories-mobile-cards-wrap">
                    {filteredCats.map((cat) => {
                      const count = posts.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
                      const isHidden = hiddenCategoriesList.some((c) => c.toLowerCase() === cat.toLowerCase());
                      return (
                        <div key={cat} className="cat-mobile-card">
                          <div className="cat-mobile-card-header">
                            <div className="cat-mobile-title-block">
                              <div className="cat-avatar-icon">
                                <FolderOpen style={{ width: '16px', height: '16px', color: isHidden ? '#94a3b8' : '#38bdf8' }} />
                              </div>
                              <div>
                                <h4 className="cat-mobile-title">{cat}</h4>
                                <span className="cat-mobile-slug">category/{cat.toLowerCase().replace(/\s+/g, '-')}</span>
                              </div>
                            </div>

                            {isHidden ? (
                              <span className="status-badge draft">
                                <EyeOff style={{ width: '11px', height: '11px' }} />
                                <span>Hidden</span>
                              </span>
                            ) : (
                              <span className="status-badge publish">
                                <Eye style={{ width: '11px', height: '11px' }} />
                                <span>Visible</span>
                              </span>
                            )}
                          </div>

                          <div className="cat-mobile-card-meta">
                            <span className={`cat-articles-pill ${count > 0 ? 'has-articles' : 'empty-articles'}`}>
                              <FileText style={{ width: '12px', height: '12px' }} />
                              <span>{count} {count === 1 ? 'Article' : 'Articles'} Linked</span>
                            </span>
                          </div>

                          <div className="cat-mobile-card-actions">
                            <button
                              type="button"
                              className={`cat-mobile-action-btn ${isHidden ? 'show' : 'hide'}`}
                              onClick={() => handleToggleCategoryVisibility(cat)}
                            >
                              {isHidden ? (
                                <>
                                  <Eye style={{ width: '14px', height: '14px' }} />
                                  <span>Make Visible</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff style={{ width: '14px', height: '14px' }} />
                                  <span>Hide</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="cat-mobile-action-btn edit"
                              onClick={() => {
                                setCatModalMode('edit');
                                setCatOriginalName(cat);
                                setCatInputName(cat);
                                setShowCatModal(true);
                              }}
                            >
                              <Edit3 style={{ width: '14px', height: '14px' }} />
                              <span>Rename</span>
                            </button>
                            <button
                              type="button"
                              className="cat-mobile-action-btn delete"
                              onClick={() => handleDeleteCategory(cat)}
                            >
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 5: HEADER MENU MANAGEMENT (PREMIUM ALL-DEVICE RESPONSIVE) */}
        {activeTab === 'menu' && (
          <div className="menu-page-container">
            {/* 1. Top Header Bar */}
            <div className="menu-top-bar">
              <div className="menu-top-bar-left">
                <div className="menu-header-icon-wrap">
                  <Navigation style={{ width: '22px', height: '22px', color: '#60a5fa' }} />
                </div>
                <div>
                  <h3 className="menu-header-title">Header Navigation Menu</h3>
                  <p className="menu-header-subtitle">
                    Manage, reorder, and control links displayed on your portal top header navigation
                  </p>
                </div>
              </div>

              <div className="menu-top-bar-right">
                <button
                  type="button"
                  className="btn btn-primary menu-add-btn"
                  onClick={() => {
                    setMenuModalMode('add');
                    setMenuInputTitle('');
                    setMenuInputUrl('');
                    setShowMenuModal(true);
                  }}
                >
                  <PlusCircle style={{ width: '16px', height: '16px' }} />
                  <span>Add Menu Item</span>
                </button>
              </div>
            </div>

            {/* 2. Interactive Live Header Preview Simulator Card */}
            <div className="menu-live-preview-card">
              <div className="live-preview-top-strip">
                <div className="live-preview-indicator">
                  <span className="live-dot-pulse"></span>
                  <span className="live-preview-title">Live Header Navigation Simulator</span>
                </div>
                <span className="live-preview-hint">Real-time simulation as visitors see it</span>
              </div>

              <div className="live-mock-navbar">
                <div className="mock-navbar-brand">
                  <span className="mock-brand-dot"></span>
                  <span className="mock-brand-text">RRB Group D Portal</span>
                </div>

                <div className="mock-navbar-links-scroll">
                  {menuList.length === 0 ? (
                    <span className="mock-no-links-text">No navigation items added yet</span>
                  ) : (
                    menuList.map((item, idx) => (
                      <div
                        key={idx}
                        className={`mock-nav-pill ${item.visible === 1 ? 'is-visible' : 'is-hidden'}`}
                        title={item.visible === 1 ? `Link: ${item.url}` : 'Hidden from visitors'}
                      >
                        <span className="mock-nav-order">#{idx + 1}</span>
                        <span className="mock-nav-title">{item.title}</span>
                        {item.visible !== 1 && <span className="mock-nav-hidden-tag">(Hidden)</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 3. Metrics Strip */}
            <div className="menu-metrics-strip">
              <div className="menu-metric-stat-box">
                <span className="menu-metric-stat-label">Total Links:</span>
                <span className="menu-metric-stat-val all">{menuList.length}</span>
              </div>

              <div className="menu-metric-stat-box">
                <Eye style={{ width: '13px', height: '13px', color: '#34d399' }} />
                <span className="menu-metric-stat-label">Visible in Header:</span>
                <span className="menu-metric-stat-val visible">
                  {menuList.filter((m) => m.visible === 1).length}
                </span>
              </div>

              <div className="menu-metric-stat-box">
                <EyeOff style={{ width: '13px', height: '13px', color: '#f87171' }} />
                <span className="menu-metric-stat-label">Hidden:</span>
                <span className="menu-metric-stat-val hidden">
                  {menuList.filter((m) => m.visible !== 1).length}
                </span>
              </div>

              {/* Search input inside metrics strip or toolbar */}
              <div className="menu-search-wrap">
                <Search style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="menu-search-input"
                  placeholder="Filter menu items..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                />
                {menuSearch && (
                  <button
                    type="button"
                    className="menu-search-clear-btn"
                    onClick={() => setMenuSearch('')}
                    title="Clear filter"
                  >
                    <X style={{ width: '13px', height: '13px' }} />
                  </button>
                )}
              </div>
            </div>

            {/* 4. Table / Cards Content */}
            {(() => {
              const indexedMenu = menuList.map((item, originalIdx) => ({ item, originalIdx }));
              const filteredMenu = indexedMenu.filter(({ item }) => {
                if (!menuSearch.trim()) return true;
                const q = menuSearch.toLowerCase().trim();
                return item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
              });

              if (filteredMenu.length === 0) {
                return (
                  <div className="menu-empty-card">
                    <div className="menu-empty-icon">
                      <Navigation style={{ width: '36px', height: '36px', color: '#64748b' }} />
                    </div>
                    <h4 className="menu-empty-title">No Menu Items Found</h4>
                    <p className="menu-empty-desc">
                      {menuSearch
                        ? `No menu item matching "${menuSearch}". Try another search keyword.`
                        : 'Your header navigation menu is currently empty. Add links to let visitors easily navigate your site.'}
                    </p>
                    {menuSearch ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setMenuSearch('')}
                      >
                        Clear Search
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setMenuModalMode('add');
                          setMenuInputTitle('');
                          setMenuInputUrl('');
                          setShowMenuModal(true);
                        }}
                      >
                        <PlusCircle style={{ width: '14px', height: '14px' }} />
                        <span>Add First Menu Link</span>
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="menu-content-container">
                  {/* Desktop / Tablet Table View */}
                  <div className="menu-desktop-table-wrap">
                    <table className="menu-table">
                      <thead>
                        <tr>
                          <th style={{ width: '70px' }}>Order</th>
                          <th>Menu Title</th>
                          <th>Destination Link (URL)</th>
                          <th>Visibility</th>
                          <th style={{ textAlign: 'right' }}>Reorder &amp; Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMenu.map(({ item, originalIdx }) => (
                          <tr key={originalIdx} className="menu-table-row">
                            <td>
                              <span className="menu-order-badge">#{originalIdx + 1}</span>
                            </td>
                            <td>
                              <div className="menu-title-cell">
                                <Link2 style={{ width: '14px', height: '14px', color: '#60a5fa' }} />
                                <span className="menu-title-text">{item.title}</span>
                              </div>
                            </td>
                            <td>
                              <div className="menu-url-cell">
                                <code className="menu-url-code">{item.url}</code>
                                {item.url.startsWith('http') && (
                                  <span className="menu-external-tag" title="External link">
                                    <ExternalLink style={{ width: '11px', height: '11px' }} />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              {item.visible === 1 ? (
                                <span className="status-badge publish">
                                  <Eye style={{ width: '12px', height: '12px' }} />
                                  <span>Visible</span>
                                </span>
                              ) : (
                                <span className="status-badge draft">
                                  <EyeOff style={{ width: '12px', height: '12px' }} />
                                  <span>Hidden</span>
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="menu-actions-row">
                                <button
                                  type="button"
                                  className="btn-icon btn-move"
                                  title="Move Up in Menu"
                                  disabled={originalIdx === 0}
                                  onClick={() => handleMoveMenu(originalIdx, 'up')}
                                  style={{
                                    opacity: originalIdx === 0 ? 0.35 : 1,
                                    cursor: originalIdx === 0 ? 'not-allowed' : 'pointer',
                                  }}
                                >
                                  <ArrowUp style={{ width: '14px', height: '14px' }} />
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon btn-move"
                                  title="Move Down in Menu"
                                  disabled={originalIdx === menuList.length - 1}
                                  onClick={() => handleMoveMenu(originalIdx, 'down')}
                                  style={{
                                    opacity: originalIdx === menuList.length - 1 ? 0.35 : 1,
                                    cursor: originalIdx === menuList.length - 1 ? 'not-allowed' : 'pointer',
                                  }}
                                >
                                  <ArrowDown style={{ width: '14px', height: '14px' }} />
                                </button>
                                <button
                                  type="button"
                                  className={`btn-icon ${item.visible === 1 ? 'menu-btn-hide' : 'menu-btn-show'}`}
                                  title={item.visible === 1 ? 'Hide link from visitors' : 'Show link on website'}
                                  onClick={() => handleToggleMenuVisibility(originalIdx)}
                                >
                                  {item.visible === 1 ? (
                                    <EyeOff style={{ width: '14px', height: '14px' }} />
                                  ) : (
                                    <Eye style={{ width: '14px', height: '14px' }} />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon btn-edit"
                                  title="Edit Menu Link"
                                  onClick={() => {
                                    setMenuModalMode('edit');
                                    setMenuEditIndex(originalIdx);
                                    setMenuInputTitle(item.title);
                                    setMenuInputUrl(item.url);
                                    setShowMenuModal(true);
                                  }}
                                >
                                  <Edit3 style={{ width: '14px', height: '14px' }} />
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon btn-delete"
                                  title="Delete Menu Link"
                                  onClick={() => handleDeleteMenuItem(originalIdx)}
                                >
                                  <Trash2 style={{ width: '14px', height: '14px' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Touch Cards View */}
                  <div className="menu-mobile-cards-wrap">
                    {filteredMenu.map(({ item, originalIdx }) => (
                      <div key={originalIdx} className="menu-mobile-card">
                        <div className="menu-mobile-card-top">
                          <div className="menu-mobile-title-block">
                            <span className="menu-order-badge">#{originalIdx + 1}</span>
                            <h4 className="menu-mobile-title">{item.title}</h4>
                          </div>

                          {item.visible === 1 ? (
                            <span className="status-badge publish">
                              <Eye style={{ width: '11px', height: '11px' }} />
                              <span>Visible</span>
                            </span>
                          ) : (
                            <span className="status-badge draft">
                              <EyeOff style={{ width: '11px', height: '11px' }} />
                              <span>Hidden</span>
                            </span>
                          )}
                        </div>

                        <div className="menu-mobile-url-box">
                          <Link2 style={{ width: '13px', height: '13px', color: '#60a5fa', flexShrink: 0 }} />
                          <span className="menu-mobile-url-text">{item.url}</span>
                        </div>

                        <div className="menu-mobile-card-actions">
                          <div className="menu-mobile-reorder-group">
                            <button
                              type="button"
                              className="menu-mobile-reorder-btn"
                              disabled={originalIdx === 0}
                              onClick={() => handleMoveMenu(originalIdx, 'up')}
                              title="Move up"
                            >
                              <ArrowUp style={{ width: '13px', height: '13px' }} />
                              <span>Up</span>
                            </button>
                            <button
                              type="button"
                              className="menu-mobile-reorder-btn"
                              disabled={originalIdx === menuList.length - 1}
                              onClick={() => handleMoveMenu(originalIdx, 'down')}
                              title="Move down"
                            >
                              <ArrowDown style={{ width: '13px', height: '13px' }} />
                              <span>Down</span>
                            </button>
                          </div>

                          <div className="menu-mobile-main-actions-group">
                            <button
                              type="button"
                              className={`menu-mobile-action-btn ${item.visible === 1 ? 'hide' : 'show'}`}
                              onClick={() => handleToggleMenuVisibility(originalIdx)}
                            >
                              {item.visible === 1 ? (
                                <>
                                  <EyeOff style={{ width: '13px', height: '13px' }} />
                                  <span>Hide</span>
                                </>
                              ) : (
                                <>
                                  <Eye style={{ width: '13px', height: '13px' }} />
                                  <span>Show</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="menu-mobile-action-btn edit"
                              onClick={() => {
                                setMenuModalMode('edit');
                                setMenuEditIndex(originalIdx);
                                setMenuInputTitle(item.title);
                                setMenuInputUrl(item.url);
                                setShowMenuModal(true);
                              }}
                            >
                              <Edit3 style={{ width: '13px', height: '13px' }} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="menu-mobile-action-btn delete"
                              onClick={() => handleDeleteMenuItem(originalIdx)}
                            >
                              <Trash2 style={{ width: '13px', height: '13px' }} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 6: COMMENTS MODERATION */}
        {activeTab === 'comments' && (
          <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'white', margin: 0, fontWeight: 700 }}>Comments Moderation</h3>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Comment Content</th>
                    <th>Article / Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!Array.isArray(comments) || comments.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No user comments submitted yet.
                      </td>
                    </tr>
                  ) : (
                    comments.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'white' }}>{c.author_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.author_email}</div>
                        </td>
                        <td style={{ maxWidth: '350px' }}>
                          <p style={{ margin: 0, color: '#f1f5f9', fontSize: '0.9rem' }}>{c.content}</p>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{c.created_at}</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-icon btn-delete"
                            title="Delete Comment"
                            onClick={async () => {
                              if (!confirm('Delete this comment?')) return;
                              await fetch(`${API_BASE}/api/admin/comments`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'delete', id: c.id }),
                              });
                              loadData();
                            }}
                          >
                            <Trash2 style={{ width: '15px', height: '15px' }} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: SUBSCRIBERS LIST */}
        {activeTab === 'subscribers' && (
          <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'white', margin: 0, fontWeight: 700 }}>Email Subscribers ({totalSubscribers})</h3>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Subscriber Email</th>
                    <th>Subscribed Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!Array.isArray(subscribers) || subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No email subscribers yet.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600, color: 'white', fontFamily: 'monospace' }}>{s.email}</td>
                        <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.created_at || 'Recently'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-icon btn-delete"
                            title="Remove Subscriber"
                            onClick={async () => {
                              if (!confirm('Remove subscriber email?')) return;
                              await fetch(`${API_BASE}/api/admin/subscribers`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'delete', id: s.id }),
                              });
                              loadData();
                            }}
                          >
                            <Trash2 style={{ width: '15px', height: '15px' }} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: WEBSITE SETTINGS */}
        {/* TAB 8: WEBSITE SETTINGS (PREMIUM ALL-DEVICE RESPONSIVE) */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="settings-page-container">
            {/* 1. Top Command Bar */}
            <div className="settings-top-bar">
              <div className="settings-top-bar-left">
                <div className="settings-header-icon-wrap">
                  <Settings style={{ width: '22px', height: '22px', color: '#38bdf8' }} />
                </div>
                <div>
                  <h3 className="settings-header-title">Website Settings &amp; Configurations</h3>
                  <p className="settings-header-subtitle">
                    Manage portal branding, SEO, monetization ads, Google Analytics, and system configurations
                  </p>
                </div>
              </div>

              <div className="settings-top-bar-right">
                <button
                  type="button"
                  className="btn btn-secondary settings-refresh-btn"
                  onClick={() => {
                    loadData();
                    showSuccess('Settings reloaded from database!');
                  }}
                  title="Reload settings from database"
                >
                  <RotateCcw style={{ width: '15px', height: '15px' }} />
                  <span>Reload</span>
                </button>
                <button
                  type="submit"
                  className="btn btn-primary settings-top-save-btn"
                >
                  <Save style={{ width: '16px', height: '16px' }} />
                  <span>Save All Settings</span>
                </button>
              </div>
            </div>

            {/* 2. Section Filter Tabs Navigation */}
            <div className="settings-nav-tabs-container">
              <div className="settings-nav-tabs-scroll">
                <button
                  type="button"
                  className={`settings-nav-tab-btn ${settingsSectionTab === 'all' ? 'active' : ''}`}
                  onClick={() => setSettingsSectionTab('all')}
                >
                  <LayoutGrid style={{ width: '15px', height: '15px' }} />
                  <span>All Settings</span>
                </button>
                <button
                  type="button"
                  className={`settings-nav-tab-btn ${settingsSectionTab === 'general' ? 'active' : ''}`}
                  onClick={() => setSettingsSectionTab('general')}
                >
                  <Globe style={{ width: '15px', height: '15px' }} />
                  <span>General &amp; Branding</span>
                </button>
                <button
                  type="button"
                  className={`settings-nav-tab-btn ${settingsSectionTab === 'seo' ? 'active' : ''}`}
                  onClick={() => setSettingsSectionTab('seo')}
                >
                  <Search style={{ width: '15px', height: '15px' }} />
                  <span>SEO &amp; Search</span>
                </button>
                <button
                  type="button"
                  className={`settings-nav-tab-btn ${settingsSectionTab === 'ads' ? 'active' : ''}`}
                  onClick={() => setSettingsSectionTab('ads')}
                >
                  <Tags style={{ width: '15px', height: '15px' }} />
                  <span>Monetization &amp; Ads</span>
                </button>
                <button
                  type="button"
                  className={`settings-nav-tab-btn ${settingsSectionTab === 'integrations' ? 'active' : ''}`}
                  onClick={() => setSettingsSectionTab('integrations')}
                >
                  <Code style={{ width: '15px', height: '15px' }} />
                  <span>Integrations &amp; APIs</span>
                </button>
                <button
                  type="button"
                  className={`settings-nav-tab-btn ${settingsSectionTab === 'robots' ? 'active' : ''}`}
                  onClick={() => setSettingsSectionTab('robots')}
                >
                  <FileText style={{ width: '15px', height: '15px' }} />
                  <span>Robots.txt</span>
                </button>
              </div>
            </div>

            {/* 3. Settings Cards Sections */}
            <div className="settings-sections-wrapper">
              {/* SECTION 1: GENERAL & BRANDING */}
              {(settingsSectionTab === 'all' || settingsSectionTab === 'general') && (
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div className="settings-card-icon-title">
                      <div className="settings-section-badge general">
                        <Globe style={{ width: '18px', height: '18px' }} />
                      </div>
                      <div>
                        <h4 className="settings-section-title">General Information &amp; Branding</h4>
                        <p className="settings-section-desc">Configure your website portal name, tagline, logo, and favicon</p>
                      </div>
                    </div>
                  </div>

                  <div className="settings-grid-2col">
                    <div className="form-group">
                      <div className="settings-field-label-row">
                        <label className="form-label settings-label">Site Title *</label>
                        <span className="settings-char-hint">{siteTitleVal.length} chars</span>
                      </div>
                      <input
                        type="text"
                        required
                        className="form-control settings-input"
                        placeholder="e.g. RRB Group D Answer Key"
                        value={siteTitleVal}
                        onChange={(e) => setSiteTitleVal(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <div className="settings-field-label-row">
                        <label className="form-label settings-label">Site Tagline</label>
                        <span className="settings-char-hint">{siteTaglineVal.length} chars</span>
                      </div>
                      <input
                        type="text"
                        className="form-control settings-input"
                        placeholder="e.g. Notification, Answer key, Result"
                        value={siteTaglineVal}
                        onChange={(e) => setSiteTaglineVal(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label settings-label">Site Logo Image URL</label>
                      <input
                        type="text"
                        className="form-control settings-input"
                        placeholder="https://example.com/logo.png"
                        value={siteLogoVal}
                        onChange={(e) => setSiteLogoVal(e.target.value)}
                      />
                      <span className="settings-helper-text">Recommended: Transparent PNG, SVG or WEBP (approx. 240x60px)</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label settings-label">Site Favicon Image URL</label>
                      <input
                        type="text"
                        className="form-control settings-input"
                        placeholder="https://example.com/favicon.ico"
                        value={siteFaviconVal}
                        onChange={(e) => setSiteFaviconVal(e.target.value)}
                      />
                      <span className="settings-helper-text">Square icon (32x32 or 64x64) for browser tabs</span>
                    </div>
                  </div>

                  {/* Live Browser Tab & Branding Preview Simulator */}
                  <div className="settings-live-brand-preview">
                    <div className="live-brand-preview-header">
                      <span className="live-brand-preview-title">Live Browser Tab Simulation</span>
                      <span className="live-brand-preview-sub">How your website branding appears to visitors in the browser</span>
                    </div>

                    <div className="mock-browser-tab-bar">
                      <div className="mock-browser-tab">
                        {siteFaviconVal ? (
                          <img src={siteFaviconVal} alt="Favicon" className="mock-favicon-img" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        ) : (
                          <div className="mock-favicon-placeholder">
                            <Globe style={{ width: '12px', height: '12px', color: '#38bdf8' }} />
                          </div>
                        )}
                        <span className="mock-tab-title">{siteTitleVal || 'RRB Group D Portal'} — {siteTaglineVal || 'Official Updates'}</span>
                        <span className="mock-tab-close">&times;</span>
                      </div>
                    </div>

                    <div className="mock-browser-address-bar">
                      <span className="mock-ssl-lock">🔒 https://</span>
                      <span className="mock-domain-text">rrbgroupdanswerkey.pages.dev</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: SEO & SEARCH ENGINE CONFIGURATIONS */}
              {(settingsSectionTab === 'all' || settingsSectionTab === 'seo') && (
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div className="settings-card-icon-title">
                      <div className="settings-section-badge seo">
                        <Search style={{ width: '18px', height: '18px' }} />
                      </div>
                      <div>
                        <h4 className="settings-section-title">SEO &amp; Search Engine Settings</h4>
                        <p className="settings-section-desc">Optimize descriptions for Google indexing and web crawlers</p>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="settings-field-label-row">
                      <label className="form-label settings-label">Site Global Description</label>
                      <span className="settings-char-hint">{siteDescVal.length} characters</span>
                    </div>
                    <textarea
                      rows={3}
                      className="form-control settings-textarea"
                      placeholder="Comprehensive overview of your website portal and target exams..."
                      value={siteDescVal}
                      onChange={(e) => setSiteDescVal(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <div className="settings-field-label-row">
                      <label className="form-label settings-label">Default Meta Description</label>
                      <span className="settings-char-hint">{defaultMetaDescVal.length}/160 (Recommended: 120-160 chars)</span>
                    </div>
                    <textarea
                      rows={3}
                      className="form-control settings-textarea"
                      placeholder="Fallback meta description used on home and pages without custom meta description..."
                      value={defaultMetaDescVal}
                      onChange={(e) => setDefaultMetaDescVal(e.target.value)}
                    />
                  </div>

                  {/* Google Search Result SERP Preview */}
                  <div className="settings-serp-preview-box">
                    <div className="serp-top-row">
                      <span className="serp-domain">https://rrbgroupdanswerkey.pages.dev</span>
                    </div>
                    <h5 className="serp-title">
                      {siteTitleVal || 'RRB Group D Answer Key'} {siteTaglineVal ? `| ${siteTaglineVal}` : ''}
                    </h5>
                    <p className="serp-desc">
                      {defaultMetaDescVal || siteDescVal || 'Official Railway Recruitment Board RRB Group D Answer Key Updates 2026.'}
                    </p>
                  </div>

                  <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
                    <label className="form-label settings-label">Google Search Console Verification Tag</label>
                    <input
                      type="text"
                      className="form-control settings-input settings-code-input"
                      placeholder='<meta name="google-site-verification" content="XXXXXXXXX" /> or verification token'
                      value={gscVal}
                      onChange={(e) => setGscVal(e.target.value)}
                    />
                    <span className="settings-helper-text">
                      Paste HTML meta tag or verification key provided in Google Search Console ownership verification.
                    </span>
                  </div>
                </div>
              )}

              {/* SECTION 3: MONETIZATION & ADSENSE */}
              {(settingsSectionTab === 'all' || settingsSectionTab === 'ads') && (
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div className="settings-card-icon-title">
                      <div className="settings-section-badge ads">
                        <Tags style={{ width: '18px', height: '18px' }} />
                      </div>
                      <div>
                        <h4 className="settings-section-title">Monetization &amp; Google AdSense</h4>
                        <p className="settings-section-desc">Manage advertising banner placements and custom publisher scripts</p>
                      </div>
                    </div>

                    <div className="settings-ad-status-pill-wrap">
                      <span className={`ad-status-live-pill ${adsStatusVal === '1' ? 'active' : 'disabled'}`}>
                        <span className="ad-status-dot"></span>
                        <span>{adsStatusVal === '1' ? 'Ads Active & Serving' : 'Ads Disabled (Hidden)'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label settings-label">AdSense Master Banner Status</label>
                    <select
                      className="form-control settings-select"
                      value={adsStatusVal}
                      onChange={(e) => setAdsStatusVal(e.target.value)}
                    >
                      <option value="1">🟢 Enabled (Show Ads across all website pages)</option>
                      <option value="0">🔴 Disabled (Temporarily hide all ad banners)</option>
                    </select>
                  </div>

                  <div className="settings-grid-2col">
                    <div className="form-group">
                      <div className="settings-code-label-strip">
                        <label className="form-label settings-label">Header Ad Code (Script / Auto-Ads)</label>
                        <span className="settings-code-tag">&lt;head&gt; script</span>
                      </div>
                      <textarea
                        rows={4}
                        className="form-control settings-textarea settings-code-textarea"
                        placeholder="<script async src='https://pagead2.googlesyndication.com/...'></script>"
                        value={adHeaderVal}
                        onChange={(e) => setAdHeaderVal(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <div className="settings-code-label-strip">
                        <label className="form-label settings-label">Top Banner Ad Code (728x90)</label>
                        <span className="settings-code-tag">Above Content</span>
                      </div>
                      <textarea
                        rows={4}
                        className="form-control settings-textarea settings-code-textarea"
                        placeholder="Paste your top banner ad HTML/JS code here..."
                        value={adTopVal}
                        onChange={(e) => setAdTopVal(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <div className="settings-code-label-strip">
                        <label className="form-label settings-label">Bottom Banner Ad Code</label>
                        <span className="settings-code-tag">Footer / End</span>
                      </div>
                      <textarea
                        rows={4}
                        className="form-control settings-textarea settings-code-textarea"
                        placeholder="Paste your footer or article bottom ad code here..."
                        value={adBottomVal}
                        onChange={(e) => setAdBottomVal(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <div className="settings-code-label-strip">
                        <label className="form-label settings-label">Sidebar Ad Code (300x250)</label>
                        <span className="settings-code-tag">Sidebar Widget</span>
                      </div>
                      <textarea
                        rows={4}
                        className="form-control settings-textarea settings-code-textarea"
                        placeholder="Paste your 300x250 or responsive sidebar ad code here..."
                        value={adSidebarVal}
                        onChange={(e) => setAdSidebarVal(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: INTEGRATIONS & API KEYS */}
              {(settingsSectionTab === 'all' || settingsSectionTab === 'integrations') && (
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div className="settings-card-icon-title">
                      <div className="settings-section-badge integrations">
                        <Code style={{ width: '18px', height: '18px' }} />
                      </div>
                      <div>
                        <h4 className="settings-section-title">Integrations &amp; API Keys</h4>
                        <p className="settings-section-desc">Connect Google Analytics 4, TinyMCE Cloud editor, and OneSignal Push notifications</p>
                      </div>
                    </div>
                  </div>

                  <div className="settings-grid-2col">
                    <div className="form-group">
                      <label className="form-label settings-label">Google Analytics 4 Measurement ID</label>
                      <input
                        type="text"
                        className="form-control settings-input settings-code-input"
                        placeholder="G-XXXXXXXXXX"
                        value={gaVal}
                        onChange={(e) => setGaVal(e.target.value)}
                      />
                      <span className="settings-helper-text">GA4 Measurement ID starts with 'G-'</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label settings-label">TinyMCE Cloud API Key</label>
                      <input
                        type="text"
                        className="form-control settings-input settings-code-input"
                        placeholder="Optional TinyMCE Cloud API Key"
                        value={tinymceApiKeyVal}
                        onChange={(e) => setTinymceApiKeyVal(e.target.value)}
                      />
                      <span className="settings-helper-text">Leave blank to use CDN TinyMCE editor</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label settings-label">OneSignal App ID</label>
                      <input
                        type="text"
                        className="form-control settings-input settings-code-input"
                        placeholder="OneSignal App ID (UUID format)"
                        value={oneSignalAppIdVal}
                        onChange={(e) => setOneSignalAppIdVal(e.target.value)}
                      />
                      <span className="settings-helper-text">App ID used for browser web push notifications</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label settings-label">OneSignal REST API Key</label>
                      <input
                        type="password"
                        className="form-control settings-input settings-code-input"
                        placeholder="OneSignal REST API Key"
                        value={oneSignalApiKeyVal}
                        onChange={(e) => setOneSignalApiKeyVal(e.target.value)}
                      />
                      <span className="settings-helper-text">Required to broadcast push notifications from admin panel</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: SEARCH ENGINE CRAWLERS & ROBOTS.TXT */}
              {(settingsSectionTab === 'all' || settingsSectionTab === 'robots') && (
                <div className="settings-card">
                  <div className="settings-card-header">
                    <div className="settings-card-icon-title">
                      <div className="settings-section-badge robots">
                        <FileText style={{ width: '18px', height: '18px' }} />
                      </div>
                      <div>
                        <h4 className="settings-section-title">Robots.txt &amp; Search Engine Indexing</h4>
                        <p className="settings-section-desc">Control search bot crawling rules, sitemaps, and restricted paths</p>
                      </div>
                    </div>

                    {/* Presets */}
                    <div className="robots-preset-buttons">
                      <button
                        type="button"
                        className="robots-preset-btn"
                        onClick={() => {
                          setRobotsTxtVal(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://rrbgroupdanswerkey.pages.dev/sitemap.xml`);
                          showSuccess('Recommended robots.txt preset loaded!');
                        }}
                        title="Load recommended SEO robots.txt preset"
                      >
                        <RotateCcw style={{ width: '12px', height: '12px' }} />
                        <span>Recommended Preset</span>
                      </button>
                      <button
                        type="button"
                        className="robots-preset-btn"
                        onClick={() => {
                          setRobotsTxtVal(`User-agent: *\nAllow: /`);
                          showSuccess('Allow-all robots.txt loaded!');
                        }}
                      >
                        <span>Allow All</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div className="settings-code-label-strip">
                      <label className="form-label settings-label">Robots.txt Content</label>
                      <span className="settings-code-tag">plain text</span>
                    </div>
                    <textarea
                      rows={6}
                      className="form-control settings-textarea settings-code-textarea"
                      value={robotsTxtVal}
                      onChange={(e) => setRobotsTxtVal(e.target.value)}
                    />
                    <span className="settings-helper-text">
                      Served publicly at <code>https://rrbgroupdanswerkey.pages.dev/robots.txt</code> for search engine crawlers.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Bottom Desktop Save Actions Bar */}
            <div className="settings-bottom-actions-bar">
              <div className="settings-bottom-info">
                <CheckCircle style={{ width: '15px', height: '15px', color: '#10b981' }} />
                <span>All changes will be applied immediately across your live website</span>
              </div>
              <div className="settings-bottom-btns">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    loadData();
                    showSuccess('Settings reset to latest saved state.');
                  }}
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="btn btn-primary settings-primary-submit-btn"
                >
                  <Save style={{ width: '16px', height: '16px' }} />
                  <span>Save All Settings</span>
                </button>
              </div>
            </div>

            {/* 5. Mobile Fixed Bottom Action Bar (<= 640px) */}
            <div className="settings-mobile-bottom-bar">
              <button
                type="button"
                className="btn btn-secondary settings-mobile-btn-discard"
                onClick={() => {
                  loadData();
                  showSuccess('Settings refreshed!');
                }}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn btn-primary settings-mobile-btn-save"
              >
                <Save style={{ width: '16px', height: '16px' }} />
                <span>Save All Settings</span>
              </button>
            </div>
          </form>
        )}
        </div>
      </main>

      {/* IMAGE PREVIEW LIGHTBOX MODAL */}
      {previewImage && (
        <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="image-preview-header">
              <div className="image-preview-title-block">
                <div className="image-preview-badge-pill">
                  <ImageIcon style={{ width: '13px', height: '13px' }} />
                  <span>Cover Image Preview</span>
                </div>
                <h3 className="image-preview-title" title={previewImage.title}>
                  {previewImage.title}
                </h3>
                {previewImage.slug && (
                  <div className="image-preview-slug">/{previewImage.slug}</div>
                )}
              </div>
              <button
                type="button"
                className="image-preview-close-btn"
                onClick={() => setPreviewImage(null)}
                aria-label="Close image preview"
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Body */}
            <div className="image-preview-body">
              <div className="image-preview-frame">
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="image-preview-img"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const errEl = (e.target as HTMLElement).parentElement?.querySelector('.image-preview-broken');
                    if (errEl) (errEl as HTMLElement).style.display = 'flex';
                  }}
                />
                <div className="image-preview-broken" style={{ display: 'none' }}>
                  <AlertCircle style={{ width: '36px', height: '36px', color: '#ef4444' }} />
                  <p style={{ color: '#cbd5e1', marginTop: '10px', fontSize: '0.9rem' }}>
                    Unable to load preview for this image URL.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="image-preview-footer">
              <div className="image-preview-meta-info">
                <span className="image-url-preview-tag" title={previewImage.url}>
                  {previewImage.url.startsWith('data:')
                    ? 'Uploaded File (Base64 Encoded)'
                    : previewImage.url}
                </span>
              </div>
              <div className="image-preview-footer-btns">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(previewImage.url);
                    setCopiedImageLink(true);
                    setTimeout(() => setCopiedImageLink(false), 2000);
                  }}
                >
                  {copiedImageLink ? (
                    <>
                      <Check style={{ width: '14px', height: '14px', color: '#34d399' }} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy style={{ width: '14px', height: '14px' }} />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                {!previewImage.url.startsWith('data:') && (
                  <a
                    href={previewImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <ExternalLink style={{ width: '14px', height: '14px' }} />
                    <span>Open Full</span>
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setPreviewImage(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <FolderOpen style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0, fontSize: '1.1rem' }}>
                    {catModalMode === 'add' ? 'Add New Category' : 'Edit Category Name'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                    {catModalMode === 'add' ? 'Create a new classification for articles' : 'Update the display name of this category'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowCatModal(false)}
                title="Close modal"
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <form onSubmit={catModalMode === 'add' ? handleAddCategorySubmit : handleEditCategorySubmit}>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Category Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Exam Notifications"
                  value={catInputName}
                  onChange={(e) => setCatInputName(e.target.value)}
                  autoFocus
                />
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                  Keep the name clear, unique, and concise for readers.
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCatModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  {catModalMode === 'add' ? 'Add Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MENU ITEM MODAL */}
      {showMenuModal && (
        <div className="modal-overlay" onClick={() => setShowMenuModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                  <Navigation style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0, fontSize: '1.1rem' }}>
                    {menuModalMode === 'add' ? 'Add Header Navigation Link' : 'Edit Menu Link'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                    {menuModalMode === 'add' ? 'Add a new clickable item to the portal header' : 'Update the title or destination link'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowMenuModal(false)}
                title="Close modal"
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <form onSubmit={menuModalMode === 'add' ? handleAddMenuSubmit : handleEditMenuSubmit}>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Menu Link Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Answer Key"
                  value={menuInputTitle}
                  onChange={(e) => setMenuInputTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Destination URL / Link <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="/answer-key/ or https://example.com"
                  value={menuInputUrl}
                  onChange={(e) => setMenuInputUrl(e.target.value)}
                />
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                  Use relative paths like <code>/answer-key/</code> or full external links like <code>https://...</code>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMenuModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  {menuModalMode === 'add' ? 'Add Navigation Link' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW LIGHTBOX MODAL */}
      {previewImage && (
        <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="image-preview-header">
              <div className="image-preview-title-block">
                <div className="image-preview-badge-pill">
                  <ImageIcon style={{ width: '13px', height: '13px' }} />
                  <span>Cover Image Preview</span>
                </div>
                <h3 className="image-preview-title">{previewImage.title}</h3>
                {previewImage.slug && (
                  <div className="image-preview-slug">/{previewImage.slug}</div>
                )}
              </div>
              <button
                type="button"
                className="image-preview-close-btn"
                onClick={() => setPreviewImage(null)}
                aria-label="Close image preview"
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div className="image-preview-body">
              <div className="image-preview-frame">
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="image-preview-img"
                />
              </div>
            </div>

            <div className="image-preview-footer">
              <div className="image-preview-meta-info">
                <span className="image-url-preview-tag" title={previewImage.url}>
                  {previewImage.url.startsWith('data:')
                    ? 'Uploaded File (Base64 Data)'
                    : previewImage.url}
                </span>
              </div>
              <div className="image-preview-footer-btns">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(previewImage.url);
                    setCopiedImageLink(true);
                    setTimeout(() => setCopiedImageLink(false), 2000);
                  }}
                >
                  {copiedImageLink ? (
                    <>
                      <Check style={{ width: '14px', height: '14px', color: '#10b981' }} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy style={{ width: '14px', height: '14px' }} />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                {!previewImage.url.startsWith('data:') && (
                  <a
                    href={previewImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <ExternalLink style={{ width: '14px', height: '14px' }} />
                    <span>Open Full</span>
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setPreviewImage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
