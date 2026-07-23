import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import ComplaintResponse from '@/models/ComplaintResponse';
import Notification from '@/models/Notification';

// GET single complaint + its responses
export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const unwrappedParams = await params;
    const id = unwrappedParams.id;

    const complaint = await Complaint.findById(id)
      .populate('submittedBy', 'name email studentId department')
      .populate('assignedTo', 'name email department')
      .populate('categoryId', 'name');

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 },
      );
    }

    // Fetch responses from the separate collection
    const responses = await ComplaintResponse.find({ complaintId: id })
      .populate('respondedBy', 'name email role')
      .sort({ createdAt: 1 });

    // Attach responses to the complaint object
    const complaintObj = complaint.toObject();
    complaintObj.responses = responses;

    return NextResponse.json(complaintObj);
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

    const unwrappedParams = await params;
    const id = unwrappedParams.id;
    const body = await request.json();
    const { status, assignedTo, response, priority, feedback } = body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 },
      );
    }

    // Update status
    if (status) {
      complaint.status = status;

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

      await Notification.create({
        userId: assignedTo,
        title: 'New Complaint Assigned',
        message: `A complaint "${complaint.title}" has been assigned to you.`,
        type: 'new_assignment',
        relatedComplaint: complaint._id,
      });
    }

    // Add response — saved to separate ComplaintResponse collection
    if (response) {
      await ComplaintResponse.create({
        complaintId: id,
        message: response,
        respondedBy: session.user.id,
        status: status || complaint.status,
      });

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

    // Add feedback (students only) — stored as flat fields
    if (feedback) {
      complaint.feedbackRating = feedback.rating;
      complaint.feedbackComment = feedback.comment;
    }

    await complaint.save();

    // Refetch with populated fields and attach responses
    const updated = await Complaint.findById(id)
      .populate('submittedBy', 'name email studentId department')
      .populate('assignedTo', 'name email department')
      .populate('categoryId', 'name');

    const responses = await ComplaintResponse.find({ complaintId: id })
      .populate('respondedBy', 'name email role')
      .sort({ createdAt: 1 });

    const updatedObj = updated.toObject();
    updatedObj.responses = responses;

    return NextResponse.json(updatedObj);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE complaint + its responses
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const unwrappedParams = await params;
    const id = unwrappedParams.id;

    await Complaint.findByIdAndDelete(id);
    await ComplaintResponse.deleteMany({ complaintId: id });
    await Notification.deleteMany({ relatedComplaint: id });

    return NextResponse.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
