import { useState } from "react";
import { resetPassword, type User } from "../../services/userService";

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

export default function ResetPasswordDialog({
  open,
  user,
  onClose,
}: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open || !user) {
    return null;
  }

  async function handleReset() {
    if (!password.trim()) {
      alert("Please enter password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(user!.id, password);

      alert("Password reset successfully.");

      setPassword("");
      setConfirmPassword("");

      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold">
          Reset Password
        </h2>

        <p className="mb-5 text-slate-600">
          User: <strong>{user!.name}</strong>
        </p>

        <div className="space-y-4">

          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            className="w-full rounded-xl border px-4 py-3"
          />

          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full rounded-xl border px-4 py-3"
          />

          <label className="flex items-center gap-2 text-sm">

            <input
              type="checkbox"
              checked={showPassword}
              onChange={() =>
                setShowPassword(!showPassword)
              }
            />

            Show Password

          </label>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={() => {
              setPassword("");
              setConfirmPassword("");
              onClose();
            }}
            className="rounded-xl border px-5 py-2"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleReset}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </div>

      </div>

    </div>
  );
}