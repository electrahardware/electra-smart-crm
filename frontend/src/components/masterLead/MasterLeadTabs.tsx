import { useState } from "react";

import DetailsTab from "./DetailsTab";
import NotesTab from "./NotesTab";
import CallsTab from "./CallsTab";
import FollowupTab from "./FollowupTab";
import AttachmentsTab from "./AttachmentsTab";
import QuotationsTab from "./QuotationsTab";
import TimelineTab from "./TimelineTab";

const tabs = [
  "Details",
  "Notes",
  "Calls",
  "Follow-up",
  "Files",
  "Quotations",
  "Timeline",
] as const;

type Tab =
  | "Details"
  | "Notes"
  | "Calls"
  | "Follow-up"
  | "Files"
  | "Quotations"
  | "Timeline";

export default function MasterLeadTabs() {
  const [activeTab, setActiveTab] =
    useState<Tab>("Details");

  const renderTab = () => {
    switch (activeTab) {
      case "Details":
        return <DetailsTab />;

      case "Notes":
        return <NotesTab />;

      case "Calls":
        return <CallsTab />;

      case "Follow-up":
        return <FollowupTab />;

      case "Files":
        return <AttachmentsTab />;

      case "Quotations":
        return <QuotationsTab />;

      case "Timeline":
        return <TimelineTab />;

      default:
        return <DetailsTab />;
    }
  };

  return (
    <>
      {/* Tabs */}

      <div className="sticky top-0 z-20 border-b bg-white">

        <div className="flex overflow-x-auto">

          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-6 py-3 text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}

        </div>

      </div>

      {/* Active Tab */}

      <div className="min-h-[500px]">
        {renderTab()}
      </div>
    </>
  );
}