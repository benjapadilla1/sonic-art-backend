import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/s3Client";

interface UploadFile {
  key: string;
  file: Express.Multer.File;
}

export const uploadFile = async ({ key, file }: UploadFile) => {
  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return key;
  } catch (err) {
    console.error(err);
    throw new Error("Error uploading file to Cloudflare R2.");
  }
};
