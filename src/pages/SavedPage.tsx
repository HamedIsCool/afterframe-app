import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AfterframeCard from "@/components/AfterframeCard";

const SavedPage = () => {
  const { user } = useAuth();
  const [frames, setFrames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!user) return;
    const { data: saves } = await supabase
      .from("saves")
      .select("afterframe_id, afterframe:afterframes!afterframe_id(id, title, the_one_liner, published_at, author:profiles!author_id(username, avatar_url))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const items = (saves || []).map((s: any) => s.afterframe).filter(Boolean);

    // Get counts
    const ids = items.map((x: any) => x.id);
    const [likesRes, commentsRes] = await Promise.all([
      supabase.from("likes").select("afterframe_id").in("afterframe_id", ids),
      supabase.from("comments").select("afterframe_id").in("afterframe_id", ids),
    ]);
    const lc: Record<string, number> = {};
    const cc: Record<string, number> = {};
    (likesRes.data || []).forEach((l: any) => { lc[l.afterframe_id] = (lc[l.afterframe_id] || 0) + 1; });
    (commentsRes.data || []).forEach((c: any) => { cc[c.afterframe_id] = (cc[c.afterframe_id] || 0) + 1; });

    setFrames(items.map((x: any) => ({ ...x, like_count: lc[x.id] || 0, comment_count: cc[x.id] || 0 })));
    setLoading(false);
  };

  useEffect(() => { fetchSaved(); }, [user]);

  const unsave = async (afterframeId: string) => {
    if (!user) return;
    await supabase.from("saves").delete().eq("user_id", user.id).eq("afterframe_id", afterframeId);
    setFrames((f) => f.filter((x: any) => x.id !== afterframeId));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-8">Saved</h1>
      {frames.length === 0 ? (
        <p className="text-muted-foreground text-sm">No saved stories.</p>
      ) : (
        <div className="space-y-4">
          {frames.map((f: any) => (
            <AfterframeCard
              key={f.id}
              id={f.id}
              title={f.title}
              oneLiner={f.the_one_liner}
              authorUsername={f.author?.username}
              authorAvatar={f.author?.avatar_url}
              publishedAt={f.published_at}
              likeCount={f.like_count}
              commentCount={f.comment_count}
              isSaved={true}
              onSave={() => unsave(f.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPage;
