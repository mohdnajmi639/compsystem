import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import User from '@/models/User';

// GET analytics data (admin only)
export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Total counts
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({
      status: 'Pending',
    });
    const inProgressComplaints = await Complaint.countDocuments({
      status: 'In Progress',
    });
    const resolvedComplaints = await Complaint.countDocuments({
      status: 'Resolved',
    });
    const rejectedComplaints = await Complaint.countDocuments({
      status: 'Rejected',
    });
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalStaff = await User.countDocuments({ role: 'staff' });

    // Complaints by category
    const categoryData = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Complaints by priority
    const priorityData = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Resolution rate
    const resolutionRate =
      totalComplaints > 0
        ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1)
        : 0;

    // Average feedback rating
    const feedbackData = await Complaint.aggregate([
      { $match: { feedbackRating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$feedbackRating' } } },
    ]);

    const avgRating =
      feedbackData.length > 0 ? feedbackData[0].avgRating.toFixed(1) : 'N/A';

    // Recent complaints (all complaints for the table/PDF)
    const recentComplaints = await Complaint.find()
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      overview: {
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        rejectedComplaints,
        totalUsers,
        totalStudents,
        totalStaff,
        resolutionRate,
        avgRating,
      },
      categoryData,
      priorityData,
      monthlyData,
      recentComplaints,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
