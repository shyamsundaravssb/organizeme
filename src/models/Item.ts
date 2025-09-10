import mongoose, { Schema, Document } from "mongoose";

export interface IItem extends Document {
  title: string;
  description: string;
  notes?: string;
  parentPlaylist: Schema.Types.ObjectId;
  owner: Schema.Types.ObjectId;
  createdAt: Date;
}

const itemSchema = new Schema<IItem>({
  title: {
    type: String,
    required: [true, "Item title is required."],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Item description is required."],
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  // Links to its container (a playlist or sub-playlist)
  parentPlaylist: {
    type: Schema.Types.ObjectId,
    ref: "Playlist",
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Item = mongoose.models.Item || mongoose.model<IItem>("Item", itemSchema);

export default Item;
