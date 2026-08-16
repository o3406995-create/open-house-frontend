
type PrimaryButtonProps = {
  text: React.ReactNode;
  onClick: () => void;
};

const PrimaryButton = ({ text, onClick }: PrimaryButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg bg-blue-800 py-5 text-sm font-semibold text-white hover:bg-blue-700"

    >
      {text}
    </button>
  );
};

export default PrimaryButton

