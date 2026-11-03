import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      enum: ['Ashis', 'Kirti'],
    },
    recipientName: {
      type: String,
      required: true,
      enum: ['Ashis', 'Kirti'],
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    reaction: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ createdAt: 1 });

export default mongoose.model('Message', messageSchema);
