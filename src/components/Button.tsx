import React, { ReactNode, MouseEvent } from "react";
import "./Components.css";

interface ButtonProps {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  className,
  disabled = false,
}) => {
  const buttonClasses = `btn btn-${variant} ${className || ""}`.trim();
  return (
    <button onClick={onClick} className={buttonClasses} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
