import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { ShareLinkButton } from "@/components/share-link-button";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await requireDbUser();

  const document = await db.document.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      views: {
        orderBy: {
          viewedAt: "desc",
        },
        take: 50,
      },
      shareLinks: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: {
              views: true,
            },
          },
        },
      },
    },
  });

  if (!document) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← Back to dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {document.name}
          </h1>

          <p className="text-neutral-600">{document.originalFileName}</p>
        </div>

        <LogoutButton />
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Investor access</h2>

        <div className="mt-4">
          <ShareLinkButton documentId={document.id} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Share links</h2>

        <div className="mt-4 space-y-3">
          {document.shareLinks.length === 0 ? (
            <p className="text-sm text-neutral-500">No share links yet.</p>
          ) : (
            document.shareLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">
                    Link ending in {link.tokenLast4}
                  </p>

                  <p className="text-sm text-neutral-500">
                    Created {new Date(link.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <span>{link._count.views} views</span>

                  {link.revokedAt ? (
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs">
                      Revoked
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Recent opens</h2>

        <div className="mt-4 space-y-3">
          {document.views.length === 0 ? (
            <p className="text-sm text-neutral-500">
              This document has not been opened yet.
            </p>
          ) : (
            document.views.map((view) => (
              <div key={view.id} className="rounded-lg border p-4">
                <p className="font-medium">
                  Opened at {new Date(view.viewedAt).toLocaleString()}
                </p>

                {view.userAgent ? (
                  <p className="mt-1 break-words text-sm text-neutral-500">
                    {view.userAgent}
                  </p>
                ) : null}

                {view.referrer ? (
                  <p className="mt-1 break-words text-sm text-neutral-500">
                    Referrer: {view.referrer}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}