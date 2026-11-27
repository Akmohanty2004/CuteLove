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
    const ashisPasswordRaw = process.env.ASHIS_PASSWORD || process.env.MAJNU_PASSWORD || 'Ashis0710';
    const kirtiPasswordRaw = process.env.KIRTI_PASSWORD || process.env.LAILA_PASSWORD || 'Kirti1210';

    let ashis = await User.findOne({ username: { $in: ['ashis', 'majnu'] } });
    let kirti = await User.findOne({ username: { $in: ['kirti', 'laila'] } });

    const ashisPasswordHash = await bcrypt.hash(ashisPasswordRaw, 10);
    const kirtiPasswordHash = await bcrypt.hash(kirtiPasswordRaw, 10);

    let newAshis = ashis;
    let newKirti = kirti;

    if (!ashis || !kirti) {
      console.log('🌱 Seeding exclusive couple users: Laila & Majnu...');

      newAshis = await User.findOneAndUpdate(
        { username: 'ashis' },
        {
          username: 'ashis',
          displayName: 'Majnu',
          password: ashisPasswordHash,
          currentMood: 'happy',
          avatar: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Ranbir_Kapoor_and_Alia_Bhatt.jpg',
          customStatus: 'Loving you more every day ❤️',
          lastActive: new Date(),
        },
        { upsert: true, new: true }
      );

      newKirti = await User.findOneAndUpdate(
        { username: 'kirti' },
        {
          username: 'kirti',
          displayName: 'Laila',
          password: kirtiPasswordHash,
          currentMood: 'happy',
          avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Deepika_Padukone_and_Ranveer_Singh_reception.jpg',
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
          { user: newAshis._id, username: 'ashis', mood: 'happy', note: 'Woke up thinking of you', createdAt: new Date(now - 20 * hour) },
          { user: newKirti._id, username: 'kirti', mood: 'normal', note: 'Busy morning at work', createdAt: new Date(now - 16 * hour) },
          { user: newAshis._id, username: 'ashis', mood: 'happy', note: 'Got your sweet message!', createdAt: new Date(now - 12 * hour) },
          { user: newKirti._id, username: 'kirti', mood: 'happy', note: 'Can not wait to see you', createdAt: new Date(now - 8 * hour) },
          { user: newAshis._id, username: 'ashis', mood: 'normal', note: 'Evening walk', createdAt: new Date(now - 4 * hour) },
          { user: newKirti._id, username: 'kirti', mood: 'happy', note: 'Talking with Majnu', createdAt: new Date(now - 1 * hour) },
        ]);
      }

      // Seed initial sample memories if empty
      const memoryCount = await Memory.countDocuments();
      if (memoryCount === 0) {
        await Memory.insertMany([
          {
            uploader: newAshis._id,
            uploaderName: 'Majnu',
            mediaType: 'image',
            url: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Ranbir_Kapoor_and_Alia_Bhatt.jpg',
            publicId: 'seed_memory_1',
            caption: 'Our sunset walk by the shore. The golden sky had nothing on your smile.',
            isVisibleOnDashboard: true,
            date: new Date(Date.now() - 5 * 86400 * 1000),
          },
          {
            uploader: newKirti._id,
            uploaderName: 'Laila',
            mediaType: 'image',
            url: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Deepika_Padukone_and_Ranveer_Singh_reception.jpg',
            publicId: 'seed_memory_2',
            caption: 'Cozy coffee dates and endless conversations about our dreams.',
            isVisibleOnDashboard: true,
            date: new Date(Date.now() - 12 * 86400 * 1000),
          },
          {
            uploader: newAshis._id,
            uploaderName: 'Majnu',
            mediaType: 'image',
            url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Shah_Rukh_Khan_and_Kajol.jpg',
            publicId: 'seed_memory_3',
            caption: 'Holding hands under the fairy lights. A night I will never forget.',
            isVisibleOnDashboard: true,
            date: new Date(Date.now() - 20 * 86400 * 1000),
          },
          {
            uploader: newKirti._id,
            uploaderName: 'Laila',
            mediaType: 'image',
            url: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Sidharth_Malhotra_and_Kiara_Advani_at_their_wedding_reception_in_Mumbai_%2812%29.jpg',
            publicId: 'seed_memory_4',
            caption: 'That rainy afternoon spent listening to our favorite songs.',
            isVisibleOnDashboard: true,
            date: new Date(Date.now() - 2 * 86400 * 1000),
          },
          {
            uploader: newAshis._id,
            uploaderName: 'Majnu',
            mediaType: 'image',
            url: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Saif_%26_Kareena.jpg',
            publicId: 'seed_memory_5',
            caption: 'Private Vault Memory: Our secret stargazing trip. Kept safely in our private vault.',
            isVisibleOnDashboard: false,
            date: new Date(Date.now() - 25 * 86400 * 1000),
          }
        ]);
      }

      // Seed initial secret note if empty
      const noteCount = await Note.countDocuments();
      if (noteCount === 0) {
        await Note.create({
          sender: newAshis._id,
          senderName: 'Majnu',
          content: 'I left your favorite chocolates in the fridge! Have an amazing day my love ❤️',
          color: 'rose',
          isPinned: true,
        });
      }

      console.log('✅ Seed completed: Laila and Majnu initialized.');
    } else {
      // Ensure display names are updated to Majnu and Laila
      await User.updateMany({ username: { $in: ['ashis', 'majnu'] } }, { displayName: 'Majnu' });
      await User.updateMany({ username: { $in: ['kirti', 'laila'] } }, { displayName: 'Laila' });

      // Synchronize passwords if changed in .env
      const ashisMatches = await bcrypt.compare(ashisPasswordRaw, ashis.password);
      if (!ashisMatches) {
        console.log("🔄 Updating Majnu's password from environment variables...");
        ashis.password = await bcrypt.hash(ashisPasswordRaw, 10);
        await ashis.save();
        console.log("✅ Majnu's password successfully updated in MongoDB Atlas.");
      }

      const kirtiMatches = await bcrypt.compare(kirtiPasswordRaw, kirti.password);
      if (!kirtiMatches) {
        console.log("🔄 Updating Laila's password from environment variables...");
        kirti.password = await bcrypt.hash(kirtiPasswordRaw, 10);
        await kirti.save();
        console.log("✅ Laila's password successfully updated in MongoDB Atlas.");
      }
    }

    // Update existing memories uploaderName to Majnu & Laila
    await Memory.updateMany({ uploaderName: 'Ashis' }, { uploaderName: 'Majnu' });
    await Memory.updateMany({ uploaderName: 'Kirti' }, { uploaderName: 'Laila' });
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
