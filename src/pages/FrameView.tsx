import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { frameUrl } from "@/lib/frameUrl";
import { Heart, Bookmark, MessageSquare, Pencil, X, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { usePageMeta as setPageMeta } from "@/hooks/usePageMeta";
import ShareButton from "@/components/ShareButton";

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

  const navigate = useNavigate();
  const [authPrompt, setAuthPrompt] = useState(false);
  const [liking, setLiking] = useState(false);

  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!user || !id) { setIsOwner(false); return; }
    const checkOwner = async () => {
      const { data } = await supabase
        .from("afterframes")
        .select("id")
        .eq("id", id)
        .eq("author_id", user.id)
        .maybeSingle();
      setIsOwner(!!data);
    };
    checkOwner();
  }, [user, id]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: f } = await supabase
        .from("public_frames")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!f) { setLoading(false); return; }

      // Canonical redirect: ensure the URL matches the frame's anonymity.
      // Anonymous frames live at /f/:id; attributed at /frame/:username/:id.
      const canonical = f.is_anonymous
        ? `/f/${f.id}`
        : `/frame/${f.author_username || ""}/${f.id}`;
      const currentPath = window.location.pathname;
      if (currentPath !== canonical) {
        navigate(canonical, { replace: true });
        // Do NOT return — let the frame render. The URL updates in place
        // and the canonical check passes on the next render.
      }

      // author info comes from the view (null for anonymous frames)
      const a = f.author_id
        ? { id: f.author_id, username: f.author_username, avatar_url: f.author_avatar_url }
        : null;

      setFrame(f);
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

  useEffect(() => {
    if (!frame || !author) return;
    setPageMeta({
      title: frame.title,
      description: frame.the_one_liner,
      url: `https://afterfra.me${frameUrl({ id: frame.id, is_anonymous: frame.is_anonymous, author })}`,
    });
  }, [frame, author]);

  const toggleLike = async () => {
    if (!user) { setAuthPrompt(true); return; }
    if (liking) return;
    setLiking(true);
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
    setLiking(false);
  };

  const toggleSave = async () => {
    if (!user) { setAuthPrompt(true); return; }
    if (saved) {
      const { error } = await supabase.from("saves").delete().eq("user_id", user.id).eq("afterframe_id", id!);
      if (error) { toast.error("Could not update. Try again."); return; }
      setSaved(false);
      toast("Removed from saved");
    } else {
      const { error } = await supabase.from("saves").insert({ user_id: user.id, afterframe_id: id });
      if (error) { toast.error("Could not save. Try again."); return; }
      setSaved(true);
      toast("Saved — find it under your profile → Saved", {
        action: {
          label: "View Saved",
          onClick: () => window.location.href = "/saved",
        },
      });
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
    <div className="min-h-screen bg-[#0A0A0A] py-10 px-4 
                  font-['Space_Grotesk']">
      <div className="w-full max-w-[720px] mx-auto">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-[#999]
                     hover:text-[#F5F0E8] transition-colors
                     font-['Space_Grotesk'] flex items-center gap-1"
        >
          ← Back
        </button>

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-[#F5F0E8]
                     tracking-tight mb-6 leading-snug">
          {frame.title}
        </h1>

        {/* AUTHOR ROW — "Anonymous" when flagged, otherwise links to profile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {frame.is_anonymous ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A]
                            border border-[#2A2A2A]
                            flex items-center justify-center
                            text-sm text-[#555] shrink-0">
                ?
              </div>
              <div>
                <p className="text-sm text-[#888] font-medium">
                  Anonymous
                </p>
                <p className="text-xs text-[#999]">
                  {frame.updated_at && new Date(frame.updated_at) > new Date(frame.published_at)
                    ? `updated ${formatDistanceToNow(new Date(frame.updated_at), { addSuffix: true })}`
                    : frame.published_at
                    ? formatDistanceToNow(new Date(frame.published_at), { addSuffix: true })
                    : ""}
                </p>
              </div>
            </div>
          ) : (
            <Link
              to={`/${author?.username}`}
              className="flex items-center gap-3
                       hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A]
                            border border-[#2A2A2A]
                            flex items-center justify-center
                            text-sm text-[#888]
                            overflow-hidden shrink-0">
                {author?.avatar_url
                  ? <img src={author.avatar_url} alt=""
                       className="w-full h-full object-cover" />
                  : author?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-[#F5F0E8] font-medium">
                  {author?.username}
                </p>
                <p className="text-xs text-[#999]">
                  {frame.updated_at && new Date(frame.updated_at) > new Date(frame.published_at)
                    ? `updated ${formatDistanceToNow(new Date(frame.updated_at), { addSuffix: true })}`
                    : frame.published_at
                    ? formatDistanceToNow(new Date(frame.published_at), { addSuffix: true })
                    : ""}
                </p>
              </div>
            </Link>
          )}
          <div className="flex items-center gap-4">
            {isOwner && (
              <Link
                to={`/edit/${frame.id}`}
                className="flex items-center gap-1.5 text-xs 
                           uppercase tracking-widest font-medium
                           text-[#888] border border-[#2A2A2A] 
                           px-3 py-1.5 hover:border-[#C8A96E] 
                           hover:text-[#C8A96E] transition-colors"
              >
                <Pencil size={12} />
                Edit
              </Link>
            )}
            <button
              onClick={!isOwner ? toggleLike : undefined}
              disabled={isOwner}
              aria-label={liked ? "Unlike this frame" : "Like this frame"}
              title={isOwner ? "You can't like your own frame" : undefined}
              className={`flex items-center gap-1 text-sm
                        transition-colors
                        ${isOwner
                          ? "text-[#333] cursor-not-allowed"
                          : liked
                          ? "text-[#C8A96E]"
                          : "text-[#999] hover:text-[#F5F0E8]"}`}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
              {likeCount}
            </button>
            <button 
              onClick={toggleSave}
              aria-label={saved ? "Remove from saved" : "Save this frame"}
              className={`transition-colors
                        ${saved 
                          ? "text-[#C8A96E]" 
                          : "text-[#888] hover:text-[#F5F0E8]"}`}
            >
              <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
            </button>
            <span className="flex items-center gap-1 
                           text-sm text-[#888]">
              <MessageSquare size={16} /> {comments.length}
            </span>
          </div>
        </div>

        {/* SHARE */}
        <div className="flex flex-wrap justify-end gap-2 mb-6">
          <ShareButton
            title={frame.title}
            oneLiner={frame.the_one_liner}
            authorUsername={author?.username || ""}
            frameId={frame.id}
            isAnonymous={frame.is_anonymous}
          />
        </div>

        {/* BENTO GRID — desktop side by side, mobile stacked */}
        <div className="w-full border border-[#2A2A2A]">

          {/* ROW 1 — Event + Pivot */}
          <div className="flex flex-col md:flex-row 
                        border-b border-[#2A2A2A]">

            {/* THE EVENT */}
            <div className="relative w-full md:w-1/2 
                          border-b md:border-b-0 
                          md:border-r border-[#2A2A2A] 
                          p-6 min-h-[180px]">
              <p className="text-xs font-bold uppercase 
                          tracking-[0.2em] text-[#555] mb-3">
                01 · The Event
              </p>
              <p className="text-[#F5F0E8] font-medium 
                          leading-relaxed text-base">
                {frame.the_event}
              </p>
            </div>

            {/* THE PIVOT */}
            <div className="relative w-full md:w-1/2 
                          p-6 min-h-[180px]">
              <p className="text-xs font-bold uppercase 
                          tracking-[0.2em] text-[#555] mb-3">
                03 · The Pivot
              </p>
              <p className="text-[#F5F0E8] font-medium 
                          leading-relaxed text-base">
                {frame.the_pivot}
              </p>
            </div>
          </div>

          {/* ROW 2 — Gut-Punch + Retroactive Why */}
          <div className="flex flex-col md:flex-row">

            {/* THE GUT-PUNCH */}
            <div className="w-full md:w-[38%] 
                          border-b md:border-b-0 
                          md:border-r border-[#2A2A2A] 
                          bg-[#141414] p-6 min-h-[200px]"
                 style={{ borderLeft: '3px solid #8B3A3A' }}>
              <p className="text-xs font-bold uppercase 
                          tracking-[0.2em] text-[#8B3A3A] mb-3">
                02 · Gut-Punch
              </p>
              <div className="w-8 h-px bg-[#8B3A3A]/30 mb-4" />
              <p className="text-[#F5F0E8]/80 italic font-medium 
                          leading-relaxed text-base">
                {frame.the_gut_punch}
              </p>
            </div>

            {/* THE RETROACTIVE WHY */}
            <div className="relative w-full md:w-[62%] 
                          p-8 min-h-[200px] 
                          flex flex-col justify-center 
                          text-center"
                 style={{ 
                   border: '1px solid rgba(200,169,110,0.15)',
                   borderLeft: 'none',
                   borderTop: 'none'
                 }}>
              <div className="absolute top-0 left-0 w-6 h-6 
                              border-t-2 border-l-2 
                              border-[#C8A96E]" />
              <div className="absolute bottom-0 right-0 w-6 h-6 
                              border-b-2 border-r-2 
                              border-[#C8A96E]" />
              <p className="text-xs font-bold uppercase 
                          tracking-[0.3em] text-[#C8A96E] mb-4">
                04 · Retroactive Why
              </p>
              <p className="font-semibold text-[#F5F0E8] 
                          leading-relaxed text-lg">
                {frame.the_retroactive_why}
              </p>
            </div>
          </div>
        </div>

        {/* ONE-LINER — below the grid */}
        <div className="w-full bg-[#F5F0E8] mt-0 px-8 py-6">
          <p className="text-[10px] font-bold uppercase 
                        tracking-[0.25em] text-[#0A0A0A]/40 mb-3">
            05 · The One-Liner
          </p>
          <p className="font-bold text-[#0A0A0A] uppercase 
                        italic text-center leading-snug text-lg">
            {frame.the_one_liner}
          </p>
        </div>

        {/* COMMENTS */}
        <div className="mt-12 border-t border-[#2A2A2A] pt-8">
          <h2 className="text-xs font-semibold text-[#F5F0E8] 
                       mb-6 uppercase tracking-widest">
            Comments
          </h2>
          {user ? (
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-[#141414] border 
                         border-[#2A2A2A] px-3 py-2 
                         text-sm text-[#F5F0E8] 
                         placeholder:text-[#555] 
                         focus:outline-none 
                         focus:border-[#C8A96E] 
                         transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && addComment()}
              />
              <Button variant="accentFill" size="sm" 
                      onClick={addComment}>
                Post
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setAuthPrompt(true)}
              className="w-full mb-6 flex items-center 
                         justify-between px-4 py-3 
                         border border-[#2A2A2A] 
                         text-sm text-[#555] 
                         hover:border-[#C8A96E] 
                         hover:text-[#C8A96E] 
                         transition-colors group"
            >
              <span>Leave a comment...</span>
              <ArrowRight size={14} 
                className="opacity-0 group-hover:opacity-100 
                           transition-opacity" />
            </button>
          )}
          <div className="space-y-5">
            {comments.map((c: any) => (
              <div key={c.id} className="flex gap-3">
                <Link to={`/${c.author?.username}`}>
                  <div className="w-7 h-7 rounded-full 
                                  bg-[#1A1A1A] border border-[#2A2A2A] 
                                  flex items-center justify-center 
                                  text-xs text-[#999] shrink-0 
                                  overflow-hidden 
                                  hover:border-[#C8A96E] 
                                  transition-colors">
                    {c.author?.avatar_url
                      ? <img src={c.author.avatar_url} alt=""
                             className="w-full h-full object-cover" />
                      : c.author?.username?.charAt(0).toUpperCase()
                    }
                  </div>
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/${c.author?.username}`}
                      className="text-sm font-medium 
                                 text-[#F5F0E8] 
                                 hover:text-[#C8A96E] 
                                 transition-colors"
                    >
                      {c.author?.username}
                    </Link>
                    <span className="text-xs text-[#999]">
                      {formatDistanceToNow(
                        new Date(c.created_at), 
                        { addSuffix: true }
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-[#999] mt-1">
                    {c.content}
                  </p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-[#555]">
                No comments yet. Be the first.
              </p>
            )}
          </div>
        </div>
      </div>

      {authPrompt && (
        <div className="fixed inset-0 z-50 flex items-center 
                        justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm bg-[#141414] 
                          border border-[#2A2A2A] p-6 
                          font-['Space_Grotesk']">

            {/* Close */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setAuthPrompt(false)}
                aria-label="Close"
                className="text-[#555] hover:text-[#F5F0E8]
                           transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.2em] 
                            text-[#C8A96E] font-bold mb-3">
                Join the archive
              </p>
              <h3 className="text-lg font-semibold text-[#F5F0E8] 
                             leading-snug mb-2">
                You need an account to do that.
              </h3>
              <p className="text-sm text-[#888] leading-relaxed">
                Afterframe is where hard experiences finally 
                make sense. Create an account to like, comment, 
                save, and share your own story.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                to="/signup"
                onClick={() => setAuthPrompt(false)}
                className="w-full text-center bg-[#C8A96E] 
                           text-[#0A0A0A] font-bold px-4 py-3 
                           text-sm uppercase tracking-widest 
                           hover:bg-[#B89558] transition-colors"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                onClick={() => setAuthPrompt(false)}
                className="w-full text-center text-sm 
                           text-[#888] border border-[#2A2A2A] 
                           px-4 py-3 hover:border-[#555] 
                           hover:text-[#F5F0E8] transition-colors"
              >
                Sign In
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default FrameView;
