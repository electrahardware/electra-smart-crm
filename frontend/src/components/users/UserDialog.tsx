import { useState } from "react";
import {
  createUser,
} from "../../services/userService";

interface Props {

  open: boolean;

  onClose: () => void;

  onSuccess: () => void;

}

export default function UserDialog({

  open,

  onClose,

  onSuccess,

}: Props) {

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("Sales");

  const [loading, setLoading] =
  useState(false);

  async function handleSave() {

  try {

    setLoading(true);

    await createUser({

      name,

      email,

      password,

      role,

    });

    alert(
      "User created successfully."
    );

    setName("");

    setEmail("");

    setPassword("");

    setRole("Sales");

    await onSuccess();

    onClose();

  } catch (error: any) {

    alert(
      error.message
    );

  } finally {

    setLoading(false);

  }

}

  if (!open) {

    return null;

  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold">

          Create User

        </h2>

        <div className="space-y-4">

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Name"
            className="w-full rounded-xl border px-4 py-3"
          />

          <input
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Email"
            className="w-full rounded-xl border px-4 py-3"
          />

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Password"
            className="w-full rounded-xl border px-4 py-3"
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          >

            <option>

              Sales

            </option>

            <option>

              Manager

            </option>

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

  disabled={loading}

  onClick={handleSave}

  className="rounded-xl bg-red-600 px-5 py-2 text-white disabled:opacity-50"

>

  {loading
    ? "Saving..."
    : "Save User"}

</button>

        </div>

      </div>

    </div>

  );

}