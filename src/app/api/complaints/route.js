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

    // Students can only see their own complaints
    if (session.user.role === 'student') {
      query.submittedBy = session.user.id;
    }

    // Staff can see:
    //  1. Complaints explicitly assigned to them
    //  2. Unassigned complaints (assignedTo: null) — "tidak pasti" or pending assignment
    if (session.user.role === 'staff') {
      query.$or = [
        { assignedTo: session.user.id },
        { assignedTo: null },
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
    const { title, description, category, priority, attachments, targetDepartment } = body;

    // ── Create the complaint (unassigned first) ──
    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      submittedBy: session.user.id,
      attachments: attachments || [],
      assignedTo: null,
    });

    const User = (await import('@/models/User')).default;

    // ── Auto-assign to staff based on targetDepartment ──
    // If targetDepartment is provided and is not 'tidak_pasti', find a matching staff member.
    if (targetDepartment && targetDepartment !== 'tidak_pasti') {
      const matchingStaff = await User.find({ role: 'staff', department: targetDepartment });

      if (matchingStaff.length > 0) {
        // Pick a random staff member from the matching pool
        const assignedStaff = matchingStaff[Math.floor(Math.random() * matchingStaff.length)];

        // Update the complaint with the assigned staff
        complaint.assignedTo = assignedStaff._id;
        await complaint.save();

        // Notify the assigned staff member
        await Notification.create({
          userId: assignedStaff._id,
          title: 'Aduan Baharu Ditugaskan',
          message: `Aduan "${title}" telah ditugaskan kepada anda untuk diselesaikan.`,
          type: 'new_assignment',
          relatedComplaint: complaint._id,
        });
      }
      // If no matching staff found for the department, complaint remains unassigned (null)
      // and will be visible to all staff until an admin manually assigns it.
    }
    // If targetDepartment is 'tidak_pasti' or not provided, assignedTo stays null.
    // All staff will be able to see it in their dashboard.

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
