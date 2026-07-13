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

const BASE_URL =
  import.meta.env.VITE_API_URL;

export async function getAttachments(
  leadId: number
): Promise<Attachment[]> {
  return api<Attachment[]>(
    `/attachments/${leadId}`
  );
}

export async function uploadAttachment(
  leadId: number,
  file: File
) {
  const formData = new FormData();

  formData.append(
    "leadId",
    String(leadId)
  );

  formData.append(
    "file",
    file
  );

  const token =
    localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/attachments`,
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
  return api<void>(
    `/attachments/${id}`,
    {
      method: "DELETE",
    }
  );
}

export function getAttachmentUrl(
  fileName: string
) {
  return `${BASE_URL.replace(
    "/api",
    ""
  )}/uploads/${fileName}`;
}