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
    <div className="min-h-screen bg-[#0A0A0A] py-10 px-4 font-['Space_Grotesk']">
      <div className="w-full max-w-[640px] mx-auto">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-[#F5F0E8] tracking-tight mb-6 leading-snug">
          {frame.title}
        </h1>

        {/* AUTHOR ROW */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-sm text-[#888] overflow-hidden shrink-0">
              {author?.avatar_url
                ? <img src={author.avatar_url} alt="" className="w-full h-full object-cover" />
                : author?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-[#F5F0E8] font-medium">{author?.username}</p>
              <p className="text-xs text-[#888]">
                {frame.published_at && formatDistanceToNow(new Date(frame.published_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleLike} className={`flex items-center gap-1 text-sm transition-colors ${liked ? "text-[#C8A96E]" : "text-[#888] hover:text-[#F5F0E8]"}`}>
              <Heart size={16} fill={liked ? "currentColor" : "none"} /> {likeCount}
            </button>
            <button onClick={toggleSave} className={`transition-colors ${saved ? "text-[#C8A96E]" : "text-[#888] hover:text-[#F5F0E8]"}`}>
              <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
            </button>
            <span className="flex items-center gap-1 text-sm text-[#888]">
              <MessageSquare size={16} /> {comments.length}
            </span>
          </div>
        </div>

        {/* ONE-LINER BOX */}
        <div className="w-full bg-[#F5F0E8] mb-6 px-6 py-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/50 mb-2 font-bold">
            One-Liner
          </p>
          <p className="text-base font-bold text-[#0A0A0A] uppercase italic leading-snug text-center">
            {frame.the_one_liner}
          </p>
        </div>

        {/* BENTO GRID */}
        <div className="w-full" style={{ containerType: 'inline-size' }}>

          {/* ROW 1 — Event + Pivot */}
          <div className="flex" style={{ height: '28cqw' }}>

            {/* THE EVENT */}
            <div className="relative w-1/2 border-t border-l border-[#2A2A2A] overflow-hidden"
                 style={{ padding: '2.5cqw' }}>
              <span
                className="absolute bg-[#0A0A0A] font-bold uppercase tracking-[0.2em] text-[#888]"
                style={{ top: '-0.85cqw', left: '2cqw', padding: '0 0.8cqw', fontSize: '1.2cqw' }}>
                The Event
              </span>
              <p className="text-[#F5F0E8] font-medium leading-snug overflow-hidden"
                 style={{ paddingTop: '1.5cqw', fontSize: '2cqw', maxHeight: '100%' }}>
                {frame.the_event}
              </p>
            </div>

            {/* THE PIVOT */}
            <div className="relative w-1/2 border-t border-l border-r border-[#2A2A2A] overflow-hidden"
                 style={{ padding: '2.5cqw' }}>
              <span
                className="absolute bg-[#0A0A0A] font-bold uppercase tracking-[0.2em] text-[#888]"
                style={{ top: '-0.85cqw', left: '2cqw', padding: '0 0.8cqw', fontSize: '1.2cqw' }}>
                The Pivot
              </span>
              <p className="text-[#F5F0E8] font-medium leading-snug overflow-hidden"
                 style={{ paddingTop: '1.5cqw', fontSize: '2cqw', maxHeight: '100%' }}>
                {frame.the_pivot}
              </p>
            </div>
          </div>

          {/* ROW 2 — Gut-Punch + Retroactive Why */}
          <div className="grid border-t border-[#2A2A2A]"
               style={{ gridTemplateColumns: '5fr 9fr', height: '38cqw' }}>

            {/* THE GUT-PUNCH */}
            <div className="relative flex flex-col overflow-hidden bg-[#141414]"
                 style={{
                   borderLeft: '3px solid #8B3A3A',
                   borderRight: '1px solid #2A2A2A',
                   padding: '2.5cqw'
                 }}>
              <span className="font-bold uppercase tracking-[0.2em] text-[#8B3A3A] shrink-0"
                    style={{ fontSize: '1.3cqw', marginBottom: '1.2cqw' }}>
                Gut-Punch
              </span>
              <div className="shrink-0 bg-[#8B3A3A]/30"
                   style={{ height: '1px', width: '5cqw', marginBottom: '1.5cqw' }} />
              <p className="text-[#F5F0E8]/80 italic font-medium leading-snug overflow-hidden"
                 style={{ fontSize: '1.8cqw' }}>
                {frame.the_gut_punch}
              </p>
            </div>

            {/* THE RETROACTIVE WHY */}
            <div className="relative flex flex-col justify-center overflow-hidden text-center"
                 style={{
                   border: '1px solid rgba(200,169,110,0.2)',
                   borderLeft: 'none',
                   padding: '4cqw'
                 }}>
              <div className="absolute top-0 left-0 border-[#C8A96E]"
                   style={{ width: '3cqw', height: '3cqw', borderTop: '2px solid', borderLeft: '2px solid' }} />
              <div className="absolute bottom-0 right-0 border-[#C8A96E]"
                   style={{ width: '3cqw', height: '3cqw', borderBottom: '2px solid', borderRight: '2px solid' }} />
              <span className="block font-bold uppercase tracking-[0.4em] text-[#C8A96E]"
                    style={{ fontSize: '1.3cqw', marginBottom: '2cqw' }}>
                Retroactive Why
              </span>
              <p className="font-semibold tracking-tight text-[#F5F0E8] leading-snug overflow-hidden"
                 style={{ fontSize: '2.4cqw' }}>
                {frame.the_retroactive_why}
              </p>
            </div>
          </div>
        </div>

        {/* COMMENTS */}
        <div className="mt-12 border-t border-[#2A2A2A] pt-8">
          <h2 className="text-base font-semibold text-[#F5F0E8] mb-4 uppercase tracking-widest text-sm">
            Comments
          </h2>
          {user && (
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-[#141414] border border-[#2A2A2A] px-3 py-2 text-sm text-[#F5F0E8] placeholder:text-[#555] focus:outline-none focus:border-[#C8A96E] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && addComment()}
              />
              <Button variant="accentFill" size="sm" onClick={addComment}>Post</Button>
            </div>
          )}
          <div className="space-y-4">
            {comments.map((c: any) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-7 h-7 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-xs text-[#888] shrink-0">
                  {c.author?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#F5F0E8]">{c.author?.username}</span>
                    <span className="text-xs text-[#888]">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-[#888] mt-1">{c.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-[#555]">No comments yet. Be the first.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FrameView;
