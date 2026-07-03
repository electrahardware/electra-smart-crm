import { useLead } from "../../hooks/useLead";
export default function Step4Review() {
  const { lead } = useLead();
  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            Review & Save
          </h2>

          <p className="text-slate-500 mt-2">
            Step 4 of 4 • Verify all details before saving
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500 mb-2">
            Progress
          </p>

          <div className="w-44 h-3 rounded-full bg-slate-200 overflow-hidden">
            <div className="w-full h-full bg-green-600"></div>
          </div>
        </div>

      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">

        <h3 className="text-xl font-bold mb-6">
          Customer Summary
        </h3>

        <div className="grid grid-cols-2 gap-6">

          <div>
            <p className="text-slate-500 text-sm">Customer Name</p>
            <p className="font-semibold">
  {lead.customerName || "-"}
</p>
          </div>

          <div>
            <p className="text-slate-500 text-sm">Mobile</p>
            <p className="font-semibold">
  {lead.mobile || "-"}
</p>
          </div>

          <div>
            <p className="text-slate-500 text-sm">Shop</p>
            <p className="font-semibold">
  {lead.shopName || "-"}
</p>
          </div>

          <div>
            <p className="text-slate-500 text-sm">Customer Type</p>
            <p className="font-semibold">
  {lead.customerType || "-"}
</p>
          </div>

        </div>

      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">

        <h3 className="text-xl font-bold mb-6">
          Business Summary
        </h3>

        <div className="grid grid-cols-2 gap-6">

          <div>
            <p className="text-slate-500 text-sm">Lead Owner</p>
            <p className="font-semibold">
  {lead.leadOwner || "-"}
</p>
          </div>

          <div>
            <p className="text-slate-500 text-sm">Lead Source</p>
            <p className="font-semibold">
  {lead.leadSource || "-"}
</p>
          </div>

          <div>
            <p className="text-slate-500 text-sm">Priority</p>
            <p className="font-semibold">
  {lead.priority || "-"}
</p>
          </div>

          <div>
            <p className="text-slate-500 text-sm">Status</p>
            <p className="font-semibold">
  {lead.status || "-"}
</p>
          </div>

        </div>

      </div>

    

    </div>
  );
}
