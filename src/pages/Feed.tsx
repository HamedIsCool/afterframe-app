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
    const { data, error } = await supabase
      .from("afterframes")
      .select("id, title, the_one_liner, published_at, author:profiles!author_id(username, avatar_url)")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) {
      toast.error("Failed to load feed");
      setLoading(false);
      return;
    }

    // Fetch counts
    const frameIds = (data || []).map((f: any) => f.id);
    const [likesRes, commentsRes] = await Promise.all([
      supabase.from("likes").select("afterframe_id").in("afterframe_id", frameIds),
      supabase.from("comments").select("afterframe_id").in("afterframe_id", frameIds),
    ]);

    const likeCounts: Record<string, number> = {};
    const commentCounts: Record<string, number> = {};
    (likesRes.data || []).forEach((l: any) => { likeCounts[l.afterframe_id] = (likeCounts[l.afterframe_id] || 0) + 1; });
    (commentsRes.data || []).forEach((c: any) => { commentCounts[c.afterframe_id] = (commentCounts[c.afterframe_id] || 0) + 1; });

    setFrames((data || []).map((f: any) => ({
      ...f,
      author: f.author,
      like_count: likeCounts[f.id] || 0,
      comment_count: commentCounts[f.id] || 0,
    })));

    // Fetch saved
    if (user) {
      const { data: saves } = await supabase
        .from("saves")
        .select("afterframe_id")
        .eq("user_id", user.id);
      setSavedIds(new Set((saves || []).map((s: any) => s.afterframe_id)));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchFeed();
  }, [user]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchFeed();
      return;
    }
    const runSearch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("afterframes")
        .select("id, title, the_one_liner, published_at, author:profiles!author_id(username, avatar_url)")
        .eq("is_published", true)
        .or(`title.ilike.%${searchQuery}%,the_one_liner.ilike.%${searchQuery}%`)
        .order("published_at", { ascending: false });

      if (error) { toast.error("Search failed"); setLoading(false); return; }

      const frameIds = (data || []).map((f: any) => f.id);
      const [likesRes, commentsRes] = await Promise.all([
        supabase.from("likes").select("afterframe_id").in("afterframe_id", frameIds),
        supabase.from("comments").select("afterframe_id").in("afterframe_id", frameIds),
      ]);

      const likeCounts: Record<string, number> = {};
      const commentCounts: Record<string, number> = {};
      (likesRes.data || []).forEach((l: any) => { likeCounts[l.afterframe_id] = (likeCounts[l.afterframe_id] || 0) + 1; });
      (commentsRes.data || []).forEach((c: any) => { commentCounts[c.afterframe_id] = (commentCounts[c.afterframe_id] || 0) + 1; });

      setFrames((data || []).map((f: any) => ({
        ...f,
        like_count: likeCounts[f.id] || 0,
        comment_count: commentCounts[f.id] || 0,
      })));
      setLoading(false);
    };
    runSearch();
  }, [searchQuery]);

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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-8">
        {searchQuery ? `Results for "${searchQuery}"` : "Feed"}
      </h1>
      {frames.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="w-8 h-8 border-t-2 border-l-2 border-[#C8A96E] mb-6" />
          <p className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-bold mb-3">
            {searchQuery ? "No results" : "The archive is empty"}
          </p>
          <p className="text-sm text-[#888] leading-relaxed max-w-xs mb-6">
            {searchQuery
              ? `No frames found for "${searchQuery}". Try a different word or phrase.`
              : "No one has framed a story yet. Be the first."}
          </p>
          {!searchQuery && (
            <a
              href="/write"
              className="text-sm font-bold uppercase tracking-widest px-5 py-2.5
                         bg-[#C8A96E] text-[#0A0A0A] hover:bg-[#B89558] transition-colors"
            >
              Frame It
            </a>
          )}
        </div>
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
              publishedAt={frame.published_at}
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
