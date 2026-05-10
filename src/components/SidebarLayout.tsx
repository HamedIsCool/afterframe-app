import { Link, useLocation } from "react-router-dom";
import { Layers, Bookmark, LayoutList, X, PenLine } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar";
import { useEffect } from "react";

const NAV = [
  { label: "Home", path: "/feed", icon: LayoutList },
  { label: "Afterframes", path: "/dashboard/frames", icon: Layers },
  { label: "Saved", path: "/dashboard/saved", icon: Bookmark },
];

const EXTRA_NAV = [
  { label: "The Theory", path: "/theory" },
  { label: "The Wall", path: "/wall" },
];

const isActivePath = (path: string, current: string) =>
  current === path || current.startsWith(path + "/");

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { open, toggle } = useSidebar();

  // Close mobile drawer on navigation
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && open) toggle();
  }, [location.pathname]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] font-['Space_Grotesk']">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-['Space_Grotesk'] flex">

      {/* ── DESKTOP SIDEBAR — md and above ── */}
      <aside
        className={`hidden md:flex fixed top-14 left-0 h-[calc(100vh-56px)] z-40
          bg-[#0A0A0A] border-r border-[#2A2A2A]
          transition-all duration-200 flex-col pt-4
          ${open ? "w-52" : "w-14"}`}
      >
        <nav className="flex flex-col gap-1 px-2">
          {NAV.map(({ label, path, icon: Icon }) => {
            const active = isActivePath(path, location.pathname);
            return (
              <Link
                key={path}
                to={path}
                title={!open ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm
                  transition-colors
                  ${active
                    ? "text-[#F5F0E8] border-l-2 border-[#C8A96E] pl-[10px] bg-[#141414]"
                    : "text-[#555] hover:text-[#F5F0E8] hover:bg-[#111]"}`}
              >
                <Icon size={16} className="shrink-0" />
                {open && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── MOBILE OVERLAY DRAWER — below md only ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80"
            onClick={toggle}
          />

          {/* Drawer — full width */}
          <div className="relative w-full h-full bg-[#0A0A0A] flex flex-col z-10">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 h-14
                            border-b border-[#2A2A2A] shrink-0">
              <span className="text-xs uppercase tracking-[0.2em]
                               text-[#555] font-bold">
                afterframe
              </span>
              <button
                onClick={toggle}
                className="text-[#555] hover:text-[#F5F0E8] transition-colors p-2"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main nav */}
            <nav className="flex flex-col gap-1 px-3 pt-4 flex-1 overflow-y-auto">
              {NAV.map(({ label, path, icon: Icon }) => {
                const active = isActivePath(path, location.pathname);
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={toggle}
                    className={`flex items-center gap-4 px-4 py-4 text-base
                      transition-colors
                      ${active
                        ? "text-[#F5F0E8] border-l-2 border-[#C8A96E] pl-[14px] bg-[#141414]"
                        : "text-[#555] hover:text-[#F5F0E8] hover:bg-[#111]"}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="border-t border-[#2A2A2A] my-4 mx-4" />

              {/* Extra nav */}
              {EXTRA_NAV.map(({ label, path }) => {
                const active = isActivePath(path, location.pathname);
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={toggle}
                    className={`flex items-center px-4 py-4 text-base
                      transition-colors
                      ${active
                        ? "text-[#F5F0E8] border-l-2 border-[#C8A96E] pl-[14px]"
                        : "text-[#555] hover:text-[#F5F0E8] hover:bg-[#111]"}`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Frame It CTA */}
            <div className="px-4 pb-10 pt-4 border-t border-[#2A2A2A] shrink-0">
              <Link
                to="/write"
                onClick={toggle}
                className="flex items-center justify-center gap-2 w-full
                           bg-[#C8A96E] text-[#0A0A0A] font-bold
                           text-xs uppercase tracking-widest py-4
                           hover:bg-[#B89558] transition-colors"
              >
                <PenLine size={14} />
                Frame It
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div
        className={`flex-1 transition-all duration-200
          ${open ? "md:ml-52" : "md:ml-14"}`}
      >
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
          {children}
        </div>
      </div>

    </div>
  );
};

export default SidebarLayout;
