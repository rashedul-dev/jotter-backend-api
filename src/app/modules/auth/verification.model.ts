import mongoose, { Schema } from 'mongoose';
import { IVerificationCode } from '../../interfaces/models';

const VerificationCodeSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['password_reset', 'email_verify'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // TTL index: auto-delete when expiresAt is reached
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.VerificationCode || mongoose.model<IVerificationCode>('VerificationCode', VerificationCodeSchema);
