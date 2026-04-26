import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import Notification from '@/models/Notification';

// GET single complaint
export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    const complaint = await Complaint.findById(id)
      .populate('submittedBy', 'name email studentId department')
      .populate('assignedTo', 'name email department')
      .populate('responses.respondedBy', 'name email role');

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json(complaint);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update complaint
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();
    const { status, assignedTo, response, priority, feedback } = body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Update status
    if (status) {
      complaint.status = status;

      // Notify student about status change
      await Notification.create({
        userId: complaint.submittedBy,
        title: 'Complaint Status Updated',
        message: `Your complaint "${complaint.title}" status has been changed to "${status}".`,
        type: 'status_update',
        relatedComplaint: complaint._id,
      });
    }

    // Assign to staff
    if (assignedTo) {
      complaint.assignedTo = assignedTo;

      // Notify assigned staff
      await Notification.create({
        userId: assignedTo,
        title: 'New Complaint Assigned',
        message: `A complaint "${complaint.title}" has been assigned to you.`,
        type: 'new_assignment',
        relatedComplaint: complaint._id,
      });
    }

    // Add response
    if (response) {
      complaint.responses.push({
        message: response,
        respondedBy: session.user.id,
      });

      // Notify student about new response
      if (session.user.id !== complaint.submittedBy.toString()) {
        await Notification.create({
          userId: complaint.submittedBy,
          title: 'New Response on Complaint',
          message: `A new response has been added to your complaint "${complaint.title}".`,
          type: 'new_response',
          relatedComplaint: complaint._id,
        });
      }
    }

    // Update priority
    if (priority) {
      complaint.priority = priority;
    }

    // Add feedback (students only)
    if (feedback) {
      complaint.feedback = feedback;
    }

    await complaint.save();

    const updated = await Complaint.findById(id)
      .populate('submittedBy', 'name email studentId department')
      .populate('assignedTo', 'name email department')
      .populate('responses.respondedBy', 'name email role');

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE complaint
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    await Complaint.findByIdAndDelete(id);
    await Notification.deleteMany({ relatedComplaint: id });

    return NextResponse.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
