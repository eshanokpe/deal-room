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
    <div className="min-h-screen bg-[#F7F7F5]">
      <header className="border-b border-[#E5E4DF] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0F3D2E] font-serif text-sm font-semibold text-white">
              D
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-[#14181F]">
              Deal Room
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {/* Back link + Title */}
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-[#5B6572] hover:text-[#0F3D2E] transition-colors"
          >
            ← Back to dashboard
          </Link>

          <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-[#14181F]">
            {document.name}
          </h1>

          <p className="mt-1 text-sm text-[#8A9099]">
            {document.originalFileName} · Uploaded{" "}
            {new Date(document.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Investor access */}
        <div className="rounded-xl border border-[#E5E4DF] bg-white p-6 shadow-[0_1px_2px_rgba(20,24,31,0.04)]">
          <h2 className="font-serif text-lg font-semibold text-[#14181F]">
            Investor access
          </h2>

          <div className="mt-4">
            {document.status === "READY" ? (
              <ShareLinkButton documentId={document.id} />
            ) : (
              <p className="text-sm text-[#8A9099]">
                Document is still processing. Please wait before sharing.
              </p>
            )}
          </div>
        </div>

        {/* Share links */}
        <div className="rounded-xl border border-[#E5E4DF] bg-white shadow-[0_1px_2px_rgba(20,24,31,0.04)]">
          <div className="border-b border-[#E5E4DF] px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-[#14181F]">
              Share links
            </h2>
          </div>

          <div className="px-6 py-4">
            {document.shareLinks.length === 0 ? (
              <p className="text-sm text-[#8A9099]">No share links yet.</p>
            ) : (
              <div className="space-y-3">
                {document.shareLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-lg border border-[#E5E4DF] p-4"
                  >
                    <div>
                      <p className="font-mono text-sm font-medium text-[#14181F]">
                        Link ending in {link.tokenLast4}
                      </p>
                      <p className="text-xs text-[#8A9099]">
                        Created{" "}
                        {new Date(link.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#5B6572]">
                        {link._count.views} views
                      </span>

                      {link.revokedAt && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          Revoked
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent opens */}
        <div className="rounded-xl border border-[#E5E4DF] bg-white shadow-[0_1px_2px_rgba(20,24,31,0.04)]">
          <div className="border-b border-[#E5E4DF] px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-[#14181F]">
              Recent opens
            </h2>
          </div>

          <div className="px-6 py-4">
            {document.views.length === 0 ? (
              <p className="text-sm text-[#8A9099]">
                This document has not been opened yet.
              </p>
            ) : (
              <div className="space-y-3">
                {document.views.map((view) => (
                  <div
                    key={view.id}
                    className="rounded-lg border border-[#E5E4DF] p-4"
                  >
                    <p className="text-sm font-medium text-[#14181F]">
                      Opened at{" "}
                      {new Date(view.viewedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>

                    {view.userAgent && (
                      <p className="mt-1 break-words text-xs text-[#8A9099]">
                        {view.userAgent}
                      </p>
                    )}

                    {view.referrer && (
                      <p className="mt-1 break-words text-xs text-[#8A9099]">
                        Referrer: {view.referrer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}