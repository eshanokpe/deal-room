import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { generateShareToken, hashShareToken } from "@/lib/share";

export const runtime = "nodejs";

export async function POST(
  request: Request,
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
      status: "READY",
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const token = generateShareToken();
  const tokenHash = hashShareToken(token);

  await db.shareLink.create({
    data: {
      documentId: document.id,
      tokenHash,
      tokenLast4: token.slice(-4),
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  return NextResponse.json({
    url: `${baseUrl}/d/${token}`,
  });
}