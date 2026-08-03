import { useLead } from "../../hooks/useLead";

type SummaryItemProps = { label: string; value?: string | null };

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value || "-"}</p>
    </div>
  );
}

export default function Step4Review() {
  const { lead } = useLead();
  const address = [lead.addressLine1, lead.addressLine2].filter(Boolean).join(", ");

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Customer Summary</h2>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryItem label="Mobile" value={lead.mobile} />
          <SummaryItem label="WhatsApp" value={lead.whatsapp} />
          <SummaryItem label="Customer Name" value={lead.customerName} />
          <SummaryItem label="Shop Name" value={lead.shopName} />
          <SummaryItem label="Customer Type" value={lead.customerType} />
          <SummaryItem label="Email" value={lead.email} />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Address Summary</h2>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryItem label="Country" value={lead.country} />
          <SummaryItem label="State" value={lead.state} />
          <SummaryItem label="District" value={lead.district} />
          <SummaryItem label="City" value={lead.city} />
          <SummaryItem label="Area" value={lead.area} />
          <SummaryItem label="Pincode" value={lead.pincode} />
          <SummaryItem label="Address" value={address} />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Business Summary</h2>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryItem label="Lead Owner" value={lead.leadOwner} />
          <SummaryItem label="Lead Status" value={lead.status} />
          <SummaryItem label="Products Interested" value={lead.products.join(", ")} />
        </div>
      </section>
    </div>
  );
}
