import fs from 'fs';
import mongoose from 'mongoose';

async function updateAdmin() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const match = envFile.match(/MONGODB_URI=(.*)/);
  const uri = match ? match[1].trim() : 'mongodb://127.0.0.1:27017/compsystem';

  await mongoose.connect(uri);
  const UserSchema = new mongoose.Schema({ role: String, department: String });
  const User = mongoose.model('User', UserSchema);
  const res = await User.updateMany({ role: 'admin' }, { department: 'System Admin' });
  console.log(res);
  process.exit(0);
}
updateAdmin();
