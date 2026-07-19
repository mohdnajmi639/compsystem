import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// PATCH – update user role & department (admin only)
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { role, department } = body;

    const allowedRoles = ['student', 'staff', 'admin', 'public'];
    if (role && !allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Peranan tidak sah' }, { status: 400 });
    }

    const updateFields = {};
    if (role !== undefined) updateFields.role = role;
    if (department !== undefined) updateFields.department = department;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: `Pengguna tidak dijumpai (ID: ${id})` }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
