import mongoose, { Schema, type Document } from "mongoose"

export interface ISupportRequest extends Document {
  user: Schema.Types.ObjectId
  type: "bug" | "feature" | "account" | "billing" | "general"
  subject: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "resolved" | "closed"
  attachments?: Array<{
    filename: string
    path: string
    size: number
  }>
  createdAt: Date
  updatedAt: Date
}

const SupportRequestSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["bug", "feature", "account", "billing", "general"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    attachments: [
      {
        filename: String,
        path: String,
        size: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Indexes
SupportRequestSchema.index({ user: 1, createdAt: -1 })
SupportRequestSchema.index({ status: 1 })

export default mongoose.models.SupportRequest || mongoose.model<ISupportRequest>("SupportRequest", SupportRequestSchema)
