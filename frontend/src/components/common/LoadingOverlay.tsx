interface Props {
  open: boolean;
  text?: string;
}

export default function LoadingOverlay({
  open,
  text = "Please wait...",
}: Props) {

  if (!open) {
    return null;
  }

  return (

    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="rounded-2xl bg-white px-10 py-8 shadow-2xl">

        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />

        <p className="mt-5 text-center font-semibold text-slate-700">

          {text}

        </p>

      </div>

    </div>

  );

}