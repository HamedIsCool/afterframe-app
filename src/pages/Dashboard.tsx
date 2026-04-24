import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<"published" | "drafts">("published");
  const [frames, setFrames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = 
    useState<{ id: string; title: string } | null>(null);

  const fetchFrames = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("afterframes")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });
    setFrames(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchFrames(); }, [user]);

  const deleteFrame = async () => {
    if (!deleteTarget) return;
    await supabase
      .from("afterframes")
      .delete()
      .eq("id", deleteTarget.id);
    toast.success("Afterframe deleted");
    setDeleteTarget(null);
    fetchFrames();
  };

  const filtered = frames.filter((f) => (tab === "published" ? f.is_published : !f.is_published));

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="flex gap-4 mb-6 border-b border-border">
        {(["published", "drafts"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 text-sm font-medium capitalize transition-colors border-b-2 ${tab === t ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">No {tab} yet.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((f: any) => (
            <div key={f.id} className="flex items-center justify-between border border-border bg-card p-4">
              <div>
                <p className="text-foreground font-medium">{f.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(f.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 border ${f.is_published ? "border-accent text-accent" : "border-border text-muted-foreground"}`}>
                  {f.is_published ? "Published" : "Draft"}
                </span>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/edit/${f.id}`}><Pencil size={16} /></Link>
                </Button>
                <button
                  onClick={() => setDeleteTarget({ 
                    id: f.id, 
                    title: f.title 
                  })}
                  className="p-2 text-[#555] hover:text-[#8B3A3A] 
                             transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center 
                        justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm bg-[#141414] 
                          border border-[#2A2A2A] p-6 
                          font-['Space_Grotesk']">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] 
                              text-[#8B3A3A] font-bold mb-1">
                  Delete Afterframe
                </p>
                <p className="text-sm text-[#F5F0E8] font-medium 
                              leading-snug">
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

            {/* Body */}
            <p className="text-sm text-[#888] leading-relaxed mb-6">
              This will permanently remove this Afterframe 
              from the archive. This cannot be undone.
            </p>

            {/* Actions */}
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
