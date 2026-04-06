import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, Bookmark, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const frameFields = [
  { key: "the_event", label: "THE EVENT" },
  { key: "the_gut_punch", label: "THE GUT-PUNCH" },
  { key: "the_pivot", label: "THE PIVOT" },
  { key: "the_retroactive_why", label: "THE RETROACTIVE WHY" },
  { key: "the_one_liner", label: "THE ONE-LINER", special: true },
];

const FrameView = () => {
  const { username, id } = useParams();
  const { user } = useAuth();
  const [frame, setFrame] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: f } = await supabase.from("afterframes").select("*").eq("id", id).single();
      if (!f) { setLoading(false); return; }
      setFrame(f);

      const { data: a } = await supabase.from("profiles").select("*").eq("id", f.author_id).single();
      setAuthor(a);

      const { data: likes } = await supabase.from("likes").select("*").eq("afterframe_id", id!);
      setLikeCount(likes?.length || 0);
      if (user) setLiked(likes?.some((l: any) => l.user_id === user.id) || false);

      if (user) {
        const { data: s } = await supabase.from("saves").select("*").eq("user_id", user.id).eq("afterframe_id", id!);
        setSaved((s?.length || 0) > 0);
      }

      const { data: c } = await supabase
        .from("comments")
        .select("*, author:profiles!author_id(username, avatar_url)")
        .eq("afterframe_id", id!)
        .order("created_at", { ascending: true });
      setComments(c || []);
      setLoading(false);
    };
    fetchAll();
  }, [id, user]);

  const toggleLike = async () => {
    if (!user) return;
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("afterframe_id", id!);
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, afterframe_id: id });
      setLiked(true);
      setLikeCount((c) => c + 1);
      // Notify author
      if (frame.author_id !== user.id) {
        await supabase.from("notifications").insert({
          recipient_id: frame.author_id,
          actor_id: user.id,
          type: "like",
          afterframe_id: id,
        });
      }
    }
  };

  const toggleSave = async () => {
    if (!user) return;
    if (saved) {
      await supabase.from("saves").delete().eq("user_id", user.id).eq("afterframe_id", id!);
      setSaved(false);
    } else {
      await supabase.from("saves").insert({ user_id: user.id, afterframe_id: id });
      setSaved(true);
    }
  };

  const addComment = async () => {
    if (!user || !commentText.trim()) return;
    const { data, error } = await supabase
      .from("comments")
      .insert({ author_id: user.id, afterframe_id: id, content: commentText })
      .select("*, author:profiles!author_id(username, avatar_url)")
      .single();
    if (error) { toast.error(error.message); return; }
    setComments((c) => [...c, data]);
    setCommentText("");
    // Notify author
    if (frame.author_id !== user.id) {
      await supabase.from("notifications").insert({
        recipient_id: frame.author_id,
        actor_id: user.id,
        type: "comment",
        afterframe_id: id,
      });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!frame) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground mb-4">{frame.title}</h1>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-sm text-muted-foreground overflow-hidden">
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              author?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm text-foreground font-medium">{author?.username}</p>
            <p className="text-xs text-muted-foreground">
              {frame.published_at && formatDistanceToNow(new Date(frame.published_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLike} className={`flex items-center gap-1 text-sm transition-colors ${liked ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}>
            <Heart size={18} fill={liked ? "currentColor" : "none"} /> {likeCount}
          </button>
          <button onClick={toggleSave} className={`transition-colors ${saved ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}>
            <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
          </button>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare size={18} /> {comments.length}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {frameFields.map((field) => (
          <div
            key={field.key}
            className={`border-l-2 pl-4 py-3 ${field.special ? "border-l-0 border-t-2 border-accent pt-4" : "border-border"}`}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{field.label}</p>
            {!field.special && <div className="border-b border-border mb-3" />}
            <p className={field.special ? "text-xl font-bold text-accent" : "text-foreground leading-relaxed"} style={{ fontSize: field.special ? "1.4rem" : "1.1rem" }}>
              {(frame as any)[field.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Comments */}
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Comments</h2>
        {user && (
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-secondary border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              onKeyDown={(e) => e.key === "Enter" && addComment()}
            />
            <Button variant="accentFill" size="sm" onClick={addComment}>Post</Button>
          </div>
        )}
        <div className="space-y-4">
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground shrink-0">
                {c.author?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{c.author?.username}</span>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-foreground mt-1">{c.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default FrameView;
