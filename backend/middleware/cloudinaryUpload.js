import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const fileType = file.mimetype.startsWith("video") ? "video" : "image";
    return {
      folder: "social_web/",
      resource_type: fileType,
      public_id: Date.now().toString(),
    };
  },
});

const upload = multer({ storage });

export default upload;
