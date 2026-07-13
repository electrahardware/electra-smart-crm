import { useEffect, useState } from "react";
import axios from "axios";

import PhoneInput from "../ui/PhoneInput";
import TextInput from "../ui/TextInput";
import SelectInput from "../ui/SelectInput";

import customerTypes from "../../constants/customerTypes";
import { useLead } from "../../hooks/useLead";
import { saveLeadForm } from "../../utils/leadStorage";

type LeadForm = {
  customerName: string;
  mobile: string;
  whatsapp: string;
  shopName: string;
  customerType: string;
  email: string;
  gst: string;
  country: string;
  state: string;
  district: string;
  area: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
};

const defaultForm: LeadForm = {
  customerName: "",
  mobile: "",
  whatsapp: "",
  shopName: "",
  customerType: "",
  email: "",
  gst: "",
  country: "India",
  state: "",
  district: "",
  area: "",
  pincode: "",
  addressLine1: "",
  addressLine2: "",
};

export default function Step1Customer() {
  const { lead, setLead } = useLead();

useEffect(() => {
  saveLeadForm(lead);
}, [lead]);

const updateLead = (field: string, value: string) => {

  console.log("UPDATE =", field, value);

  setLead((prev) => ({
    ...prev,
    [field]: value,
  }));

};

useEffect(() => {

  async function fetchPincode() {

    if (lead.pincode.length !== 6) {

  setLead((prev) => ({

  ...prev,

  state: "",

  district: "",

  city: "",

  area: "",

}));

  return;

}

    try {

      const { data } = await axios.get(

        `https://api.postalpincode.in/pincode/${lead.pincode}`

      );

      if (
        data[0].Status === "Success" &&
        data[0].PostOffice.length > 0
      ) {

        const office = data[0].PostOffice[0];

        setLead((prev) => ({

  ...prev,

  country: office.Country,

  state: office.State,

  district: office.District,

  city: office.District,

  area: office.Name,

}));

      }

    } catch (err) {

      console.error(err);

    }

  }

  fetchPincode();

}, [lead.pincode]);

  const [form, setForm] =
    useState<LeadForm>(defaultForm);

  useEffect(() => {

    const saved =
      localStorage.getItem("leadForm");

    if (saved) {

      setForm({
        ...defaultForm,
        ...JSON.parse(saved),
      });

    }

  }, []);

  useEffect(() => {

    localStorage.setItem(
      "leadForm",
      JSON.stringify(form)
    );

  }, [form]);

  const update = (
    key: keyof LeadForm,
    value: string
  ) => {

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  };

  return (

    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold text-slate-800">
            Customer Details
          </h2>

          <p className="text-slate-500 mt-2">
            Step 1 of 4 • Customer Information
          </p>

        </div>

        <div className="text-right">

          <p className="text-sm text-slate-500 mb-2">
            Progress
          </p>

          <div className="w-44 h-3 rounded-full bg-slate-200">

            <div className="w-1/4 h-full bg-red-600"></div>

          </div>

        </div>

      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">

        <h3 className="text-xl font-bold mb-6">
          Basic Information
        </h3>

        <div className="grid grid-cols-2 gap-6">          <PhoneInput
  label="Mobile Number"
  required
  value={lead.mobile}
  field="mobile"
  onChange={(value) => updateLead("mobile", value)}
/>

          <PhoneInput
  label="WhatsApp Number"
  value={lead.whatsapp}
  field="whatsapp"
  onChange={(value) => updateLead("whatsapp", value)}
/>

<TextInput
  label="Lead Date"
  type="date"
  value={
    lead.leadDate ||
    new Date().toISOString().slice(0, 10)
  }
  field="leadDate"
  onChange={(e) =>
    updateLead("leadDate", e.target.value)
  }
/>

          <TextInput
  label="Customer Name"
  required
  value={lead.customerName}
  field="customerName"
  placeholder="Enter customer name"
  onChange={(e) =>
    updateLead("customerName", e.target.value)
  }
/>

          <TextInput
  label="Shop / Company Name"
  value={lead.shopName}
  field="shopName"
  placeholder="Enter shop name"
  onChange={(e) =>
    updateLead("shopName", e.target.value)
  }
/>

          <SelectInput
  label="Customer Type"
  required
  value={lead.customerType}
  field="customerType"
  options={customerTypes}
  onChange={(e) =>
    updateLead("customerType", e.target.value)
  }
/>

          <TextInput
  label="Email Address"
  type="email"
  value={lead.email}
  field="email"
  placeholder="example@email.com"
  onChange={(e) =>
    updateLead("email", e.target.value)
  }
/>

        </div>

      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">

        <h3 className="text-xl font-bold mb-6">
          Address Information
        </h3>

        <div className="grid grid-cols-2 gap-6">

          <TextInput
  label="GST Number"
  value={lead.gst}
  field="gst"
  placeholder="24ABCDE1234F1Z5"
  onChange={(e) =>
    updateLead("gst", e.target.value)
  }
/>

          <TextInput
  label="Pincode"
  required
  value={lead.pincode}
  field="pincode"
  placeholder="360001"
  onChange={(e) =>
    updateLead("pincode", e.target.value)
  }
/>

          <TextInput
  label="Country"
  value={lead.country}
  readOnly
/>       <TextInput
  label="State"
  value={lead.state}
  placeholder="Auto after pincode"
  readOnly
/>

          <TextInput
  label="District"
  value={lead.district}
  placeholder="Auto after pincode"
  readOnly
/>

<TextInput
  label="City"
  value={lead.city}
  field="city"
  placeholder="Enter City"
  onChange={(e) =>
    updateLead("city", e.target.value)
  }
/>

          <TextInput
  label="Area / Locality"
  value={lead.area}
  field="area"
  placeholder="Auto after pincode"
  onChange={(e) =>
    updateLead("area", e.target.value)
  }
/>

        </div>

        <div className="mt-6">

          <TextInput
  label="Address Line 1"
  value={lead.addressLine1}
  field="addressLine1"
  placeholder="Building / Street / Landmark"
  onChange={(e) =>
    updateLead("addressLine1", e.target.value)
  }
/>

        </div>

        <div className="mt-6">

          <TextInput
  label="Address Line 2"
  value={lead.addressLine2}
  field="addressLine2"
  placeholder="Additional Address (Optional)"
  onChange={(e) =>
    updateLead("addressLine2", e.target.value)
  }
/>

        </div>

      </div>

    </div>

  );

}