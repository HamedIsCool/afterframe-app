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
        <p className="text-muted-foreground text-sm">No notifications.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <Link
              key={n.id}
              to={`/frame/${n.afterframe?.author?.username}/${n.afterframe_id}`}
              className={`block p-4 border border-border ${n.is_read ? "bg-card" : "bg-secondary"} hover:border-muted-foreground/30 transition-colors`}
            >
              <p className="text-sm text-foreground">
                <span className="font-medium">{n.actor?.username}</span>
                {" "}{n.type === "like" ? "liked" : "commented on"}{" "}
                <span className="font-medium">{n.afterframe?.title}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
