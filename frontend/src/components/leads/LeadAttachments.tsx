import { useRef } from "react";
import type { ChangeEvent } from "react";
import type { Lead } from "../../types/lead";
import { uploadAttachment } from "../../services/attachmentService";

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

  if (!lead) {
    return null;
  }

  const leadId = lead.id!;

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
      await uploadAttachment(
        leadId,
        file
      );

      alert("Attachment uploaded successfully.");

      onUpload?.();

      e.target.value = "";

    } catch (error) {

      console.error(error);

      alert("Unable to upload attachment.");

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
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          + Upload
        </button>

      </div>

      <div className="mt-8 rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">

        <div className="text-6xl">
          📂
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          No Attachments Yet
        </h3>

        <p className="mt-2 text-slate-500">
          Upload PDF, Images, Visiting Card,
          Catalogue or Invoice.
        </p>

        <button
          onClick={handleUploadClick}
          className="mt-6 rounded-lg border px-5 py-2 hover:bg-slate-100"
        >
          Select File
        </button>

      </div>

    </div>
  );
}