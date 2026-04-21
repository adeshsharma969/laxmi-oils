"use client";

import React, { forwardRef, useCallback, useMemo, Suspense } from "react";
import NextLink from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";

type To =
  | string
  | {
      pathname?: string;
      search?: string;
      hash?: string;
      query?: Record<string, string | number | boolean | null | undefined>;
    };

type LinkProps = Omit<React.ComponentProps<typeof NextLink>, "href" | "className"> & {
  to?: To;
  href?: To;
  className?: string;
};

type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

const routeStatePrefix = "laxmi_route_state:";

function toHref(to: To | undefined): string {
  if (!to) return "#";
  if (typeof to === "string") return to;

  const pathname = to.pathname || "/";
  const params = new URLSearchParams(to.search || "");

  Object.entries(to.query || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) params.set(key, String(value));
  });

  const search = params.toString();
  const hash = to.hash ? (to.hash.startsWith("#") ? to.hash : `#${to.hash}`) : "";
  return `${pathname}${search ? `?${search}` : ""}${hash}`;
}

function cleanPath(href: string) {
  return href.split("?")[0].split("#")[0] || "/";
}

function readRouteState(pathname: string, search: string) {
  if (typeof window === "undefined") return undefined;

  const key = `${routeStatePrefix}${pathname}${search}`;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return undefined;

  window.sessionStorage.removeItem(key);
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ to, href, ...props }, ref) => {
  return <NextLink ref={ref} href={toHref(to ?? href)} {...props} />;
});
Link.displayName = "RouterCompatLink";

export function NavLink({
  to,
  href,
  className,
  ...props
}: Omit<LinkProps, "className"> & {
  className?: string | ((state: { isActive: boolean; isPending: boolean; isTransitioning: boolean }) => string);
}) {
  const pathname = usePathname();
  const targetHref = toHref(to ?? href);
  const targetPath = cleanPath(targetHref);
  const isActive = !!pathname && (targetPath === "/" ? pathname === "/" : pathname === targetPath || pathname.startsWith(`${targetPath}/`));
  const resolvedClassName =
    typeof className === "function"
      ? className({ isActive, isPending: false, isTransitioning: false })
      : className;

  return <NextLink href={targetHref} className={resolvedClassName} {...props} />;
}

export function useNavigate() {
  const router = useRouter();

  return useCallback(
    (to: To | number, options: NavigateOptions = {}) => {
      if (typeof to === "number") {
        if (to < 0) router.back();
        return;
      }

      const href = toHref(to);
      if (options.state && typeof window !== "undefined") {
        window.sessionStorage.setItem(`${routeStatePrefix}${href}`, JSON.stringify(options.state));
      }

      if (options.replace) router.replace(href);
      else router.push(href);
    },
    [router],
  );
}

export function useLocation() {
  const pathname = usePathname();
  const params = useNextSearchParams();
  const search = params?.toString() ? `?${params.toString()}` : "";

  return useMemo(
    () => ({
      pathname,
      search,
      hash: typeof window === "undefined" ? "" : window.location.hash,
      state: pathname ? readRouteState(pathname, search) : undefined,
    }),
    [pathname, search],
  );
}

export function useParams() {
  return useNextParams();
}

// Wrapper component to handle suspense boundary
function SearchParamsWrapper({ children }: { children: (params: URLSearchParams, setParams: (next: URLSearchParams | Record<string, string>, options?: { replace?: boolean }) => void) => React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const readonlyParams = useNextSearchParams();

  const [params, setParams] = useMemo(() => {
    const params = new URLSearchParams(readonlyParams?.toString() || "");
    const setParamsFn = (next: URLSearchParams | Record<string, string>, options: { replace?: boolean } = {}) => {
      const nextParams = next instanceof URLSearchParams ? new URLSearchParams(next.toString()) : new URLSearchParams(next);
      const query = nextParams.toString();
      const href = pathname ? (query ? `${pathname}?${query}` : pathname) : "/";

      if (options.replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    };
    return [params, setParamsFn] as const;
  }, [pathname, readonlyParams, router]);

  return <>{children(params, setParams)}</>;
}

export function useSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const readonlyParams = useNextSearchParams();

  return useMemo(() => {
    const params = new URLSearchParams(readonlyParams?.toString() || "");
    const setParams = (next: URLSearchParams | Record<string, string>, options: { replace?: boolean } = {}) => {
      const nextParams = next instanceof URLSearchParams ? new URLSearchParams(next.toString()) : new URLSearchParams(next);
      const query = nextParams.toString();
      const href = pathname ? (query ? `${pathname}?${query}` : pathname) : "/";

      if (options.replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    };

    return [params, setParams] as const;
  }, [pathname, readonlyParams, router]);
}

// Export a wrapped version of components that use search params
export function withSearchParamsSuspense<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
        <Component {...props} />
      </Suspense>
    );
  };
}

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Routes({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Route() {
  return null;
}
