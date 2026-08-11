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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (
        (username.trim() === 'admin' || username.trim() === 'Admin') &&
        (password === 'Admin@12345' || password === 'admin' || password === 'Admin')
      ) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_logged_in', 'true');
          sessionStorage.setItem('admin_token', 'aura_admin_authenticated');
        }
        router.push('/dashboard/');
      } else {
        setError('Invalid username or password.');
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
        
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '40px 30px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', width: '56px', height: '56px', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <ShieldCheck style={{ width: '28px', height: '28px' }} />
            </div>
            <h1 style={{ fontSize: '1.7rem', color: '#ffffff', fontWeight: 800, marginBottom: '6px', fontFamily: 'Outfit, sans-serif' }}>
              AuraAdmin Login
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
              Sign in securely to manage your RRB blog portal
            </p>
          </div>

          {error && (
            <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
              <AlertCircle style={{ flexShrink: 0, width: '18px', height: '18px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>
                Username
              </label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px 16px', color: '#ffffff', fontSize: '0.95rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>
                Password
              </label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px 16px', color: '#ffffff', fontSize: '0.95rem', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
            >
              {loading ? 'Authenticating...' : (
                <>
                  Sign In to Dashboard <ArrowRight style={{ width: '18px', height: '18px' }} />
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
