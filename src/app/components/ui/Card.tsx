import { ReactNode, ElementType } from "react";
import clsx from "clsx";
import Link from "next/link";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: ElementType;
  href?: string;
}

export default function Card({
  children,
  className,
  as: Component = "div",
  href,
  ...props
}: CardProps) {
  const baseStyles =
    "bg-surface rounded-lg shadow-md border border-border transition-all";

  const styles = clsx(baseStyles, className);

  if (Component === Link && href) {
    return (
      <Link href={href} className={styles} {...(props as any)}>
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
