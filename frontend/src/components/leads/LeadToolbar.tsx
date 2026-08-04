import type {
  Dispatch,
  SetStateAction,
} from "react";

import MultiSelectDropdown from "../ui/MultiSelectDropdown";
import { LEAD_STATUS_OPTIONS } from "../../constants/statusConfig";

import type {
  Lead,
} from "../../types/lead";

interface Props {

  leads: Lead[];

  search: string;
  setSearch: Dispatch<SetStateAction<string>>;

  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;

  ownerFilter: string;
  setOwnerFilter: Dispatch<SetStateAction<string>>;

  stateFilter: string;
  setStateFilter: Dispatch<SetStateAction<string>>;

  cityFilter: string[];
setCityFilter: Dispatch<
  SetStateAction<string[]>
>;

  sourceFilter: string;
  setSourceFilter: Dispatch<SetStateAction<string>>;

  followupFilter: string;
  setFollowupFilter: Dispatch<SetStateAction<string>>;

  fromDate: string;
  setFromDate: Dispatch<SetStateAction<string>>;

  toDate: string;
  setToDate: Dispatch<SetStateAction<string>>;
}

export default function LeadToolbar({

  leads,

  search,
  setSearch,

  statusFilter,
  setStatusFilter,

  ownerFilter,
  setOwnerFilter,

  stateFilter,
  setStateFilter,

  cityFilter,
  setCityFilter,

  sourceFilter,
  setSourceFilter,

  followupFilter,
  setFollowupFilter,

  fromDate,
  setFromDate,

  toDate,
  setToDate,

}: Props) {

  return (

    <div className="space-y-4 border-b border-zinc-100 bg-zinc-50/50 p-5 sm:p-6">

      <input
        type="text"
        placeholder="🔍 Search Customer, Shop, Mobile..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm"
      />

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="border border-zinc-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="All">All Status</option>
          {LEAD_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>

        <select
          value={ownerFilter}
          onChange={(e) =>
            setOwnerFilter(e.target.value)
          }
          className="border border-zinc-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="All">
            All Owners
          </option>

          {[
            ...new Set(
              leads
                .map((x) => x.leadOwner)
                .filter(Boolean)
            ),
          ].map((owner) => (
            <option
              key={owner}
              value={owner}
            >
              {owner}
            </option>
          ))}
        </select>

        <select
          value={stateFilter}
          onChange={(e) =>
            setStateFilter(e.target.value)
          }
          className="border border-zinc-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="All">
            All States
          </option>

          {[
            ...new Set(
              leads
                .map((x) => x.state)
                .filter(Boolean)
            ),
          ].map((state) => (
            <option
              key={state}
              value={state}
            >
              {state}
            </option>
          ))}
        </select>

        <MultiSelectDropdown
  label="Select Cities"
  options={[
    ...new Set(
      leads
        .map((x) => x.city)
        .filter(Boolean)
    ),
  ]}
  selected={cityFilter}
  onChange={setCityFilter}
/>

        <select
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(e.target.value)
          }
          className="border border-zinc-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="All">
            All Sources
          </option>

          {[
            ...new Set(
              leads
                .map((x) => x.leadSource)
                .filter(Boolean)
            ),
          ].map((source) => (
            <option
              key={source}
              value={source}
            >
              {source}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) =>
            setFromDate(e.target.value)
          }
          className="border border-zinc-200 bg-white px-3 py-2.5 text-sm"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) =>
            setToDate(e.target.value)
          }
          className="border border-zinc-200 bg-white px-3 py-2.5 text-sm"
        />

      </div>

    </div>

  );

}
