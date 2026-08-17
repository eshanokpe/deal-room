"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "completing" | "error" | "success"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please choose a PDF file");
      return;
    }

    setStatus("uploading");
    setErrorMessage(null);

    try {
      const presignResponse = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      const presignData = await presignResponse.json();

      if (!presignResponse.ok) {
        throw new Error(presignData.error ?? "Failed to prepare upload");
      }

      const uploadResponse = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }

      setStatus("completing");

      const completeResponse = await fetch(
        `/api/documents/${presignData.documentId}/complete`,
        {
          method: "POST",
        }
      );

      if (!completeResponse.ok) {
        throw new Error("Failed to complete upload");
      }

      setStatus("success");
      setName("");
      setFile(null);

      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Upload document</h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Document name
          </label>

          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seed Round Pitch Deck"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="file" className="text-sm font-medium">
            PDF file
          </label>

          <input
            id="file"
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={status === "uploading" || status === "completing"}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "uploading"
            ? "Uploading..."
            : status === "completing"
              ? "Completing..."
              : "Upload document"}
        </button>

        {errorMessage ? (
          <p className="text-sm text-red-600">{errorMessage}</p>
        ) : null}

        {status === "success" ? (
          <p className="text-sm text-green-600">
            Document uploaded successfully.
          </p>
        ) : null}
      </form>
    </div>
  );
}