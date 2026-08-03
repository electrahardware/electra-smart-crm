import { useEffect, type KeyboardEvent } from "react";
import axios from "axios";

import PhoneInput from "../ui/PhoneInput";
import SelectInput from "../ui/SelectInput";
import TextInput from "../ui/TextInput";
import customerTypes from "../../constants/customerTypes";
import leadOwners from "../../constants/leadOwners";
import leadStatus from "../../constants/leadStatus";
import products from "../../constants/products";
import { useLead } from "../../hooks/useLead";
import { isOwnerOrManager } from "../../utils/auth";
import { saveLeadForm } from "../../utils/leadStorage";
import ProductMultiSelect from "./ProductMultiSelect";

const focusOrder = [
  "mobile", "whatsapp", "leadDate", "customerName", "shopName", "customerType",
  "email", "pincode", "country", "state", "district", "city", "area",
  "addressLine1", "addressLine2", "leadOwner", "products", "status", "wizard-next",
];

export default function Step1Customer() {
  const { lead, setLead } = useLead();
  const canChangeOwner = isOwnerOrManager();

  useEffect(() => {
    saveLeadForm(lead);
  }, [lead]);

  const updateLead = (field: string, value: string) => {
    setLead((previous) => ({ ...previous, [field]: value }));
  };

  useEffect(() => {
    async function fetchPincode() {
      if (lead.pincode.length !== 6) {
        setLead((previous) => ({
          ...previous,
          state: "",
          district: "",
          city: "",
          area: "",
        }));
        return;
      }

      try {
        const { data } = await axios.get(
          `https://api.postalpincode.in/pincode/${lead.pincode}`,
        );

        if (data[0].Status === "Success" && data[0].PostOffice.length > 0) {
          const office = data[0].PostOffice[0];
          setLead((previous) => ({
            ...previous,
            country: office.Country,
            state: office.State,
            district: office.District,
            city: office.District,
            area: office.Name,
          }));
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchPincode();
  }, [lead.pincode, setLead]);

  const sectionClass = "rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5";
  const gridClass = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

  function moveToNextField(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || event.defaultPrevented) {
      return;
    }

    const currentField = (event.target as HTMLElement).dataset.leadField;
    const currentIndex = focusOrder.indexOf(currentField || "");

    if (currentIndex < 0 || currentField === "products") {
      return;
    }

    const nextField = focusOrder[currentIndex + 1];
    if (!nextField) {
      return;
    }

    event.preventDefault();
    document.querySelector<HTMLElement>(`[data-lead-field="${nextField}"]`)?.focus();
  }

  return (
    <div className="space-y-4" onKeyDownCapture={moveToNextField}>
      <section className={sectionClass}>
        <h2 className="mb-4 text-lg font-bold text-slate-800">Customer Details</h2>
        <div className={gridClass}>
          <PhoneInput label="Mobile Number" required value={lead.mobile} field="mobile" onChange={(value) => updateLead("mobile", value)} />
          <PhoneInput label="WhatsApp Number" value={lead.whatsapp} field="whatsapp" onChange={(value) => updateLead("whatsapp", value)} />
          <TextInput label="Lead Date" type="date" value={lead.leadDate || new Date().toISOString().slice(0, 10)} field="leadDate" onChange={(event) => updateLead("leadDate", event.target.value)} />
          <TextInput label="Customer Name" value={lead.customerName} field="customerName" placeholder="Enter customer name" onChange={(event) => updateLead("customerName", event.target.value)} />
          <TextInput label="Shop / Company Name" value={lead.shopName} field="shopName" placeholder="Enter shop name" onChange={(event) => updateLead("shopName", event.target.value)} />
          <SelectInput label="Customer Type" value={lead.customerType} field="customerType" options={customerTypes} onChange={(event) => updateLead("customerType", event.target.value)} />
          <TextInput label="Email Address" type="email" value={lead.email} field="email" placeholder="example@email.com" onChange={(event) => updateLead("email", event.target.value)} />
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="mb-4 text-lg font-bold text-slate-800">Address Information</h2>
        <div className={gridClass}>
          <TextInput label="Pincode" value={lead.pincode} field="pincode" placeholder="360001" onChange={(event) => updateLead("pincode", event.target.value)} />
          <TextInput label="Country" value={lead.country} field="country" readOnly />
          <TextInput label="State" value={lead.state} field="state" placeholder="Auto after pincode" readOnly />
          <TextInput label="District" value={lead.district} field="district" placeholder="Auto after pincode" readOnly />
          <TextInput label="City" value={lead.city} field="city" placeholder="Enter city" onChange={(event) => updateLead("city", event.target.value)} />
          <TextInput label="Area / Locality" value={lead.area} field="area" placeholder="Auto after pincode" onChange={(event) => updateLead("area", event.target.value)} />
          <TextInput label="Address Line 1" value={lead.addressLine1} field="addressLine1" placeholder="Building / Street / Landmark" onChange={(event) => updateLead("addressLine1", event.target.value)} />
          <TextInput label="Address Line 2" value={lead.addressLine2} field="addressLine2" placeholder="Additional address (optional)" onChange={(event) => updateLead("addressLine2", event.target.value)} />
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="mb-4 text-lg font-bold text-slate-800">Business Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput label="Lead Owner" required value={lead.leadOwner} field="leadOwner" options={leadOwners} disabled={!canChangeOwner} onChange={(event) => updateLead("leadOwner", event.target.value)} />
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="mb-4 text-lg font-bold text-slate-800">Products Interested</h2>
        <ProductMultiSelect options={products} value={lead.products} onChange={(selectedProducts) => setLead((previous) => ({ ...previous, products: selectedProducts }))} />
      </section>

      <section className={sectionClass}>
        <h2 className="mb-4 text-lg font-bold text-slate-800">Lead Status</h2>
        <div className="max-w-md">
          <SelectInput label="Lead Status" required value={lead.status} field="status" options={leadStatus} onChange={(event) => updateLead("status", event.target.value)} />
        </div>
      </section>
    </div>
  );
}
