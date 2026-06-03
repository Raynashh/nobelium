import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";


const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "nobelium";

async function getFiles(dir, files = []) {
  const fileList = await fs.readdir(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if ((await fs.stat(name)).isDirectory()) {
      await getFiles(name, files);
    } else {
      files.push(name);
    }
  }
  return files;
}

async function migrate() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    const allFiles = await getFiles(uploadsDir);
    for (const filePath of allFiles) {
      if (filePath.includes(".DS_Store")) continue;

      const ext = path.extname(filePath).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".png") contentType = "image/png";
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".svg") contentType = "image/svg+xml";
      else if (ext === ".webp") contentType = "image/webp";

      const fileBuffer = await fs.readFile(filePath);
      
      // Calculate s3Key: public/uploads/... -> uploads/...
      const relativePath = path.relative(path.join(process.cwd(), "public"), filePath);
      const s3Key = relativePath.split(path.sep).join("/");

      console.log(`Uploading ${s3Key}...`);
      
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await s3Client.send(command);
    }
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrate();
