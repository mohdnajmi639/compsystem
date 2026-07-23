import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

// GET notifications for current user
export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await Notification.find({ userId: session.user.id })
      .populate('relatedComplaint', 'title status')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: session.user.id,
      read: false,
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT mark notifications as read
export async function PUT(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (notificationIds && notificationIds.length > 0) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, userId: session.user.id },
        { read: true },
      );
    } else {
      // Mark all as read
      await Notification.updateMany(
        { userId: session.user.id, read: false },
        { read: true },
      );
    }

    return NextResponse.json({ message: 'Notifications marked as read' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
