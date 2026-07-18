import mongoose from 'mongoose';

const ComplaintLogSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  previousState: {
    type: String,
  },
  newState: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.models.ComplaintLog || mongoose.model('ComplaintLog', ComplaintLogSchema);
