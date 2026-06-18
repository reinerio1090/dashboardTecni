import { ButtonHTMLAttributes } from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        w-full
        bg-[#333333]
        text-white
        py-3
        rounded-lg
        font-medium
        transition
        hover:opacity-90
        cursor-pointer
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}