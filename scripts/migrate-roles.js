import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { join } from "path";

// Load environment variables. Adjust path if necessary for your local setup.
dotenv.config({ path: join(process.cwd(), ".env.dev") });

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("MONGODB_URI is not defined in the environment.");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    role: { type: String },
  },
  { strict: false }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function migrateRoles() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for migration.");

    const resultEditor = await User.updateMany(
      { role: "Editor" },
      { $set: { role: "Subject Editor" } }
    );
    console.log(`Migrated ${resultEditor.modifiedCount} Editors to Subject Editors.`);

    const resultAuthor = await User.updateMany(
      { role: "Author" },
      { $set: { role: "Staff" } }
    );
    console.log(`Migrated ${resultAuthor.modifiedCount} Authors to Staff.`);

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrateRoles();
