import multer from "multer";
import path from "path";
import fs from "fs";

// Define the upload directory
const uploadPath = path.join(process.cwd(), "public/uploads");

// Ensure the uploads folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

// Initialize Multer for multiple images
const upload = multer({ storage });

export default upload;
