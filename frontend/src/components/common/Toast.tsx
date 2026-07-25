interface Props {
  show: boolean;
  message: string;
  type?: "success" | "error";
}

export default function Toast({
  show,
  message,
  type = "success",
}: Props) {

  if (!show) return null;

  return (
    <div className="fixed right-6 top-6 z-[9999]">

      <div
  className={`min-w-[280px] rounded-xl px-5 py-4 text-white shadow-2xl transition-all duration-300 ${
    show
      ? "translate-y-0 opacity-100"
      : "-translate-y-5 opacity-0"
  } ${
    type === "success"
      ? "bg-emerald-600"
      : "bg-red-600"
  }`}
>
        <div className="flex items-center gap-3">

  <span className="text-xl">
    {type === "success" ? "✅" : "❌"}
  </span>

  <span>{message}</span>

</div>
      </div>

    </div>
  );

}