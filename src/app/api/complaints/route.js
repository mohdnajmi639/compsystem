import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import Notification from '@/models/Notification';

// GET all complaints
export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    let query = {};

    // Students and public users can only see their own complaints
    if (session.user.role === 'student' || session.user.role === 'public') {
      query.submittedBy = session.user.id;
    }

    // Staff can see:
    //  1. Complaints targeting their specific department
    //  2. Complaints with 'tidak_pasti' target department (open to all staff)
    if (session.user.role === 'staff') {
      query.$or = [
        { targetDepartment: session.user.department },
        { targetDepartment: 'tidak_pasti' }
      ];
    }

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email studentId')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(complaints);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new complaint
export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      priority,
      attachments,
      targetDepartment,
    } = body;

    // ── Create the complaint ──
    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      submittedBy: session.user.id,
      attachments: attachments || [],
      targetDepartment: targetDepartment || 'tidak_pasti',
      assignedTo: null,
    });

    const User = (await import('@/models/User')).default;

    // ── Always notify admins about every new complaint ──
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        title: 'Aduan Baharu Diterima',
        message: `Aduan baharu "${title}" telah dihantar${complaint.assignedTo ? ' dan telah ditugaskan secara automatik.' : ' (belum ditugaskan).'}`,
        type: 'new_complaint',
        relatedComplaint: complaint._id,
      });
    }

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
