import Link from "next/link";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { UploadForm } from "@/components/upload-form";
import { LogoutButton } from "@/components/logout-button";
import { ShareLinkButton } from "@/components/share-link-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireDbUser();

  const documents = await db.document.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          views: true,
          shareLinks: true,
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Deal Room</h1>
          <p className="text-neutral-600">
            Upload documents and track investor engagement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-600">{user.email}</span>
          <LogoutButton />
        </div>
      </div>

      <UploadForm />

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Your documents</h2>

        <div className="mt-4 space-y-4">
          {documents.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No documents uploaded yet.
            </p>
          ) : ( 
              documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <Link
                    href={`/documents/${document.id}`}
                    className="font-medium hover:underline"
                  >
                    {document.name}
                  </Link>

                  <p className="text-sm text-neutral-500">
                    {document.originalFileName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Inline Share Link Generator */}
                  {document.status === "READY" && (
                    <ShareLinkButton documentId={document.id} />
                  )}

                  <div className="flex flex-col items-end gap-1 text-sm text-neutral-600">
                    <span>{document._count.views} views</span>
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs">
                      {document.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}