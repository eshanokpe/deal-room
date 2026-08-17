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

      // Safely parse JSON
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server returned non-JSON: ${text.slice(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create share link");
      }

      setShareUrl(data.url);
    } catch (err) {
      console.error("Share link button error:", err);
      setError(err instanceof Error ? err.message : "Failed to create link");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-lg bg-[#0F3D2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a2b20] disabled:opacity-60 transition-colors"
      >
        {loading ? "Generating..." : "Generate investor link"}
      </button>

      {error && <p className="text-sm text-red-600 font-medium">Error: {error}</p>}

      {shareUrl && (
        <div className="space-y-2 rounded-lg border border-[#E5E4DF] bg-[#FAFAF9] p-4 animate-in fade-in">
          <p className="text-sm text-[#5B6572]">
            Share this link with an investor. It will record when opened.
          </p>

          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="w-full rounded-lg border border-[#E5E4DF] bg-white px-3 py-2 text-sm text-[#14181F]"
            />

            <button
              onClick={handleCopy}
              className="rounded-lg border border-[#E5E4DF] bg-white px-4 py-2 text-sm font-medium text-[#14181F] hover:bg-[#F1F0EC]"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}