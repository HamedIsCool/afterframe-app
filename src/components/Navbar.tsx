import { Link } from "react-router-dom";
import { Bell, PenLine, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, Edit, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("q") || "");
  }, [location.search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      navigate(`/feed?q=${encodeURIComponent(val.trim())}`);
    } else {
      navigate("/feed");
    }
  };

  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav className="border-b border-[#2A2A2A] bg-[#0A0A0A] sticky top-0 z-50">
      <div className="container mx-auto flex items-center h-14 px-4 gap-4">

        {/* LEFT: Logo + Search (logged in only) */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link to={user ? "/feed" : "/"} className="flex items-center shrink-0">
            <img src="/logo.png" alt="Afterframe" className="h-18 w-36" />
          </Link>

          {user && (
            <div className="relative w-full max-w-xs hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={14} />
              <input
                type="text"
                placeholder="Search frames..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-[#141414] border border-[#2A2A2A] pl-8 pr-3 py-1.5 text-sm text-[#F5F0E8] placeholder:text-[#555] focus:outline-none focus:border-[#C8A96E] transition-colors"
              />
            </div>
          )}
        </div>

        {/* CENTER: The Theory — logged out only */}
        {!user && (
          <Link
            to="/theory"
            className="text-sm text-[#999] hover:text-[#F5F0E8] transition-colors hidden md:block"
          >
            The Theory
          </Link>
        )}

        {/* RIGHT: actions */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              {/* Frame It */}
              <Button variant="accent" size="sm" asChild>
                <Link to="/write">
                  <PenLine size={14} />
                  Frame It
                </Link>
              </Button>

              {/* Notifications */}
              <Link to="/notifications" className="relative p-1.5 hover:bg-[#1A1A1A] transition-colors">
                <Bell size={18} className="text-[#999]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#C8A96E] text-[#0A0A0A] text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="w-8 h-8 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center overflow-hidden hover:border-[#C8A96E] transition-colors rounded-full"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-[#999]">
                      {profile?.username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-10 w-44 bg-[#141414] border border-[#2A2A2A] z-50 py-1">
                    <button
                      onClick={() => { 
                        navigate(`/${profile?.username}`); 
                        setDropdownOpen(false); 
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#F5F0E8] hover:bg-[#1E1E1E] transition-colors text-left"
                    >
                      <User size={14} className="text-[#999]" />
                      View Profile
                    </button>
                    <button
                      onClick={() => { 
                        navigate("/dashboard"); 
                        setDropdownOpen(false); 
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 
                                 text-sm text-[#F5F0E8] hover:bg-[#1E1E1E] 
                                 transition-colors text-left"
                    >
                      <LayoutDashboard size={14} className="text-[#999]" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => { 
                        navigate(`/${profile?.username}?edit=true`); 
                        setDropdownOpen(false); 
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#F5F0E8] hover:bg-[#1E1E1E] transition-colors text-left"
                    >
                      <Edit size={14} className="text-[#999]" />
                      Edit Profile
                    </button>
                    <div className="border-t border-[#2A2A2A] my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#8B3A3A] hover:bg-[#1E1E1E] transition-colors text-left"
                    >
                      <LogOut size={14} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="accentFill" size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
