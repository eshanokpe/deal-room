import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getBucket() {
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error("S3_BUCKET is required");
  }

  return bucket;
}

export const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // This is critical for R2
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
});

export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3, command, {
    expiresIn: 60 * 5,
  });
}

export async function getObjectExists(key: string) {
  try {
    const command = new HeadObjectCommand({
      Bucket: getBucket(),
      Key: key,
    });

    await s3.send(command);

    return true;
  } catch (error: any) {
    if (
      error?.name === "NotFound" ||
      error?.$metadata?.httpStatusCode === 404
    ) {
      return false;
    }

    throw error;
  }
}

export async function getViewUrl(
  key: string,
  fileName: string,
  contentType: string
) {
  const encodedFileName = encodeURIComponent(fileName).replace(/['()]/g, "");

  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ResponseContentDisposition: `inline; filename*=UTF-8''${encodedFileName}`,
    ResponseContentType: contentType,
  });

  return getSignedUrl(s3, command, {
    expiresIn: 60 * 5,
  });
} 