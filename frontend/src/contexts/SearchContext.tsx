import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SearchResult = {
  id: number;
  customerName: string;
  mobile: string;
  whatsapp?: string | null;
  shopName?: string | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  leadOwner?: string | null;
};

type SearchContextType = {
  // Search Text
  search: string;
  setSearch: (value: string) => void;

  // Loading
  loading: boolean;
  setLoading: (value: boolean) => void;

  // Search Results
  results: SearchResult[];
  setResults: (value: SearchResult[]) => void;

  // Selected Lead
  selectedLeadId: number | null;
  setSelectedLeadId: (value: number | null) => void;

  // Dropdown
  dropdownOpen: boolean;
  setDropdownOpen: (value: boolean) => void;
};

const SearchContext = createContext<SearchContextType | undefined>(
  undefined
);

export function SearchProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState<SearchResult[]>([]);

  const [selectedLeadId, setSelectedLeadId] =
    useState<number | null>(null);

  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  const value = useMemo(
    () => ({
      search,
      setSearch,

      loading,
      setLoading,

      results,
      setResults,

      selectedLeadId,
      setSelectedLeadId,

      dropdownOpen,
      setDropdownOpen,
    }),
    [
      search,
      loading,
      results,
      selectedLeadId,
      dropdownOpen,
    ]
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error(
      "useSearch must be used inside SearchProvider"
    );
  }

  return context;
}