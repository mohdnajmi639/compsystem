import { MongoClient } from 'mongodb';

const rawUri = process.env.MONGODB_URI;
if (!rawUri) throw new Error('Set MONGODB_URI env var before running this script');
const uri = rawUri;

console.log('Connecting to MongoDB Atlas...');
const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db('compsystem');
  const complaints = db.collection('complaints');

  const filter = {
    $or: [
      { title: { $in: [null, ""] } },
      { title: { $exists: false } },
      { description: { $in: [null, ""] } },
      { description: { $exists: false } },
      { submittedBy: null },
      { submittedBy: { $exists: false } }
    ]
  };

  const result = await complaints.deleteMany(filter);
  console.log(`✅  Deleted ${result.deletedCount} incomplete complaint(s).`);
} catch (err) {
  console.error('❌  Error:', err.message);
} finally {
  await client.close();
}
