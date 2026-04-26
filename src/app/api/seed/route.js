import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Complaint from '@/models/Complaint';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    await connectDB();

    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return NextResponse.json({ message: 'Database already seeded', seeded: false });
    }

    // Create demo users
    const hashedPassword = await bcrypt.hash('student123', 12);
    const hashedStaffPassword = await bcrypt.hash('staff123', 12);
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);

    const student = await User.create({
      name: 'Ahmad Student',
      email: 'student@university.edu',
      password: hashedPassword,
      role: 'student',
      studentId: 'STU001',
      department: 'Computer Science',
    });

    const student2 = await User.create({
      name: 'Siti Learner',
      email: 'student2@university.edu',
      password: hashedPassword,
      role: 'student',
      studentId: 'STU002',
      department: 'Engineering',
    });

    const staff = await User.create({
      name: 'Dr. Rahman Staff',
      email: 'staff@university.edu',
      password: hashedStaffPassword,
      role: 'staff',
      department: 'Student Affairs',
    });

    const staff2 = await User.create({
      name: 'Pn. Aisha Handler',
      email: 'staff2@university.edu',
      password: hashedStaffPassword,
      role: 'staff',
      department: 'Facilities',
    });

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@university.edu',
      password: hashedAdminPassword,
      role: 'admin',
      department: 'Administration',
    });

    // Create demo complaints
    const complaints = await Complaint.create([
      {
        title: 'WiFi Connection Issues in Library',
        description: 'The WiFi in the main library has been extremely slow for the past week. Students cannot access online resources for research. The connection drops every 10-15 minutes, making it impossible to attend online lectures or download materials.',
        category: 'Facility',
        priority: 'High',
        status: 'In Progress',
        submittedBy: student._id,
        assignedTo: staff2._id,
        responses: [
          {
            message: 'We have been notified about this issue. Our IT team is currently investigating the network infrastructure in the library building.',
            respondedBy: staff2._id,
          },
        ],
      },
      {
        title: 'Unfair Grading in Calculus II',
        description: 'I believe the grading for the midterm examination in Calculus II (MTH202) was inconsistent. Several students received different marks for identical solutions. I request a review of the grading process.',
        category: 'Academic',
        priority: 'Medium',
        status: 'Pending',
        submittedBy: student._id,
      },
      {
        title: 'Broken Air Conditioning in Lecture Hall B',
        description: 'The air conditioning in Lecture Hall B has not been working for 2 weeks. Classes during afternoon sessions are unbearable due to the heat. This is affecting students concentration and learning.',
        category: 'Facility',
        priority: 'Urgent',
        status: 'Resolved',
        submittedBy: student2._id,
        assignedTo: staff2._id,
        responses: [
          {
            message: 'We have dispatched a maintenance team to inspect the AC unit.',
            respondedBy: staff2._id,
          },
          {
            message: 'The AC unit has been repaired and is now fully functional. Please let us know if there are any further issues.',
            respondedBy: staff2._id,
          },
        ],
        feedback: {
          rating: 5,
          comment: 'Issue was resolved quickly. Thank you!',
        },
      },
      {
        title: 'Scholarship Payment Delay',
        description: 'My scholarship payment for this semester has been delayed by 2 months. I have already submitted all required documents to the financial office. This delay is causing financial hardship.',
        category: 'Financial',
        priority: 'High',
        status: 'In Progress',
        submittedBy: student2._id,
        assignedTo: staff._id,
        responses: [
          {
            message: 'We are looking into your scholarship application. The delay was caused by a system migration. We expect the payment to be processed within the next 5 business days.',
            respondedBy: staff._id,
          },
        ],
      },
      {
        title: 'Course Registration System Error',
        description: 'The online course registration system keeps showing an error when I try to register for elective courses. Error code: REG-504. I have tried multiple browsers and devices.',
        category: 'Administrative',
        priority: 'Medium',
        status: 'Pending',
        submittedBy: student._id,
      },
      {
        title: 'Parking Lot Safety Concerns',
        description: 'The lighting in Parking Lot C is insufficient, creating safety concerns for students who attend evening classes. Several lights have been broken for months without repair.',
        category: 'Facility',
        priority: 'High',
        status: 'Pending',
        submittedBy: student2._id,
      },
    ]);

    // Create demo notifications
    await Notification.create([
      {
        userId: admin._id,
        title: 'New Complaint Submitted',
        message: 'A new complaint "WiFi Connection Issues in Library" has been submitted.',
        type: 'new_complaint',
        relatedComplaint: complaints[0]._id,
        read: false,
      },
      {
        userId: student._id,
        title: 'Complaint Status Updated',
        message: 'Your complaint "WiFi Connection Issues in Library" status has been changed to "In Progress".',
        type: 'status_update',
        relatedComplaint: complaints[0]._id,
        read: false,
      },
      {
        userId: staff2._id,
        title: 'New Complaint Assigned',
        message: 'A complaint "WiFi Connection Issues in Library" has been assigned to you.',
        type: 'new_assignment',
        relatedComplaint: complaints[0]._id,
        read: true,
      },
      {
        userId: student._id,
        title: 'New Response on Complaint',
        message: 'A new response has been added to your complaint "WiFi Connection Issues in Library".',
        type: 'new_response',
        relatedComplaint: complaints[0]._id,
        read: false,
      },
    ]);

    return NextResponse.json({
      message: 'Database seeded successfully!',
      seeded: true,
      data: {
        users: 5,
        complaints: complaints.length,
        notifications: 4,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
