import { X, Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

import MasterLeadHeader from "./MasterLeadHeader";
import { useLeadDetails } from "../../contexts/LeadDetailsContext";

type Props = {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
};

export default function MasterLeadDrawer({
  open,
  onClose,
  children,
}: Props) {
  const { lead, loading } = useLeadDetails();

  if (!open) return null;

  return (
    <>
      {/* Background */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="flex h-[90vh] w-[85vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

          {/* Top Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Electra Hardware
              </p>

              <h2 className="text-2xl font-bold">
                MASTER LEAD
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 transition hover:bg-slate-100">
                <Maximize2 size={18} />
              </button>

              <button
                onClick={onClose}
                className="rounded-lg p-2 transition hover:bg-red-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Lead Header */}
          <MasterLeadHeader
            lead={lead}
            loading={loading}
          />

          {/* Body */}
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>

        </div>
      </div>
    </>
  );
}