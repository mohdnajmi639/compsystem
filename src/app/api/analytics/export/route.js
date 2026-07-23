import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch all complaints with user info
    const complaints = await Complaint.find()
      .populate('submittedBy', 'name email department')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .lean(); // Use lean for faster plain JS objects

    // Build CSV Content
    const headers = [
      'ID Tiket',
      'Tarikh',
      'Tajuk',
      'Kategori',
      'Prioriti',
      'Status',
      'Nama Pengadu',
      'Emel Pengadu',
      'Jabatan/Fakulti',
      'Staf Bertugas',
      'Penilaian Maklum Balas',
    ];

    const rows = complaints.map((c) => [
      `A${(c._id || '').toString().slice(-12).toUpperCase()}`,
      new Date(c.createdAt).toLocaleDateString('ms-MY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${c.category || ''}"`,
      c.priority || 'Medium',
      c.status || 'Pending',
      `"${c.submittedBy?.name || 'Unknown'}"`,
      `"${c.submittedBy?.email || ''}"`,
      `"${c.submittedBy?.department || 'Umum'}"`,
      `"${c.assignedTo?.name || 'Belum Ditugaskan'}"`,
      c.feedbackRating || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Return as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="Aduan_Raw_Data.csv"',
      },
    });
  } catch (error) {
    return new NextResponse(error.message, { status: 500 });
  }
}
