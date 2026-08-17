import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDbUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getUploadUrl } from "@/lib/s3";
import { presignUploadSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getDbUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = presignUploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? "Invalid request",
      },
      { status: 400 }
    );
  }

  const { name, fileName, contentType, size } = parsed.data;

  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

  const key = `documents/${user.id}/${randomUUID()}/${safeFileName}`;

  const uploadUrl = await getUploadUrl(key, contentType);

  const document = await db.document.create({
    data: {
      userId: user.id,
      name,
      originalFileName: fileName,
      fileKey: key,
      contentType,
      sizeBytes: size,
      status: "UPLOADING",
    },
  });

  return NextResponse.json({
    documentId: document.id,
    uploadUrl,
    fileKey: key,
  });
}