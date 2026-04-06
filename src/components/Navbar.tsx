import { Link } from "react-router-dom";
import { Bell, PenLine, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const { user, profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

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

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to={user ? "/feed" : "/"} className="flex items-center">
          <img src="/logo.png" alt="Afterframe" className="h-18 w-36" />
        </Link>

        {user && (
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-secondary border border-border rounded-sm pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/notifications" className="relative p-2 hover:bg-muted rounded-sm transition-colors">
                <Bell size={20} className="text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-xs w-4 h-4 flex items-center justify-center rounded-full font-medium">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link to={`/${profile?.username || ""}`} className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile?.username?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
              </Link>
              <Button variant="accent" size="sm" asChild>
                <Link to="/write">
                  <PenLine size={16} />
                  Frame It
                </Link>
              </Button>
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
