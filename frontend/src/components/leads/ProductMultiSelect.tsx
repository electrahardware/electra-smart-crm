import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

type ProductMultiSelectProps = {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
};

export default function ProductMultiSelect({ options, value, onChange }: ProductMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(
    () => options.filter((product) => product.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query],
  );

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  function toggleProduct(product: string) {
    onChange(value.includes(product) ? value.filter((item) => item !== product) : [...value, product]);
  }

  function openMenu() {
    setOpen(true);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (["Enter", "ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      openMenu();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, filteredOptions.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter" && filteredOptions[activeIndex]) {
      event.preventDefault();
      toggleProduct(filteredOptions[activeIndex]);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Products Interested <span className="text-slate-500">({value.length} Selected)</span>
      </label>

      <button
        ref={triggerRef}
        type="button"
        data-lead-field="products"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-left outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-200"
      >
        <span className="flex flex-1 flex-wrap gap-1.5">
          {value.length === 0 ? (
            <span className="py-0.5 text-sm text-slate-400">Select Products...</span>
          ) : (
            value.map((product) => (
              <span key={product} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                {product}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${product}`}
                  onClick={(event) => { event.stopPropagation(); toggleProduct(product); }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      toggleProduct(product);
                    }
                  }}
                  className="rounded-full hover:bg-red-100"
                >
                  <X size={13} />
                </span>
              </span>
            ))
          )}
        </span>
        <ChevronDown size={18} className={`shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          <div className="relative mb-2">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search products..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div role="listbox" aria-multiselectable="true" className="max-h-56 overflow-y-auto pr-1">
            {filteredOptions.length > 0 ? filteredOptions.map((product, index) => {
              const selected = value.includes(product);
              return (
                <button
                  key={product}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => toggleProduct(product)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${index === activeIndex ? "bg-slate-100" : "hover:bg-slate-50"}`}
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded border ${selected ? "border-red-600 bg-red-600 text-white" : "border-slate-400 bg-white"}`}>
                    {selected && <Check size={12} strokeWidth={3} />}
                  </span>
                  {product}
                </button>
              );
            }) : <p className="px-3 py-5 text-center text-sm text-slate-500">No products found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
