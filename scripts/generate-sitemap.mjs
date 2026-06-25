import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://afterfra.me";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Static routes that should always be in the sitemap
const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/theory", priority: "0.8", changefreq: "monthly" },
  { path: "/wall", priority: "0.9", changefreq: "daily" },
  { path: "/signup", priority: "0.5", changefreq: "monthly" },
  { path: "/login", priority: "0.3", changefreq: "monthly" },
];

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildUrl = (loc, lastmod, changefreq, priority) => {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
};

async function generate() {
  const urls = [];

  // Static routes
  for (const route of STATIC_ROUTES) {
    urls.push(buildUrl(`${SITE_URL}${route.path}`, null, route.changefreq, route.priority));
  }

  // Dynamic frame pages — only if credentials are available
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await supabase
        .from("afterframes")
        .select("id, updated_at, published_at, is_anonymous, author:profiles!author_id(username)")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) {
        console.warn("Sitemap: could not fetch frames:", error.message);
      } else if (data) {
        for (const frame of data) {
          const username = frame.author?.username;
          const loc = frame.is_anonymous
            ? `${SITE_URL}/f/${frame.id}`
            : (username ? `${SITE_URL}/frame/${encodeURIComponent(username)}/${frame.id}` : null);
          if (!loc) continue;
          const lastmod = (frame.updated_at || frame.published_at || "").split("T")[0];
          urls.push(buildUrl(loc, lastmod, "weekly", "0.7"));
        }
        console.log(`Sitemap: added ${data.length} frame URLs`);
      }
    } catch (err) {
      console.warn("Sitemap: frame fetch failed, writing static-only sitemap.", err);
    }
  } else {
    console.warn("Sitemap: Supabase env vars missing, writing static-only sitemap.");
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  const outDir = resolve(__dirname, "../public");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "sitemap.xml"), xml, "utf-8");
  console.log(`Sitemap written: ${urls.length} URLs total`);
}

generate();
