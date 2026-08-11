import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rrb-secret-key-2026';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === 'admin' && (password === 'Admin@12345' || password === 'admin')) {
      const token = jwt.sign({ username: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
