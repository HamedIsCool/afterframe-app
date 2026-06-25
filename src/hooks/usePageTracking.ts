import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Pushes a pageview event to GTM's dataLayer on every route change.
// GTM fires only on initial load by default; this captures SPA navigation.
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);
};
