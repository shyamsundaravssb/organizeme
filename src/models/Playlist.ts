import mongoose, { Schema, Document } from "mongoose";

export interface IPlaylist extends Document {
  title: string;
  description?: string;
  owner: Schema.Types.ObjectId;
  parent: Schema.Types.ObjectId | null;
  visibility: "public" | "private";
  createdAt: Date;
}

const playlistSchema = new Schema<IPlaylist>({
  title: {
    type: String,
    required: [true, "Playlist title is required."],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // A null parent indicates a top-level playlist
  parent: {
    type: Schema.Types.ObjectId,
    ref: "Playlist",
    default: null,
  },
  // Controls access, defaulting to private
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "private",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Playlist =
  mongoose.models.Playlist ||
  mongoose.model<IPlaylist>("Playlist", playlistSchema);

export default Playlist;
