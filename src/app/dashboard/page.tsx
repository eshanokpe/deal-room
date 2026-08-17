import Link from "next/link";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { UploadForm } from "@/components/upload-form";
import { LogoutButton } from "@/components/logout-button";
import { ShareLinkButton } from "@/components/share-link-button";

export const dynamic = "force-dynamic";

function statusStyles(status: string) {
  switch (status) {
    case "READY":
      return {
        dot: "bg-emerald-500",
        pill: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      };
    case "PROCESSING":
      return {
        dot: "bg-amber-500",
        pill: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      };
    case "FAILED":
      return {
        dot: "bg-red-500",
        pill: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
      };
    default:
      return {
        dot: "bg-slate-400",
        pill: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200",
      };
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function initialsFromEmail(email: string) {
  return email.slice(0, 2).toUpperCase();
}

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
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Top bar */}
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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E7F0EA] text-[11px] font-medium text-[#0F3D2E]">
                {initialsFromEmail(user.email)}
              </div>
              <span className="text-sm text-[#5B6572]">{user.email}</span>
            </div>
            <div className="h-4 w-px bg-[#E5E4DF]" />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {/* Page heading */}
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#14181F]">
            Documents
          </h1>
          <p className="mt-1 text-[15px] text-[#5B6572]">
            Upload materials and track investor engagement in real time.
          </p>
        </div>

        {/* Upload */}
        <div className="rounded-xl border border-[#E5E4DF] bg-white p-6 shadow-[0_1px_2px_rgba(20,24,31,0.04)]">
          <UploadForm />
        </div>

        {/* Document list */}
        <div className="rounded-xl border border-[#E5E4DF] bg-white shadow-[0_1px_2px_rgba(20,24,31,0.04)]">
          <div className="flex items-center justify-between border-b border-[#E5E4DF] px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-[#14181F]">
              Your documents
            </h2>
            <span className="rounded-full bg-[#F1F0EC] px-2.5 py-1 font-mono text-xs text-[#5B6572]">
              {documents.length} total
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1F0EC]">
                <svg
                  className="h-5 w-5 text-[#8A9099]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 13h6m-6 4h6m2 5H7a2 2 0 01-2-2V4a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V20a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#14181F]">
                No documents yet
              </p>
              <p className="max-w-xs text-sm text-[#5B6572]">
                Upload your first file above to start sharing it with
                investors.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E5E4DF]">
              {documents.map((document) => {
                const { dot, pill } = statusStyles(document.status);

                return (
                  <li
                    key={document.id}
                    className="flex flex-col gap-4 px-6 py-4 transition-colors hover:bg-[#FAFAF9] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#F1F0EC]">
                        <svg
                          className="h-4 w-4 text-[#5B6572]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          href={`/documents/${document.id}`}
                          className="text-[15px] font-medium text-[#14181F] hover:text-[#0F3D2E] hover:underline underline-offset-2"
                        >
                          {document.name}
                        </Link>
                        <p className="text-sm text-[#8A9099]">
                          {document.originalFileName}
                        </p>
                        <p className="font-mono text-xs text-[#8A9099]">
                          {formatDate(document.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pl-12 sm:pl-0">
                      {document.status === "READY" && (
                        <ShareLinkButton documentId={document.id} />
                      )}

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="font-mono text-xs text-[#5B6572]">
                          {document._count.views} views
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${pill}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                          {document.status}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}