interface Props {

  allSelected: boolean;

  onToggleAll: () => void;

}

export default function LeadTableHeader({

  allSelected,

  onToggleAll,

}: Props) {

  return (

    <thead className="sticky top-0 z-20 bg-white shadow-sm">

      <tr className="bg-white">

        <th className="p-3">

          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleAll}
          />

        </th>

        <th className="p-3 text-left">
          Date
        </th>

        <th className="p-3 text-left">
          Customer
        </th>

        <th className="p-3 text-left">
          Mobile
        </th>

        <th className="p-3 text-left">
          Shop
        </th>

        <th className="p-3 text-left">
          City
        </th>

        <th className="p-3 text-left">
          Owner
        </th>

        <th className="p-3 text-left">
          Status
        </th>

        <th className="p-3 text-left">
          Priority
        </th>

        <th className="p-3 text-left">
          Actions
        </th>

      </tr>

    </thead>

  );

}