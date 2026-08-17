import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getDbUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the document and verify ownership
    const document = await db.document.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete the file from R2 storage
    try {
      const bucket = process.env.S3_BUCKET;
      if (bucket) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: document.fileKey,
          })
        );
        console.log(`✅ Deleted file from R2: ${document.fileKey}`);
      }
    } catch (s3Error) {
      console.error("⚠️ Warning: Failed to delete file from R2:", s3Error);
      // Continue with database deletion even if R2 deletion fails
    }

    // Delete the document from the database
    // This will cascade delete share links and views due to Prisma schema
    await db.document.delete({
      where: {
        id: document.id,
      },
    });

    console.log(`✅ Deleted document: ${document.name}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}