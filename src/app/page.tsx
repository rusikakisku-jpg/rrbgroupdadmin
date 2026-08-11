'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid username or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f8fafc' }}>
      <div style={{ width: '90%', maxWidth: '420px' }}>
        
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '40px 30px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(11, 105, 255, 0.1)', color: '#0066ff', width: '50px', height: '50px', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
              <ShieldCheck style={{ width: '26px', height: '26px' }} />
            </div>
            <h1 style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 800, marginBottom: '5px' }}>
              AuraAdmin Login
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              Sign in securely to manage your blog posts
            </p>
          </div>

          {error && (
            <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle style={{ flexShrink: 0, width: '18px', height: '18px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1' }}>
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#0066ff', border: 'none', borderRadius: '6px', color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In Securely'} <ArrowRight style={{ width: '18px', height: '18px' }} />
            </button>
          </form>

          <div style={{ marginTop: '25px', padding: '12px', background: '#0f172a', borderRadius: '6px', border: '1px solid #334155', fontSize: '0.8rem', color: '#94a3b8' }}>
            Default Admin: <code style={{ color: '#38bdf8' }}>admin</code> / <code style={{ color: '#38bdf8' }}>Admin@12345</code>
          </div>

        </div>

      </div>
    </div>
  );
}
