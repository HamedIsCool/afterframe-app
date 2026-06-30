import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AfterframeCard from "@/components/AfterframeCard";
import { toast } from "sonner";

interface FeedItem {
  id: string;
  title: string;
  the_one_liner: string;
  published_at: string;
  updated_at?: string;
  is_anonymous?: boolean;
  author: { username: string; avatar_url: string | null };
  like_count: number;
  comment_count: number;
}

const Feed = () => {
  const { user } = useAuth();
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get("q") || "";
  const [frames, setFrames] = useState<FeedItem[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("public_frames")
      .select("id, title, the_one_liner, published_at, updated_at, is_anonymous, author_username, author_avatar_url")
      .order("published_at", { ascending: false });

    if (error) { toast.error("Failed to load feed"); setLoading(false); return; }
    await hydrateAndSet(data || []);
    setLoading(false);
  };

  const runSearch = async () => {
    const safeQuery = searchQuery.replace(/[,%()]/g, "").trim();
    if (!safeQuery) { fetchFeed(); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("public_frames")
      .select("id, title, the_one_liner, published_at, updated_at, is_anonymous, author_username, author_avatar_url")
      .or(`title.ilike.%${safeQuery}%,the_one_liner.ilike.%${safeQuery}%`)
      .order("published_at", { ascending: false });
    if (error) { toast.error("Search failed"); setLoading(false); return; }
    await hydrateAndSet(data || []);
    setLoading(false);
  };

  // Shared: takes raw frames, fetches counts + saved, sets state
  const hydrateAndSet = async (rows: any[]) => {
    const frameIds = rows.map((f: any) => f.id);
    const [likesRes, commentsRes] = await Promise.all([
      supabase.from("likes").select("afterframe_id").in("afterframe_id", frameIds),
      supabase.from("comments").select("afterframe_id").in("afterframe_id", frameIds),
    ]);
    const likeCounts: Record<string, number> = {};
    const commentCounts: Record<string, number> = {};
    (likesRes.data || []).forEach((l: any) => { likeCounts[l.afterframe_id] = (likeCounts[l.afterframe_id] || 0) + 1; });
    (commentsRes.data || []).forEach((c: any) => { commentCounts[c.afterframe_id] = (commentCounts[c.afterframe_id] || 0) + 1; });

    setFrames(rows.map((f: any) => ({
      ...f,
      author: { username: f.author_username, avatar_url: f.author_avatar_url },
      like_count: likeCounts[f.id] || 0,
      comment_count: commentCounts[f.id] || 0,
    })));

    if (user) {
      const { data: saves } = await supabase
        .from("saves")
        .select("afterframe_id")
        .eq("user_id", user.id);
      setSavedIds(new Set((saves || []).map((s: any) => s.afterframe_id)));
    }
  };

  useEffect(() => {
    runSearch();
  }, [user, searchQuery]);

  const toggleSave = async (afterframeId: string) => {
    if (!user) return;
    if (savedIds.has(afterframeId)) {
      await supabase.from("saves").delete().eq("user_id", user.id).eq("afterframe_id", afterframeId);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(afterframeId); return n; });
    } else {
      await supabase.from("saves").insert({ user_id: user.id, afterframe_id: afterframeId });
      setSavedIds((prev) => new Set(prev).add(afterframeId));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#999]">Loading...</div>;

  return (
    <div className="w-full px-0 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-8">
        {searchQuery ? `Results for "${searchQuery}"` : "Feed"}
      </h1>
      {frames.length === 0 ? (
        <p className="text-[#999]">
          {searchQuery
            ? `No frames found for "${searchQuery}"`
            : "No stories yet. Be the first to write one."}
        </p>
      ) : (
        <div className="space-y-4">
          {frames.map((frame) => (
            <AfterframeCard
              key={frame.id}
              id={frame.id}
              title={frame.title}
              oneLiner={frame.the_one_liner}
              authorUsername={frame.author.username}
              authorAvatar={frame.author.avatar_url}
              isAnonymous={frame.is_anonymous}
              publishedAt={frame.published_at}
              updatedAt={frame.updated_at}
              likeCount={frame.like_count}
              commentCount={frame.comment_count}
              isSaved={savedIds.has(frame.id)}
              onSave={() => toggleSave(frame.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
