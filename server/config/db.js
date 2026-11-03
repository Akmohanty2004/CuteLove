import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { spawn } from 'child_process';
import User from '../models/User.js';
import Memory from '../models/Memory.js';
import Note from '../models/Note.js';
import MoodLog from '../models/MoodLog.js';

let mongodProcess = null;

const startLocalMongoProcess = async () => {
  const binaryPaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
  ];

  let binaryPath = binaryPaths.find((p) => fs.existsSync(p));
  if (!binaryPath) {
    try {
      const { execSync } = await import('child_process');
      binaryPath = execSync('where mongod').toString().trim().split('\r\n')[0];
    } catch (e) {
      // not in path
    }
  }

  if (binaryPath && fs.existsSync(binaryPath)) {
    const dataDir = path.resolve('data/db');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    console.log(`Starting local mongod daemon from ${binaryPath}...`);
    mongodProcess = spawn(binaryPath, ['--dbpath', dataDir, '--port', '27017'], {
      detached: false,
      stdio: 'ignore',
    });

    mongodProcess.unref();

    // Give it 2 seconds to bind to port
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return true;
  }
  return false;
};

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ashis_kirti_love';

  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    } catch (dnsErr) {
      // ignore if environment restricts custom DNS
    }
  }

  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ MongoDB connected successfully.');
  } catch (err) {
    if (process.env.MONGODB_URI && (process.env.MONGODB_URI.includes('mongodb+srv') || process.env.NODE_ENV === 'production')) {
      console.error('❌ Failed to connect to production MongoDB URI:', err.message);
      throw err;
    }

    console.log('⚠️ Could not connect to running MongoDB instance. Attempting to start local mongod...');
    const started = await startLocalMongoProcess();
    if (started) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
        console.log('✅ Local MongoDB instance started and connected.');
      } catch (startErr) {
        console.error('❌ Failed to connect to started mongod:', startErr.message);
        throw startErr;
      }
    } else {
      throw err;
    }
  }

  // Pre-seed users and default content
  await seedInitialData();
};

export const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount < 2) {
      console.log('🌱 Seeding exclusive couple users: Ashis & Kirti...');
      
      const ashisPasswordHash = await bcrypt.hash('ashis123', 10);
      const kirtiPasswordHash = await bcrypt.hash('kirti123', 10);

      const ashis = await User.findOneAndUpdate(
        { username: 'ashis' },
        {
          username: 'ashis',
          displayName: 'Ashis',
          password: ashisPasswordHash,
          currentMood: 'happy',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          customStatus: 'Loving you more every day ❤️',
          lastActive: new Date(),
        },
        { upsert: true, new: true }
      );

      const kirti = await User.findOneAndUpdate(
        { username: 'kirti' },
        {
          username: 'kirti',
          displayName: 'Kirti',
          password: kirtiPasswordHash,
          currentMood: 'happy',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
          customStatus: 'Forever by your side ✨',
          lastActive: new Date(),
        },
        { upsert: true, new: true }
      );

      // Seed initial mood logs
      const moodLogsCount = await MoodLog.countDocuments();
      if (moodLogsCount === 0) {
        const now = Date.now();
        const hour = 3600 * 1000;
        await MoodLog.insertMany([
          { user: ashis._id, username: 'ashis', mood: 'happy', note: 'Woke up thinking of you', createdAt: new Date(now - 20 * hour) },
          { user: kirti._id, username: 'kirti', mood: 'normal', note: 'Busy morning at work', createdAt: new Date(now - 16 * hour) },
          { user: ashis._id, username: 'ashis', mood: 'happy', note: 'Got your sweet message!', createdAt: new Date(now - 12 * hour) },
          { user: kirti._id, username: 'kirti', mood: 'happy', note: 'Can not wait to see you', createdAt: new Date(now - 8 * hour) },
          { user: ashis._id, username: 'ashis', mood: 'normal', note: 'Evening walk', createdAt: new Date(now - 4 * hour) },
          { user: kirti._id, username: 'kirti', mood: 'happy', note: 'Talking with Ashis', createdAt: new Date(now - 1 * hour) },
        ]);
      }

      // Seed initial sample memories if empty
      const memoryCount = await Memory.countDocuments();
      if (memoryCount === 0) {
        await Memory.insertMany([
          {
            uploader: ashis._id,
            uploaderName: 'Ashis',
            mediaType: 'image',
            url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed_memory_1',
            caption: 'Our sunset walk by the shore. The golden sky had nothing on your smile.',
            isVisibleOnDashboard: true,
            date: new Date(Date.now() - 5 * 86400 * 1000),
          },
          {
            uploader: kirti._id,
            uploaderName: 'Kirti',
            mediaType: 'image',
            url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed_memory_2',
            caption: 'Cozy coffee dates and endless conversations about our dreams.',
            isVisibleOnDashboard: true,
            date: new Date(Date.now() - 12 * 86400 * 1000),
          },
          {
            uploader: ashis._id,
            uploaderName: 'Ashis',
            mediaType: 'image',
            url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed_memory_3',
            caption: 'Holding hands under the fairy lights. A night I will never forget.',
            isVisibleOnDashboard: true,
            date: new Date(Date.now() - 20 * 86400 * 1000),
          },
          {
            uploader: kirti._id,
            uploaderName: 'Kirti',
            mediaType: 'image',
            url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed_memory_4',
            caption: 'That rainy afternoon spent listening to our favorite songs.',
            isVisibleOnDashboard: true,
            date: new Date(Date.now() - 2 * 86400 * 1000),
          },
          {
            uploader: ashis._id,
            uploaderName: 'Ashis',
            mediaType: 'image',
            url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed_memory_5',
            caption: 'Private Vault Memory: Our secret stargazing trip. Kept safely in our private vault.',
            isVisibleOnDashboard: false, // Private by default!
            date: new Date(Date.now() - 25 * 86400 * 1000),
          }
        ]);
      }

      // Seed initial secret note if empty
      const noteCount = await Note.countDocuments();
      if (noteCount === 0) {
        await Note.create({
          sender: ashis._id,
          senderName: 'Ashis',
          content: 'I left your favorite chocolates in the fridge! Have an amazing day my love ❤️',
          color: 'rose',
          isPinned: true,
        });
      }

      console.log('✅ Seed completed: Ashis and Kirti initialized.');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
