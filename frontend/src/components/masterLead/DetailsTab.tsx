import { useEffect, useState } from "react";
import { Pencil, Save, X } from "lucide-react";

import { useLeadDetails } from "../../contexts/LeadDetailsContext";

import SectionCard from "./SectionCard";
import InfoRow from "./InfoRow";
import EditableInfoRow from "./EditableInfoRow";
import { updateLead } from "../../services/leadService";

export default function DetailsTab() {
  const {
  lead,
  setLead,
} = useLeadDetails();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (lead) {
      setForm(lead);
    }
  }, [lead]);

  if (!lead) {
    return (
      <div className="p-6 text-center text-slate-500">
        No lead selected.
      </div>
    );
  }

  const cancelEdit = () => {
    setForm(lead);
    setEditMode(false);
  };

  const saveLead = async () => {
  try {
    // 1. જો lead નથી તો function બંધ
    if (!lead) return;

    // 2. Backend API ને call કર
    const updatedLead = await updateLead(
      lead.id,
      form
    );

    // 3. Context માં નવી lead મૂકી દે
    setLead(updatedLead);

    // 4. Form માં પણ નવી values મૂકી દે
    setForm(updatedLead);

    // 5. Edit Mode બંધ કર
    setEditMode(false);

    // 6. Console માં Success બતાવ
    console.log("Lead Updated Successfully");

  } catch (error) {

    console.error(error);

    alert("Unable to update lead.");

  }
};

  return (
    <>
      {/* Top Action Bar */}

      <div className="flex items-center justify-end gap-3 px-6 pt-6">

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Pencil size={16} />
            Edit Lead
          </button>
        ) : (
          <>
            <button
              onClick={saveLead}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              <Save size={16} />
              Save
            </button>

            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-slate-100"
            >
              <X size={16} />
              Cancel
            </button>
          </>
        )}

      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">

        <SectionCard title="Customer Information">
  <EditableInfoRow label="Customer Name" field="customerName" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Mobile" field="mobile" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Secondary Mobile" field="secondaryMobile" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="WhatsApp" field="whatsapp" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Email" field="email" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Language" field="language" form={form} setForm={setForm} editMode={editMode} />
</SectionCard>

        <SectionCard title="Business Information">
  <EditableInfoRow label="Shop Name" field="shopName" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Customer Type" field="customerType" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="GST Number" field="gst" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Website" field="website" form={form} setForm={setForm} editMode={editMode} />
</SectionCard>

        <SectionCard title="Address">
  <EditableInfoRow label="Country" field="country" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="State" field="state" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="District" field="district" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="City" field="city" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Area" field="area" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Pincode" field="pincode" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Address Line 1" field="addressLine1" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Address Line 2" field="addressLine2" form={form} setForm={setForm} editMode={editMode} />
</SectionCard>

        <SectionCard title="Lead Information">
  <EditableInfoRow label="Lead Owner" field="leadOwner" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Lead Source" field="leadSource" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Status" field="status" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Priority" field="priority" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Expected Value" field="expectedValue" form={form} setForm={setForm} editMode={editMode} />
  <EditableInfoRow label="Probability" field="probability" form={form} setForm={setForm} editMode={editMode} />

  <InfoRow
    label="Products"
    value={
      Array.isArray(form.products)
        ? form.products.join(", ")
        : String(form.products ?? "-")
    }
  />
</SectionCard>

      </div>
    </>
  );
}