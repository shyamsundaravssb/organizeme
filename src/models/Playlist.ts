import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
  title: {
    type: String,
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

const Playlist =
  mongoose.models.Playlist || mongoose.model("Playlist", playlistSchema);

export default Playlist;
