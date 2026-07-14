import { useMemo, useState } from "react";

type Props = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
};

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: Props) {

  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const filtered = useMemo(() => {

    return [...options]
      .sort((a, b) =>
        a.localeCompare(b)
      )
      .filter((item) =>
        item
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );

  }, [options, search]);

  function toggle(item: string) {

    if (selected.includes(item)) {

      onChange(
        selected.filter(
          (x) => x !== item
        )
      );

      return;

    }

    onChange([
      ...selected,
      item,
    ]);

  }

  return (

    <div className="relative">

      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        className="w-full rounded-xl border bg-white px-4 py-3 text-left"
      >

        {selected.length === 0
          ? label
          : `${selected.length} Selected`}

      </button>

      {open && (

        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg">

          <div className="p-3">

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-3 py-2"
            />

          </div>

          <div className="max-h-64 overflow-auto">

            <label className="flex items-center gap-2 px-3 py-2">

              <input
                type="checkbox"
                checked={
                  selected.length ===
                  filtered.length
                }
                onChange={(e) => {

                  if (e.target.checked) {

                    onChange(filtered);

                  } else {

                    onChange([]);

                  }

                }}
              />

              Select All

            </label>

            {filtered.map((item) => (

              <label
                key={item}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100"
              >

                <input
                  type="checkbox"
                  checked={selected.includes(
                    item
                  )}
                  onChange={() =>
                    toggle(item)
                  }
                />

                {item}

              </label>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}