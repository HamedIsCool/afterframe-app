import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*, actor:profiles!actor_id(username), afterframe:afterframes!afterframe_id(title, author:profiles!author_id(username))")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });
      setNotifications(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("recipient_id", user.id).eq("is_read", false);
    setNotifications((n) => n.map((x: any) => ({ ...x, is_read: true })));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
      </div>
      {notifications.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="w-8 h-8 border-t-2 border-l-2 border-[#C8A96E] mb-6" />
          <p className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-bold mb-3">
            No activity yet
          </p>
          <p className="text-sm text-[#888] leading-relaxed max-w-xs">
            When someone likes or comments on your frames, it shows up here.
            Publish your first frame to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <Link
              key={n.id}
              to={`/frame/${n.afterframe?.author?.username}/${n.afterframe_id}`}
              className={`flex items-start gap-4 p-4 border
                ${n.is_read
                  ? "border-[#2A2A2A] bg-[#0A0A0A]"
                  : "border-[#C8A96E]/30 bg-[#141414]"}
                hover:border-[#C8A96E]/50 transition-colors group`}
            >
              {/* Unread indicator */}
              <div className="mt-1.5 shrink-0">
                {!n.is_read
                  ? <div className="w-1.5 h-1.5 rounded-full bg-[#C8A96E]" />
                  : <div className="w-1.5 h-1.5" />
                }
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Who + action */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#F5F0E8]">
                    {n.actor?.username}
                  </span>
                  <span className={`text-xs uppercase tracking-widest font-bold px-1.5 py-0.5
                    ${n.type === "like"
                      ? "text-[#C8A96E] bg-[#C8A96E]/10"
                      : "text-[#8B3A3A] bg-[#8B3A3A]/10"}`}>
                    {n.type === "like" ? "liked" : "commented"}
                  </span>
                </div>

                {/* Which frame */}
                <p className="text-sm text-[#888] truncate group-hover:text-[#F5F0E8] transition-colors">
                  {n.afterframe?.title}
                </p>
              </div>

              {/* When */}
              <span className="text-xs text-[#555] shrink-0 mt-0.5">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
