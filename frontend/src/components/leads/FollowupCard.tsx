import type { Lead } from "../../types/lead";
import { useLead } from "../../hooks/useLead";
import { EmptyLead } from "../../types/lead";

type Props = {
  lead: Lead;
};

export default function FollowupCard({
  lead,
}: Props) {
    const {
  setLead,
  setEditingId,
} = useLead();

function handleEdit() {

  setEditingId(lead.id!);

  setLead({
    ...EmptyLead,
    ...lead,
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

}
  return (
    <div className="border rounded-xl p-5 flex items-center justify-between hover:shadow-md transition">

      <div>

        <h3 className="text-lg font-bold">
          {lead.shopName || "-"}
        </h3>

        <p className="text-slate-600 mt-1">
          👤 {lead.customerName}
        </p>

        <p className="text-slate-500">
          📞 {lead.mobile}
        </p>

      </div>

      <div className="flex gap-3">

        <a
          href={`tel:${lead.mobile}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
        >
          📞 Call
        </a>
        <button
  onClick={handleEdit}
  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl"
>
  ✏ Edit
</button>

        <a
          href={`https://wa.me/${lead.mobile}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
        >
          💬 WhatsApp
        </a>

      </div>

    </div>
  );
}