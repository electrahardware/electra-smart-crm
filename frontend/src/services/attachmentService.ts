const API = "http://localhost:5000/api/attachments";

export async function getAttachments(
  leadId: number
) {
  const res = await fetch(
    `${API}/${leadId}`
  );

  return await res.json();
}

export async function uploadAttachment(
  leadId: number,
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const res = await fetch(
    `${API}/${leadId}`,
    {
      method: "POST",
      body: formData,
    }
  );

  return await res.json();
}

export async function deleteAttachment(
  id: number
) {
  const res = await fetch(
    `${API}/${id}`,
    {
      method: "DELETE",
    }
  );

  return await res.json();
}