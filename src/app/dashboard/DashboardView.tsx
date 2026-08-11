'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post, MenuItem, CommentItem, SubscriberItem } from '@/lib/types';
import {
  ShieldCheck,
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
} from 'lucide-react';

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

  // Data states
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'publish' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Post Editor state
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Notification');
  const [status, setStatus] = useState<'publish' | 'draft'>('publish');
  const [coverImage, setCoverImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');

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

  // Load All Data
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Posts
      const postsRes = await fetch(`${API_BASE}/api/posts?status=all`, { cache: 'no-store' });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }

      // 2. Fetch Settings
      const settingsRes = await fetch(`${API_BASE}/api/settings`, { cache: 'no-store' });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
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

      // 3. Fetch Comments
      const commentsRes = await fetch(`${API_BASE}/api/comments`, { cache: 'no-store' });
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      }

      // 4. Fetch Subscribers
      const subRes = await fetch(`${API_BASE}/api/subscribers`, { cache: 'no-store' });
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscribers(subData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const targetUrl = tab === 'dashboard' ? '/dashboard/' : `/dashboard/${tab}/`;
    router.push(targetUrl);
  };

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
      const params = new URLSearchParams(window.location.search);
      const paramId = params.get('id');
      if (paramId) {
        const targetPost = posts.find((p) => String(p.id) === String(paramId));
        if (targetPost) {
          setEditId(targetPost.id);
          setTitle(targetPost.title);
          setSlug(targetPost.slug);
          setCategory(targetPost.category);
          setStatus(targetPost.status);
          setCoverImage(targetPost.cover_image || '');
          setExcerpt(targetPost.excerpt || '');
          setContent(targetPost.content || '');
          setMetaTitle(targetPost.title);
          setMetaDesc(targetPost.excerpt || '');
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
    setCategory('Notification');
    setStatus('publish');
    setCoverImage('');
    setExcerpt('');
    setContent('');
    setMetaTitle('');
    setMetaDesc('');
    handleTabChange('add');
  };

  const handleEditPost = (p: Post) => {
    setEditId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setCategory(p.category);
    setStatus(p.status);
    setCoverImage(p.cover_image || '');
    setExcerpt(p.excerpt || '');
    setContent(p.content || '');
    setMetaTitle(p.title);
    setMetaDesc(p.excerpt || '');
    setActiveTab('edit');
    router.push(`/dashboard/edit/?id=${p.id}`);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showError('Title and Content are required!');
      return;
    }

    const finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    try {
      const res = await fetch(`${API_BASE}/api/admin/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editId || undefined,
          title,
          slug: finalSlug,
          category,
          status,
          cover_image: coverImage,
          excerpt,
          content,
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
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === 'publish').length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalSubscribers = subscribers.length;

  // Filtered Posts
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="admin-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <ShieldCheck style={{ width: '28px', height: '28px', color: '#3b82f6' }} />
          <span>AuraAdmin</span>
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
              className={`sidebar-link ${activeTab === 'add' && !editId ? 'active' : ''}`}
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
              <span>Comments ({comments.length})</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-link ${activeTab === 'subscribers' ? 'active' : ''}`}
              onClick={() => handleTabChange('subscribers')}
            >
              <Users style={{ width: '18px', height: '18px' }} />
              <span>Subscribers ({subscribers.length})</span>
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
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main">
        {/* HEADER BAR */}
        <div className="admin-header">
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <a
              href="https://rrbgroupdanswerkey.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <Globe style={{ width: '16px', height: '16px' }} /> View Live Website
            </a>
            <button
              onClick={() => router.push('/')}
              className="btn"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} /> Logout
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

            {/* Quick Overview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
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

              {/* Quick Actions Card */}
              <div className="admin-card">
                <h3 style={{ fontSize: '1.1rem', color: 'white', marginTop: 0, marginBottom: '20px', fontWeight: 700 }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button className="btn btn-primary" onClick={handleOpenAddForm} style={{ justifyContent: 'center', width: '100%' }}>
                    <PlusCircle style={{ width: '18px', height: '18px' }} /> Create New Article
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleTabChange('categories')} style={{ justifyContent: 'center', width: '100%' }}>
                    <Tags style={{ width: '18px', height: '18px' }} /> Manage Categories
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleTabChange('menu')} style={{ justifyContent: 'center', width: '100%' }}>
                    <MenuIcon style={{ width: '18px', height: '18px' }} /> Manage Header Menu
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleTabChange('settings')} style={{ justifyContent: 'center', width: '100%' }}>
                    <Settings style={{ width: '18px', height: '18px' }} /> Website Settings
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: ALL ARTICLES LIST */}
        {activeTab === 'list' && (
          <div className="admin-card">
            {/* Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '25px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
                <select className="form-control" value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)} style={{ width: '140px' }}>
                  <option value="all">All Status</option>
                  <option value="publish">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: '160px' }}>
                  <option value="all">All Categories</option>
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary" onClick={handleOpenAddForm}>
                <PlusCircle style={{ width: '18px', height: '18px' }} /> Add Article
              </button>
            </div>

            {/* Articles Table */}
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Article Title</th>
                    <th>Category</th>
                    <th>Views</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No articles found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'white', marginBottom: '2px' }}>{p.title}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>/{p.slug}</div>
                        </td>
                        <td>
                          <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, border: '1px solid #1e293b' }}>
                            {p.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{(p.views || 0).toLocaleString()}</td>
                        <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{p.created_at ? p.created_at.split(' ')[0] : 'Today'}</td>
                        <td>
                          <span className={`status-badge ${p.status}`}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <a href={`https://rrbgroupdanswerkey.pages.dev/${p.slug}`} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Preview Article">
                              <ExternalLink style={{ width: '15px', height: '15px' }} />
                            </a>
                            <button className="btn-icon btn-edit" title="Edit Article" onClick={() => handleEditPost(p)}>
                              <Edit3 style={{ width: '15px', height: '15px' }} />
                            </button>
                            <button className="btn-icon btn-delete" title="Delete Article" onClick={() => handleDeletePost(p.id)}>
                              <Trash2 style={{ width: '15px', height: '15px' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ADD / EDIT ARTICLE FORM */}
        {(activeTab === 'add' || activeTab === 'edit') && (
          <form onSubmit={handleSavePost} className="admin-card">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
              {/* Left Column: Title & Content */}
              <div>
                <div className="form-group">
                  <label className="form-label">Article Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. RRB Group D Answer Key 2026 Direct Link Released"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editId && !slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Custom Slug / Permalink *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="rrb-group-d-answer-key-2026-link"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Excerpt / Summary</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Brief description of the article for cards and search engines..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Article Content (HTML / Rich Text) *</label>
                  <textarea
                    rows={16}
                    required
                    className="form-control"
                    placeholder="Write article HTML content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.5' }}
                  ></textarea>
                </div>
              </div>

              {/* Right Column: Settings & Publishing */}
              <div>
                <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '1rem', color: 'white', marginTop: 0, marginBottom: '15px' }}>Publish Settings</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                      {categoriesList.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={status} onChange={(e: any) => setStatus(e.target.value)}>
                      <option value="publish">Publish Immediately</option>
                      <option value="draft">Save as Draft</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cover Image URL</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://..."
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                    <Save style={{ width: '18px', height: '18px' }} /> {editId ? 'Update Article' : 'Publish Article'}
                  </button>
                </div>

                {/* SEO Meta Box */}
                <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ fontSize: '1rem', color: 'white', marginTop: 0, marginBottom: '15px' }}>SEO Meta Settings</h4>
                  <div className="form-group">
                    <label className="form-label">Meta Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="SEO Title..."
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Meta Description</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      placeholder="SEO Description..."
                      value={metaDesc}
                      onChange={(e) => setMetaDesc(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 4: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'white', margin: 0, fontWeight: 700 }}>Categories Overview</h3>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setCatModalMode('add');
                  setCatInputName('');
                  setShowCatModal(true);
                }}
              >
                <PlusCircle style={{ width: '16px', height: '16px' }} /> Add New Category
              </button>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Articles Count</th>
                    <th>Visibility Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesList.map((cat) => {
                    const count = posts.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
                    const isHidden = hiddenCategoriesList.some((c) => c.toLowerCase() === cat.toLowerCase());
                    return (
                      <tr key={cat}>
                        <td style={{ fontWeight: 700, color: 'white' }}>{cat}</td>
                        <td>
                          <span style={{ background: '#0f172a', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #334155' }}>
                            {count} articles
                          </span>
                        </td>
                        <td>
                          {isHidden ? (
                            <span className="status-badge draft"><EyeOff style={{ width: '12px', height: '12px' }} /> Hidden</span>
                          ) : (
                            <span className="status-badge publish"><Eye style={{ width: '12px', height: '12px' }} /> Visible</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              className="btn-icon"
                              title={isHidden ? 'Show Category' : 'Hide Category'}
                              onClick={() => handleToggleCategoryVisibility(cat)}
                              style={{ background: isHidden ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isHidden ? '#4ade80' : '#f87171' }}
                            >
                              {isHidden ? <Eye style={{ width: '15px', height: '15px' }} /> : <EyeOff style={{ width: '15px', height: '15px' }} />}
                            </button>
                            <button
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
                            <button className="btn-icon btn-delete" title="Delete Category" onClick={() => handleDeleteCategory(cat)}>
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
          </div>
        )}

        {/* TAB 5: HEADER MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'white', margin: 0, fontWeight: 700 }}>Header Navigation Menu</h3>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setMenuModalMode('add');
                  setMenuInputTitle('');
                  setMenuInputUrl('');
                  setShowMenuModal(true);
                }}
              >
                <PlusCircle style={{ width: '16px', height: '16px' }} /> Add Menu Item
              </button>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Menu Title</th>
                    <th>Destination Link (URL)</th>
                    <th>Visibility</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuList.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'white' }}>{item.title}</td>
                      <td style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.85rem' }}>{item.url}</td>
                      <td>
                        {item.visible === 1 ? (
                          <span className="status-badge publish"><Eye style={{ width: '12px', height: '12px' }} /> Visible</span>
                        ) : (
                          <span className="status-badge draft"><EyeOff style={{ width: '12px', height: '12px' }} /> Hidden</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {idx > 0 && (
                            <button className="btn-icon" title="Move Up" onClick={() => handleMoveMenu(idx, 'up')} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                              <ArrowUp style={{ width: '15px', height: '15px' }} />
                            </button>
                          )}
                          {idx < menuList.length - 1 && (
                            <button className="btn-icon" title="Move Down" onClick={() => handleMoveMenu(idx, 'down')} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                              <ArrowDown style={{ width: '15px', height: '15px' }} />
                            </button>
                          )}
                          <button
                            className="btn-icon"
                            title={item.visible === 1 ? 'Hide Link' : 'Show Link'}
                            onClick={() => handleToggleMenuVisibility(idx)}
                            style={{ background: item.visible === 1 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: item.visible === 1 ? '#f87171' : '#4ade80' }}
                          >
                            {item.visible === 1 ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                          </button>
                          <button
                            className="btn-icon btn-edit"
                            title="Edit Link"
                            onClick={() => {
                              setMenuModalMode('edit');
                              setMenuEditIndex(idx);
                              setMenuInputTitle(item.title);
                              setMenuInputUrl(item.url);
                              setShowMenuModal(true);
                            }}
                          >
                            <Edit3 style={{ width: '15px', height: '15px' }} />
                          </button>
                          <button className="btn-icon btn-delete" title="Delete Link" onClick={() => handleDeleteMenuItem(idx)}>
                            <Trash2 style={{ width: '15px', height: '15px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  {comments.length === 0 ? (
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
              <h3 style={{ fontSize: '1.1rem', color: 'white', margin: 0, fontWeight: 700 }}>Email Subscribers ({subscribers.length})</h3>
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
                  {subscribers.length === 0 ? (
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
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="admin-card">
            <h3 style={{ fontSize: '1.2rem', color: 'white', marginTop: 0, marginBottom: '25px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              General & SEO Configurations
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Site Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={siteTitleVal}
                  onChange={(e) => setSiteTitleVal(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Site Tagline</label>
                <input
                  type="text"
                  className="form-control"
                  value={siteTaglineVal}
                  onChange={(e) => setSiteTaglineVal(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Site Logo Image URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={siteLogoVal}
                  onChange={(e) => setSiteLogoVal(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Site Favicon Image URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={siteFaviconVal}
                  onChange={(e) => setSiteFaviconVal(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Site Description</label>
              <textarea
                rows={3}
                className="form-control"
                value={siteDescVal}
                onChange={(e) => setSiteDescVal(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Default Meta Description</label>
              <textarea
                rows={3}
                className="form-control"
                value={defaultMetaDescVal}
                onChange={(e) => setDefaultMetaDescVal(e.target.value)}
              ></textarea>
            </div>

            <h3 style={{ fontSize: '1.2rem', color: 'white', marginTop: '30px', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              Monetization & AdSense Settings
            </h3>

            <div className="form-group">
              <label className="form-label">AdSense Banner Status</label>
              <select className="form-control" value={adsStatusVal} onChange={(e) => setAdsStatusVal(e.target.value)}>
                <option value="1">Enabled (Show Ads)</option>
                <option value="0">Disabled (Hide Ads)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Header Ad Code (Script)</label>
                <textarea rows={3} className="form-control" value={adHeaderVal} onChange={(e) => setAdHeaderVal(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Top Banner Ad Code (728x90)</label>
                <textarea rows={3} className="form-control" value={adTopVal} onChange={(e) => setAdTopVal(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Bottom Ad Code</label>
                <textarea rows={3} className="form-control" value={adBottomVal} onChange={(e) => setAdBottomVal(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Sidebar Ad Code (300x250)</label>
                <textarea rows={3} className="form-control" value={adSidebarVal} onChange={(e) => setAdSidebarVal(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}></textarea>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', color: 'white', marginTop: '30px', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              Integrations, API Keys & Robots.txt
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">TinyMCE API Key</label>
                <input type="text" className="form-control" value={tinymceApiKeyVal} onChange={(e) => setTinymceApiKeyVal(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Google Search Console Tag</label>
                <input type="text" className="form-control" value={gscVal} onChange={(e) => setGscVal(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">OneSignal App ID</label>
                <input type="text" className="form-control" value={oneSignalAppIdVal} onChange={(e) => setOneSignalAppIdVal(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">OneSignal REST API Key</label>
                <input type="text" className="form-control" value={oneSignalApiKeyVal} onChange={(e) => setOneSignalApiKeyVal(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Robots.txt Content</label>
              <textarea rows={4} className="form-control" value={robotsTxtVal} onChange={(e) => setRobotsTxtVal(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}></textarea>
            </div>

            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px' }}>
                <Save style={{ width: '18px', height: '18px' }} /> Save All Settings
              </button>
            </div>
          </form>
        )}
      </main>

      {/* CATEGORY MODAL */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{catModalMode === 'add' ? 'Add New Category' : 'Edit Category Name'}</h3>
              <button className="btn-icon" onClick={() => setShowCatModal(false)}>&times;</button>
            </div>
            <form onSubmit={catModalMode === 'add' ? handleAddCategorySubmit : handleEditCategorySubmit}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Exam Notifications"
                  value={catInputName}
                  onChange={(e) => setCatInputName(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCatModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{catModalMode === 'add' ? 'Add Category' : 'Save Name'}</button>
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
              <h3 className="modal-title">{menuModalMode === 'add' ? 'Add Header Menu Link' : 'Edit Menu Link'}</h3>
              <button className="btn-icon" onClick={() => setShowMenuModal(false)}>&times;</button>
            </div>
            <form onSubmit={menuModalMode === 'add' ? handleAddMenuSubmit : handleEditMenuSubmit}>
              <div className="form-group">
                <label className="form-label">Menu Item Title *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Answer Key"
                  value={menuInputTitle}
                  onChange={(e) => setMenuInputTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Destination URL *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="/answer-key/"
                  value={menuInputUrl}
                  onChange={(e) => setMenuInputUrl(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMenuModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{menuModalMode === 'add' ? 'Add Link' : 'Save Link'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
