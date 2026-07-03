export function getLeadForm() {
  const data = localStorage.getItem("leadForm");

  if (!data) {
    return {};
  }

  return JSON.parse(data);
}

export function saveLeadForm(data: any) {
  const old = getLeadForm();

  localStorage.setItem(
    "leadForm",
    JSON.stringify({
      ...old,
      ...data,
    })
  );
}

export function clearLeadForm() {
  localStorage.removeItem("leadForm");
}