import { NextResponse } from 'next/server';
import { getSubscribers, deleteSubscriber, addSubscriber } from '@/lib/db';

export async function GET() {
  try {
    const subscribers = getSubscribers();
    return NextResponse.json(subscribers);
  } catch (err) {
    console.error('Error fetching subscribers:', err);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, email } = body || {};

    if (action === 'delete' && id) {
      const success = deleteSubscriber(Number(id));
      if (success) {
        return NextResponse.json({ success: true, message: 'Subscriber removed successfully' });
      }
      return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 400 });
    }

    if (action === 'add' && email) {
      const success = addSubscriber(String(email));
      if (success) {
        return NextResponse.json({ success: true, message: 'Subscriber added successfully' });
      }
      return NextResponse.json({ error: 'Failed to add subscriber' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Invalid action or parameters' }, { status: 400 });
  } catch (err) {
    console.error('Error modifying subscribers:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
