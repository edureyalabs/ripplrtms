"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

/**
 * A <tr> that navigates to `href` when clicked anywhere except an interactive
 * child (links/buttons), which stop propagation themselves.
 */
export function ClickableRow({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function onClick(e: MouseEvent<HTMLTableRowElement>) {
    if ((e.target as HTMLElement).closest("a,button")) return;
    router.push(href);
  }

  return (
    <tr onClick={onClick} className={`cursor-pointer ${className ?? ""}`}>
      {children}
    </tr>
  );
}
