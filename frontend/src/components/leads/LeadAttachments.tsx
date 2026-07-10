import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import type { Lead } from "../../types/lead";
import type { Attachment } from "../../types/attachment";

import {
  uploadAttachment,
  getAttachments,
  deleteAttachment,
  getAttachmentUrl,
} from "../../services/attachmentService";

interface Props {
  lead: Lead | null;
  onUpload?: () => void;
}

export default function LeadAttachments({
  lead,
  onUpload,
}: Props) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] =
    useState<Attachment[]>([]);

  const [loading, setLoading] =
    useState(false);

  if (!lead) {
    return null;
  }

  const leadId = lead.id!;

  useEffect(() => {
    loadAttachments();
  }, [leadId]);

  async function loadAttachments() {
    try {
      const data =
        await getAttachments(leadId);

      setAttachments(data);
    } catch (error) {
      console.error(error);
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setLoading(true);

      await uploadAttachment(
        leadId,
        file
      );

      await loadAttachments();

      onUpload?.();

      alert(
        "Attachment uploaded successfully."
      );

      e.target.value = "";
    } catch (error) {
      console.error(error);

      alert(
        "Unable to upload attachment."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(
    id: number
  ) {
    const ok = window.confirm(
      "Delete this attachment?"
    );

    if (!ok) {
      return;
    }

    try {
      await deleteAttachment(id);

      await loadAttachments();

      alert(
        "Attachment deleted successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to delete attachment."
      );
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold">
            📎 Attachments
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload quotation, visiting card,
            catalogue, invoice and images.
          </p>

        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={handleUploadClick}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "+ Upload"}
        </button>

      </div>

      {attachments.length === 0 ? (

        <div className="mt-8 rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">

          <div className="text-6xl">
            📂
          </div>

          <h3 className="mt-4 text-lg font-semibold">
            No Attachments Yet
          </h3>

          <p className="mt-2 text-slate-500">
            Upload PDF, Images,
            Visiting Card,
            Catalogue or Invoice.
          </p>

          <button
            onClick={handleUploadClick}
            className="mt-6 rounded-lg border px-5 py-2 hover:bg-slate-100"
          >
            Select File
          </button>

        </div>

      ) : (

        <div className="mt-6 space-y-3">

          {attachments.map((file) => (

            <div
              key={file.id}
              className="flex items-center justify-between rounded-xl border p-4"
            >

              <div>

                <p className="font-semibold">
                  📄 {file.originalName}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {(file.fileSize / 1024).toFixed(1)} KB
                </p>

                <p className="text-xs text-slate-400">
                  {new Date(file.createdAt).toLocaleString()}
                </p>

              </div>

              <div className="flex gap-2">

                <button
  onClick={() =>
    window.open(
      getAttachmentUrl(file.filePath),
      "_blank"
    )
  }
  className="rounded-lg bg-slate-100 px-3 py-2 hover:bg-slate-200"
  title="Preview"
>
  👁️
</button>

                <button
  onClick={() => {

    const link =
      document.createElement("a");

    link.href =
      getAttachmentUrl(file.filePath);

    link.download =
      file.originalName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  }}
  className="rounded-lg bg-blue-100 px-3 py-2 hover:bg-blue-200"
  title="Download"
>
  ⬇️
</button>

                <button
                  onClick={() =>
                    handleDelete(file.id)
                  }
                  className="rounded-lg bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
                  title="Delete"
                >
                  🗑️
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}