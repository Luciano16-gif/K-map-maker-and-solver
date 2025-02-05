import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = "",
    ...rest
  }) => {
    return (
      <button
        className={`px-4 py-2 bg-blue-500 text-white rounded transition-colors duration-200 hover:bg-blue-600 ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  };