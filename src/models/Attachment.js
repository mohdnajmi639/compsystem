import mongoose from 'mongoose';

const AttachmentSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Attachment || mongoose.model('Attachment', AttachmentSchema);
