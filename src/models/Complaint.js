import mongoose from 'mongoose';

const ResponseSchema = new mongoose.Schema({
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

const ComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  category: {
    type: String,
    enum: ['Academic', 'Facility', 'Financial', 'Administrative', 'Other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  attachments: [{
    type: String,
  }],
  responses: [ResponseSchema],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
