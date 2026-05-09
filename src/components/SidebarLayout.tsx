import { Link, useLocation } from "react-router-dom";
import { Layers, Bookmark, LayoutList } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar";

const NAV = [
  { label: "Home", path: "/feed", icon: LayoutList },
  { label: "Afterframes", path: "/dashboard/frames", icon: Layers },
  { label: "Saved", path: "/dashboard/saved", icon: Bookmark },
];

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { open } = useSidebar();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] font-['Space_Grotesk']">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-['Space_Grotesk'] flex">

      {/* SIDEBAR */}
      <aside
        className={`fixed top-14 left-0 h-[calc(100vh-56px)] z-40
          bg-[#0A0A0A] border-r border-[#2A2A2A]
          transition-all duration-200 flex flex-col pt-4
          ${open ? "w-52" : "w-14"}`}
      >
        <nav className="flex flex-col gap-1 px-2">
          {NAV.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path ||
              location.pathname.startsWith(path + "/");
            return (
              <Link
                key={path}
                to={path}
                title={!open ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm
                  transition-colors
                  ${isActive
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

      {/* MAIN CONTENT */}
      <div
        className={`flex-1 transition-all duration-200
          ${open ? "ml-52" : "ml-14"}`}
      >
        <div className="max-w-3xl mx-auto px-6 py-8">
          {children}
        </div>
      </div>

    </div>
  );
};

export default SidebarLayout;
