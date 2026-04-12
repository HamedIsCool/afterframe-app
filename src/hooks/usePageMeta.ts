export const usePageMeta = ({
  title,
  description,
  url,
  image,
}: {
  title: string;
  description: string;
  url?: string;
  image?: string;
}) => {
  const fullTitle = `${title} — Afterframe`;
  const pageUrl = url || window.location.href;
  const ogImage = image || "https://afterfra.me/og-default.png";

  document.title = fullTitle;

  const setMeta = (selector: string, value: string) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      const attr = selector.includes("property=") 
        ? "property" 
        : "name";
      const key = selector.match(/["']([^"']+)["']/)?.[1] || "";
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  };

  setMeta(`meta[name="description"]`, description);
  setMeta(`meta[property="og:title"]`, fullTitle);
  setMeta(`meta[property="og:description"]`, description);
  setMeta(`meta[property="og:url"]`, pageUrl);
  setMeta(`meta[property="og:image"]`, ogImage);
  setMeta(`meta[name="twitter:title"]`, fullTitle);
  setMeta(`meta[name="twitter:description"]`, description);
  setMeta(`meta[name="twitter:image"]`, ogImage);
};
