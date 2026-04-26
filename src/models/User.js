import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    default: 'student',
  },
  studentId: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
    default: 'General',
  },
  avatar: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
