import mongoose from "mongoose";

const EditionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    coverImageUrl: {
      type: String,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    releaseDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Edition || mongoose.model("Edition", EditionSchema);
