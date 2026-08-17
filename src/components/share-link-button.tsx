"use client";

import { useState } from "react";

export function ShareLinkButton({ documentId }: { documentId: string }) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch(`/api/documents/${documentId}/share-links`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create share link");
      }

      setShareUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create link");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate investor link"}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {shareUrl ? (
        <div className="space-y-2 rounded-lg border p-4">
          <p className="text-sm text-neutral-600">
            Share this link with an investor. It will record when the document
            is opened.
          </p>

          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />

            <button
              onClick={handleCopy}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}