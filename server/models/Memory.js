import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema(
  {
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploaderName: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      required: true,
      default: 'image',
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    isVisibleOnDashboard: {
      type: Boolean,
      default: false, // Private by default in vault!
    },
    date: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        user: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for chronological timeline and dashboard visibility
memorySchema.index({ isVisibleOnDashboard: 1, createdAt: -1 });

export default mongoose.model('Memory', memorySchema);
