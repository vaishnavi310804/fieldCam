import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3.js";

export const getPresignedMediaUrl = async (keyOrUrl, expiresIn = 604800) => {
  if (!keyOrUrl) return null;

  try {
    let cleanKey = keyOrUrl;
    if (typeof keyOrUrl === "string" && (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://"))) {
      const parsedUrl = new URL(keyOrUrl);
      cleanKey = parsedUrl.pathname.startsWith("/")
        ? parsedUrl.pathname.substring(1)
        : parsedUrl.pathname;
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: cleanKey,
    });

    return await getSignedUrl(s3Client, command, {
      expiresIn,
    });
  } catch (err) {
    console.error("Presigned URL generation error:", err);
    return null;
  }
};

export const deleteFromS3 = async (keyOrUrl) => {
  if (!keyOrUrl) return;

  try {
    let cleanKey = keyOrUrl;
    if (typeof keyOrUrl === "string" && (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://"))) {
      const parsedUrl = new URL(keyOrUrl);
      cleanKey = parsedUrl.pathname.startsWith("/")
        ? parsedUrl.pathname.substring(1)
        : parsedUrl.pathname;
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: cleanKey,
    });

    await s3Client.send(command);
  } catch (err) {
    console.error("S3 deletion error:", err);
    throw err;
  }
};

export const getS3ObjectSize = async (keyOrUrl) => {
  if (!keyOrUrl) return null;

  try {
    let cleanKey = keyOrUrl;
    if (typeof keyOrUrl === "string" && (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://"))) {
      const parsedUrl = new URL(keyOrUrl);
      cleanKey = parsedUrl.pathname.startsWith("/")
        ? parsedUrl.pathname.substring(1)
        : parsedUrl.pathname;
    }

    const command = new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: cleanKey,
    });

    const response = await s3Client.send(command);
    return typeof response?.ContentLength === "number" ? response.ContentLength : null;
  } catch {
    return null;
  }
};

export const uploadToS3 = async (file, customFolder) => {
  let folder = "attachments";
  if (customFolder) {
    folder = customFolder;
  } else if (file.mimetype.startsWith("image/")) {
    folder = "images";
  } else if (file.mimetype.startsWith("video/")) {
    folder = "videos";
  }

  const fileName = `${folder}/${Date.now()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  const presignedUrl = await getPresignedMediaUrl(fileName);

  const fallbackUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

  return {
    key: fileName,
    url: presignedUrl || fallbackUrl,
    filename: file.originalname,
    size: file.size || file.buffer?.length,
    mimetype: file.mimetype,
    type: file.mimetype.startsWith("image/") ? "image" : "attachment",
  };
};

export default uploadToS3;