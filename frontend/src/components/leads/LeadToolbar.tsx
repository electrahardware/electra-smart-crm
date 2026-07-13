import type {
  Dispatch,
  SetStateAction,
} from "react";

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

  priorityFilter: string;
  setPriorityFilter: Dispatch<SetStateAction<string>>;

  stateFilter: string;
  setStateFilter: Dispatch<SetStateAction<string>>;

  cityFilter: string;
  setCityFilter: Dispatch<SetStateAction<string>>;

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

  priorityFilter,
  setPriorityFilter,

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

    <div className="space-y-4 border-b p-6">

      <input
        type="text"
        placeholder="🔍 Search Customer, Shop, Mobile..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-8">

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="rounded-xl border px-4 py-3"
        >
          <option value="All">All Status</option>
          <option value="New">New</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Quotation Sent">
            Quotation Sent
          </option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>

        <select
          value={ownerFilter}
          onChange={(e) =>
            setOwnerFilter(e.target.value)
          }
          className="rounded-xl border px-4 py-3"
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
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value)
          }
          className="rounded-xl border px-4 py-3"
        >
          <option value="All">
            All Priority
          </option>

          <option value="Hot">
            Hot
          </option>

          <option value="Warm">
            Warm
          </option>

          <option value="Cold">
            Cold
          </option>

        </select>

        <select
          value={stateFilter}
          onChange={(e) =>
            setStateFilter(e.target.value)
          }
          className="rounded-xl border px-4 py-3"
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

        <select
          value={cityFilter}
          onChange={(e) =>
            setCityFilter(e.target.value)
          }
          className="rounded-xl border px-4 py-3"
        >
          <option value="All">
            All Cities
          </option>

          {[
            ...new Set(
              leads
                .map((x) => x.city)
                .filter(Boolean)
            ),
          ].map((city) => (
            <option
              key={city}
              value={city}
            >
              {city}
            </option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(e.target.value)
          }
          className="rounded-xl border px-4 py-3"
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
          className="rounded-xl border px-4 py-3"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) =>
            setToDate(e.target.value)
          }
          className="rounded-xl border px-4 py-3"
        />

      </div>

    </div>

  );

}