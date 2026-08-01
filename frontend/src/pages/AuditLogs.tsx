import { useEffect, useState } from "react";
import { getAuditLogs, type AuditLog } from "../services/audit.service";

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setLoading(true);

      const result = await getAuditLogs({
        page: 1,
        limit: 50,
      });

      setLogs(result.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Module</th>
              <th className="border p-2">Action</th>
              <th className="border p-2">Entity</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="border p-2">
                  {new Date(log.createdAt).toLocaleString()}
                </td>

                <td className="border p-2">{log.userName}</td>

                <td className="border p-2">{log.module}</td>

                <td className="border p-2">{log.action}</td>

                <td className="border p-2">{log.entityName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
