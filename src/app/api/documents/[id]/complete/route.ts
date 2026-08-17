import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getObjectExists } from "@/lib/s3";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const document = await db.document.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const exists = await getObjectExists(document.fileKey);

  if (!exists) {
    await db.document.update({
      where: {
        id: document.id,
      },
      data: {
        status: "FAILED",
      },
    });

    return NextResponse.json(
      { error: "Uploaded file was not found in storage" },
      { status: 400 }
    );
  }

  const updated = await db.document.update({
    where: {
      id: document.id,
    },
    data: {
      status: "READY",
    },
  });

  return NextResponse.json({
    document: updated,
  });
}