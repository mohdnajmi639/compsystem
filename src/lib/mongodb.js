import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Laragon/Windows local dev: override DNS to avoid loopback resolver
// failing to resolve MongoDB Atlas SRV records (querySrv ECONNREFUSED).
// DNS_SERVER can be set in .env.local; fallback is 8.8.8.8.
const dnsServer = process.env.DNS_SERVER || '8.8.8.8';
dns.setServers([dnsServer]);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
