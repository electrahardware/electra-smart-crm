type Props = {
  children: React.ReactNode;
  onClick?: () => void;
};

export default function PrimaryButton({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-semibold transition"
    >
      {children}
    </button>
  );
}