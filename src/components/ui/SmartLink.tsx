import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { isExternalHref } from "@/lib/routes";

type SmartLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

/**
 * Routes through `next/link` for in-app navigation and a plain anchor for
 * `mailto:` / `tel:` / absolute URLs, so callers never have to branch.
 * Off-site http(s) links open in a new tab with `rel="noreferrer"`;
 * `mailto:` and `tel:` deliberately do not — hijacking the tab for a phone
 * call is a worse experience than letting the handler take over.
 */
export function SmartLink({ href, children, ...props }: SmartLinkProps) {
  if (isExternalHref(href)) {
    const isHttp = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...(isHttp ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
