import * as React from "react";

export function useIsMobile(breakpoint = 768): boolean {
    const query = `(max-width: ${breakpoint - 1}px)`;

    type MQLWithLegacy = MediaQueryList & {
        addListener?: (listener: (e: MediaQueryListEvent) => void) => void;
        removeListener?: (listener: (e: MediaQueryListEvent) => void) => void;
    };

    const isClient =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function";
    const [isMobile, setIsMobile] = React.useState<boolean>(() =>
        isClient ? window.matchMedia(query).matches : false,
    );

    React.useEffect(() => {
        if (!isClient) return;

        const mql = window.matchMedia(query) as MQLWithLegacy;
        const handler = (e: MediaQueryListEvent | MediaQueryList) => {
            // When called from addListener, we might get a MediaQueryList; when from addEventListener we get MediaQueryListEvent
            setIsMobile("matches" in e ? e.matches : mql.matches);
        };

        // initial sync
        setIsMobile(mql.matches);

        // preferred modern API
        if (typeof mql.addEventListener === "function") {
            mql.addEventListener("change", handler as EventListener);
        } else if (typeof mql.addListener === "function") {
            // legacy fallback, typed via our MQLWithLegacy so TS doesn't mark it deprecated
            mql.addListener!(handler as (e: MediaQueryListEvent) => void);
        }

        return () => {
            if (typeof mql.removeEventListener === "function") {
                mql.removeEventListener("change", handler as EventListener);
            } else if (typeof mql.removeListener === "function") {
                mql.removeListener!(
                    handler as (e: MediaQueryListEvent) => void,
                );
            }
        };
    }, [breakpoint, isClient, query]);

    return isMobile;
}
