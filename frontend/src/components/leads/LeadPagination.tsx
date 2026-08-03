interface Props {
  currentPage: number;

  totalPages: number;

  pageSize: number;

  totalRecords: number;

  setPageSize: (value: number) => void;

  setCurrentPage: (value: number | ((page: number) => number)) => void;
}

export default function LeadPagination({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  setPageSize,
  setCurrentPage,
}: Props) {
  const allLeads = pageSize === 0;
  const start = totalRecords === 0 ? 0 : allLeads ? 1 : (currentPage - 1) * pageSize + 1;

  const end = allLeads ? totalRecords : Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex flex-col gap-4 border-t bg-slate-50 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Rows per page</span>

        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));

            setCurrentPage(1);
          }}
          className="rounded-lg border px-3 py-2"
        >
          <option value={10}>10</option>

          <option value={25}>25</option>

          <option value={50}>50</option>

          <option value={100}>100</option>
          <option value={500}>500</option>
          <option value={0}>All ({totalRecords})</option>
        </select>
      </div>

      {!allLeads && <>
        <div className="text-sm text-slate-500">
          Showing <b>{start}</b> to <b>{end}</b> of <b>{totalRecords}</b> leads
        </div>
        <div className="text-sm text-slate-500">
          Page <b>{currentPage}</b> of <b>{totalPages}</b>
        </div>
      </>}

      {!allLeads && <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((page) => page - 1)}
          className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((page) => page + 1)}
          className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>}
    </div>
  );
}
