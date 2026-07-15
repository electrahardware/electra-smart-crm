import { useState } from "react";
import { createUser } from "../../services/userService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Sales");

  const [loading, setLoading] =
    useState(false);

   const isValid =
  name.trim() !== "" &&
  email.trim() !== "" &&
  password.trim() !== "";

  if (!open) return null;

  async function save() {
    try {
      setLoading(true);

      await createUser({
  name: name.trim(),
  email: email.trim().toLowerCase(),
  password,
  role,
});

setName("");
setEmail("");
setPassword("");
setRole("Sales");

await onSuccess();

onClose();

alert("User created successfully.");

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">

        <h2 className="mb-6 text-2xl font-bold">
          Add User
        </h2>

        <div className="space-y-4">

          <input
            className="w-full rounded-xl border p-3"
            placeholder="Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full rounded-xl border p-3"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <select
            className="w-full rounded-xl border p-3"
            value={role}
            onChange={(e)=>setRole(e.target.value)}
          >
            <option>Owner</option>
            <option>Manager</option>
            <option>Sales</option>
          </select>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-2"
          >
            Cancel
          </button>

          <button
            disabled={loading || !isValid}
            onClick={save}
            className="rounded-xl bg-red-600 px-5 py-2 text-white"
          >
            {loading ? "Saving..." : "Save User"}
          </button>

        </div>

      </div>

    </div>
  );
}