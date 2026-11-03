import mongoose from 'mongoose';

const moodLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      enum: ['ashis', 'kirti'],
      required: true,
    },
    mood: {
      type: String,
      enum: ['happy', 'normal', 'sad', 'gussa'],
      required: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

moodLogSchema.index({ username: 1, createdAt: -1 });

export default mongoose.model('MoodLog', moodLogSchema);
