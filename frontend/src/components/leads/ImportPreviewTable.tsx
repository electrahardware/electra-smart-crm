import type { ImportPreviewRow } from "../../types/import";

function getRowColor(status: string) {
  switch (status) {
    case "ready":
      return "bg-green-50";

    case "duplicate":
      return "bg-yellow-50";

    case "invalid":
      return "bg-red-50";

    default:
      return "";
  }
}

interface Props {
  rows: ImportPreviewRow[];
}

export default function ImportPreviewTable({
  rows,
}: Props) {
  return (
    <div className="overflow-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3 text-left">Row</th>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Mobile</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">
  Existing ID
</th>
            <th className="p-3 text-left">Errors</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
  key={row.rowNumber}
  className={`border-t ${getRowColor(
    row.status
  )}`}
>
              <td className="p-3">
                {row.rowNumber}
              </td>

              <td className="p-3">

<div className="font-semibold">

{row.lead.customerName}

</div>

<div className="text-xs text-slate-500">

{row.lead.shopName || "-"}

</div>

{row.lead.leadOwner && (

<div className="text-xs text-blue-600 mt-1">

👤 {row.lead.leadOwner}

</div>

)}

</td>

              <td className="p-3">

  <div className="font-semibold">
    {row.lead.mobile}
  </div>

  {row.lead.whatsapp && (
    <div className="text-xs text-green-600 mt-1">
      WhatsApp : {row.lead.whatsapp}
    </div>
  
  )}

</td>

              <td className="p-3">
                <span
  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold

${
row.status==="ready"
?"bg-green-100 text-green-700"

:row.status==="duplicate"
?"bg-yellow-100 text-yellow-700"

:"bg-red-100 text-red-700"

}`}
>

{
row.status==="ready"
?"✅ Ready"

:row.status==="duplicate"
?"⚠ Duplicate"

:"❌ Invalid"

}

</span>
              </td>

              <td className="p-3">
  {row.existingLeadId ?? "-"}
</td>

              <td className="p-3">
  <div className="flex flex-wrap gap-2">
    {row.errors.length === 0 ? (
      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
        OK
      </span>
    ) : (
      row.errors.map((error, index) => (
        <span
          key={index}
          className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700"
        >
          {error.message}
        </span>
      ))
    )}
  </div>
</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t bg-slate-50 px-5 py-4 flex justify-between items-center">

<div className="text-sm text-slate-600">

Showing

<b className="mx-1">

{rows.length}

</b>

rows

</div>

<div className="text-sm text-slate-500">

Ready :

<span className="font-bold text-green-600 ml-1">

{
rows.filter(r=>r.status==="ready").length
}

</span>

&nbsp;&nbsp;

Duplicate :

<span className="font-bold text-yellow-600 ml-1">

{
rows.filter(r=>r.status==="duplicate").length
}

</span>

&nbsp;&nbsp;

Invalid :

<span className="font-bold text-red-600 ml-1">

{
rows.filter(r=>r.status==="invalid").length
}

</span>

</div>

</div>
    </div>
  );
}