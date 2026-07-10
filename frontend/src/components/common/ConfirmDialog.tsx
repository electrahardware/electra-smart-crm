interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: Props) {

  if (!open) {
    return null;
  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <h2 className="text-2xl font-bold text-slate-800">

          {title}

        </h2>

        <p className="mt-3 text-slate-500">

          {message}

        </p>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border px-5 py-2 hover:bg-slate-100"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading
              ? "Deleting..."
              : confirmText}
          </button>

        </div>

      </div>

    </div>

  );

}