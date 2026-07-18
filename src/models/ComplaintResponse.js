import mongoose from 'mongoose';

const ComplaintResponseSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.ComplaintResponse || mongoose.model('ComplaintResponse', ComplaintResponseSchema);
