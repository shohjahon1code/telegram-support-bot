import * as mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ["text", "audio", "video"],
      required: true,
    },
    content: {
      text: {
        type: String,
        required: function () {
          return this.type === "text";
        },
      },
      audioUrl: {
        type: String,
        required: function () {
          return this.type === "audio";
        },
      },
      videoUrl: {
        type: String,
        required: function () {
          return this.type === "video";
        },
      },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export type Message = mongoose.InferSchemaType<typeof messageSchema>;

export const MessageModel = mongoose.model<Message>("message", messageSchema);
