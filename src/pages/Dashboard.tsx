import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
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

  const deleteFrame = async (id: string) => {
    if (!confirm("Delete this afterframe?")) return;
    await supabase.from("afterframes").delete().eq("id", id);
    toast.success("Deleted");
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
                <Button variant="ghost" size="icon" onClick={() => deleteFrame(f.id)} className="text-destructive hover:text-destructive">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
