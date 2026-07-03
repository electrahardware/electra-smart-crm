import TextInput from "../ui/TextInput";
import SelectInput from "../ui/SelectInput";
import TextArea from "../ui/TextArea";

import priority from "../../constants/priority";
import leadStatus from "../../constants/leadStatus";
import { useLead } from "../../hooks/useLead";

export default function Step3Followup() {
  const { lead, setLead } = useLead();

const updateLead = (field: string, value: string) => {
  setLead((prev) => ({
    ...prev,
    [field]: value,
  }));
};
  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold text-slate-800">
            Follow-up Details
          </h2>

          <p className="text-slate-500 mt-2">
            Step 3 of 4 • Sales Follow-up
          </p>

        </div>

        <div>

          <p className="text-sm text-slate-500 mb-2">
            Progress
          </p>

          <div className="w-44 h-3 rounded-full bg-slate-200 overflow-hidden">
            <div className="w-3/4 h-full bg-red-600"></div>
          </div>

        </div>

      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">

        <div className="grid grid-cols-2 gap-6">

          <TextInput
  label="Next Follow-up Date"
  type="date"
  value={lead.followupDate}
  field="followupDate"
  onChange={(e) =>
    updateLead("followupDate", e.target.value)
  }
/>

          <TextInput
  label="Next Follow-up Time"
  type="time"
  value={lead.followupTime}
  field="followupTime"
  onChange={(e) =>
    updateLead("followupTime", e.target.value)
  }
/>

          <SelectInput
  label="Lead Status"
  required
  value={lead.status}
  field="status"
  options={leadStatus}
  onChange={(e) =>
    updateLead("status", e.target.value)
  }
/>

          <SelectInput
  label="Lead Priority"
  required
  value={lead.priority}
  field="priority"
  options={priority}
  onChange={(e) =>
    updateLead("priority", e.target.value)
  }
/>

          <TextInput
  label="Expected Order Value (₹)"
  type="number"
  value={String(lead.expectedValue)}
  field="expectedValue"
  placeholder="50000"
  onChange={(e) =>
    updateLead("expectedValue", e.target.value)
  }
/>

          <TextInput
  label="Winning Probability (%)"
  type="number"
  value={String(lead.probability)}
  field="probability"
  placeholder="75"
  onChange={(e) =>
    updateLead("probability", e.target.value)
  }
/>

        </div>

      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">

        <TextArea
  label="Follow-up Notes"
  value={lead.notes}
  onChange={(e) =>
    updateLead("notes", e.target.value)
  }
  placeholder="Write discussion summary, customer requirements, next action..."
/>

      </div>

    </div>
  );
}