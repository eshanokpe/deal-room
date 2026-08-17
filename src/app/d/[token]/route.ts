import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { hashIp, hashShareToken } from "@/lib/share";
import { getViewUrl } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    console.log("🔍 Incoming token from URL:", token);

    if (!token) {
      return new Response("Missing token", { status: 400 });
    }

    const tokenHash = hashShareToken(token);
    console.log("🔍 Searching DB for hash:", tokenHash);

    const shareLink = await db.shareLink.findUnique({
      where: { tokenHash },
      include: { document: true },
    });

    if (!shareLink) {
      const totalLinksInDb = await db.shareLink.count();
      console.error(`❌ Link not found! Total links currently in DB: ${totalLinksInDb}`);
      return new Response("Invalid or expired link", { status: 404 });
    }

    if (shareLink.revokedAt) {
      return new Response("This link has been revoked", { status: 403 });
    }

    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return new Response("This link has expired", { status: 403 });
    }

    if (shareLink.document.status !== "READY") {
      return new Response("Document is not available yet", { status: 404 });
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() ?? null;

    await db.documentView.create({
      data: {
        documentId: shareLink.documentId,
        shareLinkId: shareLink.id,
        ipAddressHash: hashIp(ip),
        userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
        referrer: request.headers.get("referer")?.slice(0, 500) ?? null,
      },
    });

    const signedUrl = await getViewUrl(
      shareLink.document.fileKey,
      shareLink.document.originalFileName,
      shareLink.document.contentType
    );

    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error("❌ Error in /d/[token] route:", error);
    return new Response("Internal server error", { status: 500 });
  }
}