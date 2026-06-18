import { InputHTMLAttributes } from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({
  label,
  ...props
}: InputProps) {
  return (
    <div>
      <label className="block mb-2 text-sm text-gray-700">
        {label}
      </label>

      <input
        {...props}
        className="
          w-full
          border
          rounded-lg
          px-4
          py-3
          focus:outline-none
          focus:ring-2
          focus:ring-[#F1C380]
        "
      />
    </div>
  );
}