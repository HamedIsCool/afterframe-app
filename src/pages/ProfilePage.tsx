import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AfterframeCard from "@/components/AfterframeCard";

const ProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [frames, setFrames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("username", username).single();
      if (!p) { setLoading(false); return; }
      setProfile(p);

      const { data: f } = await supabase
        .from("afterframes")
        .select("id, title, the_one_liner, published_at")
        .eq("author_id", p.id)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      // Get counts
      const ids = (f || []).map((x: any) => x.id);
      const [likesRes, commentsRes] = await Promise.all([
        supabase.from("likes").select("afterframe_id").in("afterframe_id", ids),
        supabase.from("comments").select("afterframe_id").in("afterframe_id", ids),
      ]);
      const lc: Record<string, number> = {};
      const cc: Record<string, number> = {};
      (likesRes.data || []).forEach((l: any) => { lc[l.afterframe_id] = (lc[l.afterframe_id] || 0) + 1; });
      (commentsRes.data || []).forEach((c: any) => { cc[c.afterframe_id] = (cc[c.afterframe_id] || 0) + 1; });

      setFrames((f || []).map((x: any) => ({ ...x, like_count: lc[x.id] || 0, comment_count: cc[x.id] || 0 })));
      setLoading(false);
    };
    fetch();
  }, [username]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">User not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-xl text-muted-foreground overflow-hidden">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            profile.username?.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{profile.full_name || profile.username}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-foreground mt-1">{profile.bio}</p>}
          <p className="text-xs text-muted-foreground mt-1">0 followers · 0 following</p>
        </div>
      </div>

      <div className="space-y-4">
        {frames.map((f: any) => (
          <AfterframeCard
            key={f.id}
            id={f.id}
            title={f.title}
            oneLiner={f.the_one_liner}
            authorUsername={profile.username}
            authorAvatar={profile.avatar_url}
            publishedAt={f.published_at}
            likeCount={f.like_count}
            commentCount={f.comment_count}
          />
        ))}
        {frames.length === 0 && <p className="text-muted-foreground text-sm">No published stories yet.</p>}
      </div>
    </div>
  );
};

export default ProfilePage;
