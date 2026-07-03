import TextInput from "../ui/TextInput";
import SelectInput from "../ui/SelectInput";
import TextArea from "../ui/TextArea";

import leadSources from "../../constants/leadSources";
import leadOwners from "../../constants/leadOwners";
import languages from "../../constants/languages";
import products from "../../constants/products";
import { useLead } from "../../hooks/useLead";

export default function Step2Business() {
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
            Business Details
          </h2>

          <p className="text-slate-500 mt-2">
            Step 2 of 4 • Business Information
          </p>

        </div>

        <div className="text-right">

          <p className="text-sm text-slate-500 mb-2">
            Progress
          </p>

          <div className="w-44 h-3 rounded-full bg-slate-200 overflow-hidden">
            <div className="w-2/4 h-full bg-red-600"></div>
          </div>

        </div>

      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">

        <h3 className="text-xl font-bold text-slate-800 mb-6">
          Business Information
        </h3>

        <div className="grid grid-cols-2 gap-6">

          <TextInput
  label="Website"
  value={lead.website}
  field="website"
  placeholder="https://example.com"
  onChange={(e) =>
    updateLead("website", e.target.value)
  }
/>

          <TextInput
  label="GST Number"
  value={lead.gst}
  field="gst"
  placeholder="24ABCDE1234F1Z5"
  onChange={(e) =>
    updateLead("gst", e.target.value)
  }
/>

          <SelectInput
  label="Lead Source"
  required
  value={lead.leadSource}
  field="leadSource"
  options={leadSources}
  onChange={(e) =>
    updateLead("leadSource", e.target.value)
  }
/>

          <SelectInput
  label="Lead Owner"
  required
  value={lead.leadOwner}
  field="leadOwner"
  options={leadOwners}
  onChange={(e) =>
    updateLead("leadOwner", e.target.value)
  }
/>

          <SelectInput
  label="Preferred Language"
  value={lead.language}
  field="language"
  options={languages}
  onChange={(e) =>
    updateLead("language", e.target.value)
  }
/>

        </div>

      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">

        <h3 className="text-xl font-bold text-slate-800 mb-6">
          Products Interested
        </h3>

        <div className="grid grid-cols-2 gap-4">

          {products.map((product) => (

            <label
              key={product}
              className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:border-red-600 hover:bg-red-50 transition"
            >
              <input
  type="checkbox"
  checked={lead.products.includes(product)}
  onChange={(e) => {

    if (e.target.checked) {

      setLead((prev) => ({
        ...prev,
        products: [...prev.products, product],
      }));

    } else {

      setLead((prev) => ({
        ...prev,
        products: prev.products.filter(
          (p) => p !== product
        ),
      }));

    }

  }}
/>

              <span>{product}</span>

            </label>

          ))}

        </div>

      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">

        <h3 className="text-xl font-bold text-slate-800 mb-6">
          Additional Notes
        </h3>

        <TextArea
  label="Business Notes"
  value={lead.notes}
  required={false}
  onChange={(e) =>
    updateLead("notes", e.target.value)
  }
  placeholder="Write important business details..."
/>

      </div>

    </div>
  );
}