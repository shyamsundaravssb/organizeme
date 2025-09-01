import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
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

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default Item;
