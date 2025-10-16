"use client";

import { ReactNode, ElementType } from "react";
import clsx from "clsx";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  destructive?: boolean;
  as?: ElementType;
  href?: string;
}

export default function Button({
  children,
  variant = "primary",
  destructive = false,
  className,
  as: Component = "button",
  href,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center px-4 py-2 font-semibold rounded-md shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

  // --- UPDATED VARIANT STYLES FOR BETTER VISIBILITY ---
  const variantStyles = {
    primary: "bg-primary text-surface hover:bg-primary-hover",
    secondary: "bg-surface-secondary text-text-primary hover:bg-border", // NEW: Solid light gray background
    ghost: "bg-transparent text-text-secondary hover:bg-surface-secondary",
  };

  const destructiveStyles =
    "bg-error text-surface hover:opacity-90 focus:ring-error";

  const styles = clsx(
    baseStyles,
    destructive ? destructiveStyles : variantStyles[variant],
    className
  );

  // ... (Component rendering logic is unchanged)
  if (Component === "a" || (Component === Link && href)) {
    return (
      <Link href={href!} className={styles} {...(props as any)}>
        {children}
      </Link>
    );
  }

  return (
    <Component className={styles} {...props}>
      {children}
    </Component>
  );
}
