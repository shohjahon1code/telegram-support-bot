import * as mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    id: Number,
    fio: String,
    region: String,
    district: String,
    neighborhood: String,
    phone_number: String,
    username: String,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

export type User = mongoose.InferSchemaType<typeof userSchema>;

export const User = mongoose.model('user', userSchema);