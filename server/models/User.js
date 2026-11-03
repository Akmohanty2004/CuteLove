import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      enum: ['ashis', 'kirti'],
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    currentMood: {
      type: String,
      enum: ['happy', 'normal', 'sad', 'gussa'],
      default: 'happy',
    },
    lastMoodUpdate: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: '',
    },
    customStatus: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', userSchema);
