export interface Post {
  id: number;
  title: string;
  slug: string;
  cover_image?: string | null;
  content: string;
  excerpt?: string | null;
  category: string;
  status: 'publish' | 'draft';
  views?: number;
  created_at: string;
  tags?: string | null;
  author_name?: string | null;
}

export interface Setting {
  setting_key: string;
  setting_value: string;
}

export interface MenuItem {
  title: string;
  url: string;
  visible: number; // 1 = Visible, 0 = Hidden
}

export interface CategoryItem {
  name: string;
  post_count: number;
  is_hidden: boolean;
}

export interface CommentItem {
  id: number;
  post_id: number;
  post_title?: string;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
  status?: 'approved' | 'pending';
}

export interface SubscriberItem {
  id: number;
  email: string;
  created_at: string;
}
