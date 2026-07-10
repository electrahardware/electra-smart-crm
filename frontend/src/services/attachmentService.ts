import { api } from "../lib/api";

export interface Attachment {
  id: number;
  leadId: number;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  createdAt: string;
}

export async function getAttachments(
  leadId: number
): Promise<Attachment[]> {
  return api<Attachment[]>(`/attachments/${leadId}`);
}

export async function uploadAttachment(
  leadId: number,
  file: File
) {
  const formData = new FormData();

  formData.append("leadId", String(leadId));
  formData.append("file", file);

  const token = localStorage.getItem("token");

  const res = await fetch(
    "http://localhost:5000/api/attachments",
    {
      method: "POST",
      headers: {
        Authorization: token
          ? `Bearer ${token}`
          : "",
      },
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return res.json();
}

export async function deleteAttachment(
  id: number
): Promise<void> {
  return api<void>(`/attachments/${id}`, {
    method: "DELETE",
  });
}

export function getAttachmentUrl(
  fileName: string
) {
  return `http://localhost:5000/uploads/${fileName}`;
}