import mongoose, { Schema } from 'mongoose';
import { IActivity } from '../../interfaces/models';

const ActivitySchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted', 'viewed'],
    required: true,
  },
  resourceType: {
    type: String,
    enum: ['folder', 'note', 'image', 'pdf'],
    required: true,
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  resourceTitle: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
ActivitySchema.index({ user: 1, timestamp: -1 });

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
