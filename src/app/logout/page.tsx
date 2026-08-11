'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_logged_in');
      sessionStorage.removeItem('admin_token');
    }
    router.push('/');
  }, [router]);

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
      Logging out...
    </div>
  );
}
