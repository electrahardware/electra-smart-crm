interface Props { allSelected: boolean; onToggleAll: () => void; }

export default function LeadTableHeader({ allSelected, onToggleAll }: Props) {
  return <thead className="sticky top-0 z-20 bg-white/95 shadow-[0_1px_0_rgba(0,0,0,.08)] backdrop-blur">
    <tr className="text-left">
      <th className="w-12 px-4 py-4"><input aria-label="Select all leads" type="checkbox" checked={allSelected} onChange={onToggleAll} /></th>
      <th className="min-w-[260px] px-4 py-4">Customer</th>
      <th className="min-w-[155px] px-4 py-4">Mobile</th>
      <th className="min-w-[120px] px-4 py-4">City</th>
      <th className="min-w-[150px] px-4 py-4">Owner</th>
      <th className="min-w-[145px] px-4 py-4">Status</th>
      <th className="min-w-[125px] px-4 py-4">Last Edit</th>
      <th className="min-w-[135px] px-4 py-4">Next Follow-up</th>
      <th className="min-w-[190px] px-4 py-4 text-right">Actions</th>
    </tr>
  </thead>;
}
