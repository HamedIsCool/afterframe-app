import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import AfterframeCard from "@/components/AfterframeCard";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";


const Dashboard = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Derive active tab from URL
  const activeTab = location.pathname === "/dashboard/saved"
    ? "saved"
    : "frames";

  // Frames state
  const [framesTab, setFramesTab] = useState<"published" | "drafts">("published");
  const [frames, setFrames] = useState<any[]>([]);
  const [framesLoading, setFramesLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<{ id: string; title: string } | null>(null);

  // Saved state
  const [savedFrames, setSavedFrames] = useState<any[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // Redirect /dashboard → /dashboard/frames
  useEffect(() => {
    if (location.pathname === "/dashboard") {
      navigate("/dashboard/frames", { replace: true });
    }
  }, [location.pathname]);

  // Fetch frames
  const fetchFrames = async () => {
    if (!user) return;
    setFramesLoading(true);
    const { data } = await supabase
      .from("afterframes")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });
    setFrames(data || []);
    setFramesLoading(false);
  };

  // Fetch saved
  const fetchSaved = async () => {
    if (!user) return;
    setSavedLoading(true);
    const { data: saves } = await supabase
      .from("saves")
      .select("afterframe_id, afterframe:afterframes!afterframe_id(id, title, the_one_liner, published_at, author:profiles!author_id(username, avatar_url))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const items = (saves || []).map((s: any) => s.afterframe).filter(Boolean);
    const ids = items.map((x: any) => x.id);
    const [likesRes, commentsRes] = await Promise.all([
      supabase.from("likes").select("afterframe_id").in("afterframe_id", ids),
      supabase.from("comments").select("afterframe_id").in("afterframe_id", ids),
    ]);
    const lc: Record<string, number> = {};
    const cc: Record<string, number> = {};
    (likesRes.data || []).forEach((l: any) => { lc[l.afterframe_id] = (lc[l.afterframe_id] || 0) + 1; });
    (commentsRes.data || []).forEach((c: any) => { cc[c.afterframe_id] = (cc[c.afterframe_id] || 0) + 1; });
    setSavedFrames(items.map((x: any) => ({ ...x, like_count: lc[x.id] || 0, comment_count: cc[x.id] || 0 })));
    setSavedLoading(false);
  };

  useEffect(() => {
    if (activeTab === "frames") fetchFrames();
    if (activeTab === "saved") fetchSaved();
  }, [user, activeTab]);

  const deleteFrame = async () => {
    if (!deleteTarget) return;
    await supabase.from("afterframes").delete().eq("id", deleteTarget.id);
    toast.success("Afterframe deleted");
    setDeleteTarget(null);
    fetchFrames();
  };

  const unsave = async (afterframeId: string) => {
    if (!user) return;
    await supabase.from("saves").delete().eq("user_id", user.id).eq("afterframe_id", afterframeId);
    setSavedFrames((f) => f.filter((x: any) => x.id !== afterframeId));
  };

  const filtered = frames.filter((f) =>
    framesTab === "published" ? f.is_published : !f.is_published
  );

  return (
    <div>

            {/* ── FRAMES TAB ── */}
            {activeTab === "frames" && (
              <div>
                <div className="flex gap-4 mb-6 border-b border-[#2A2A2A]">
                  {(["published", "drafts"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFramesTab(t)}
                      className={`pb-2 px-1 text-sm font-medium capitalize
                        transition-colors border-b-2
                        ${framesTab === t
                          ? "border-[#C8A96E] text-[#F5F0E8]"
                          : "border-transparent text-[#555] hover:text-[#F5F0E8]"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {framesLoading ? (
                  <p className="text-[#555] text-sm">Loading...</p>
                ) : filtered.length === 0 ? (
                  <div className="mt-16 flex flex-col items-center text-center">
                    <div className="w-8 h-8 border-t-2 border-l-2 border-[#C8A96E] mb-6" />
                    <p className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-bold mb-3">
                      {framesTab === "published" ? "Nothing published yet" : "No drafts"}
                    </p>
                    <p className="text-sm text-[#888] leading-relaxed max-w-xs mb-6">
                      {framesTab === "published"
                        ? "You haven't published a frame yet. When you're ready, your archive starts here."
                        : "No drafts saved. Start writing and save as you go."}
                    </p>
                    <a
                      href="/write"
                      className="text-sm font-bold uppercase tracking-widest px-5 py-2.5
                                 bg-[#C8A96E] text-[#0A0A0A] hover:bg-[#B89558] transition-colors"
                    >
                      Frame It
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((f: any) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between
                                   border border-[#2A2A2A] bg-[#0A0A0A] p-4
                                   hover:border-[#3A3A3A] transition-colors"
                      >
                        <div>
                          {f.is_published && profile?.username ? (
                            <Link
                              to={`/frame/${profile.username}/${f.id}`}
                              className="text-[#F5F0E8] font-medium
                                         hover:text-[#C8A96E] transition-colors"
                            >
                              {f.title}
                            </Link>
                          ) : (
                            <p className="text-[#F5F0E8] font-medium">{f.title}</p>
                          )}
                          <p className="text-xs text-[#555] mt-0.5">
                            {f.is_published && f.updated_at && new Date(f.updated_at) > new Date(f.published_at)
                              ? `updated ${formatDistanceToNow(new Date(f.updated_at), { addSuffix: true })}`
                              : f.is_published && f.published_at
                              ? `published ${formatDistanceToNow(new Date(f.published_at), { addSuffix: true })}`
                              : `created ${formatDistanceToNow(new Date(f.created_at), { addSuffix: true })}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 border
                            ${f.is_published
                              ? "border-[#C8A96E]/40 text-[#C8A96E]"
                              : "border-[#2A2A2A] text-[#555]"}`}>
                            {f.is_published ? "Published" : "Draft"}
                          </span>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/edit/${f.id}`}>
                              <Pencil size={15} className="text-[#555]" />
                            </Link>
                          </Button>
                          <button
                            onClick={() => setDeleteTarget({ id: f.id, title: f.title })}
                            className="p-2 text-[#555] hover:text-[#8B3A3A] transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SAVED TAB ── */}
            {activeTab === "saved" && (
              <div>
                {savedLoading ? (
                  <p className="text-[#555] text-sm">Loading...</p>
                ) : savedFrames.length === 0 ? (
                  <div className="mt-16 flex flex-col items-center text-center">
                    <div className="w-8 h-8 border-t-2 border-l-2 border-[#C8A96E] mb-6" />
                    <p className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-bold mb-3">
                      Nothing saved yet
                    </p>
                    <p className="text-sm text-[#888] leading-relaxed max-w-xs mb-6">
                      Frames you save will appear here. Browse the feed and save the ones that land.
                    </p>
                    <Link
                      to="/feed"
                      className="text-sm font-bold uppercase tracking-widest px-5 py-2.5
                                 border border-[#2A2A2A] text-[#888]
                                 hover:border-[#C8A96E] hover:text-[#C8A96E] transition-colors"
                    >
                      Browse the Archive
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedFrames.map((f: any) => (
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
            )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center
                        justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm bg-[#141414]
                          border border-[#2A2A2A] p-6
                          font-['Space_Grotesk']">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em]
                              text-[#8B3A3A] font-bold mb-1">
                  Delete Afterframe
                </p>
                <p className="text-sm text-[#F5F0E8] font-medium leading-snug">
                  "{deleteTarget.title}"
                </p>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-[#555] hover:text-[#F5F0E8]
                           transition-colors ml-4 shrink-0 mt-0.5"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-[#888] leading-relaxed mb-6">
              This will permanently remove this Afterframe from the archive.
              This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-sm text-[#888] px-4 py-2
                           border border-[#2A2A2A]
                           hover:border-[#555] hover:text-[#F5F0E8]
                           transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteFrame}
                className="text-sm bg-[#8B3A3A] text-[#F5F0E8]
                           font-semibold px-4 py-2
                           hover:bg-[#7A2F2F] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
