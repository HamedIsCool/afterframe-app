import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import WritePage from "./WritePage";

const EditPage = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const fetch = async () => {
      const { data: frame } = await supabase
        .from("afterframes")
        .select("*, author:profiles!author_id(username)")
        .eq("id", id)
        .single();

      // Ownership check — only the author can edit.
      if (frame && user && frame.author_id !== user.id) {
        toast.error("You can only edit your own frames");
        navigate("/dashboard/frames", { replace: true });
        return;
      }

      if (frame) frame.author_username = frame.author?.username || "";
      if (frame) {
        setData({
          title: frame.title,
          the_event: frame.the_event,
          the_gut_punch: frame.the_gut_punch,
          the_pivot: frame.the_pivot,
          the_retroactive_why: frame.the_retroactive_why,
          the_one_liner: frame.the_one_liner,
          is_published: String(frame.is_published),
        });
      }
      setLoading(false);
    };
    fetch();
  }, [id, user, authLoading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Not found</div>;

  return <WritePage editId={id} initialData={data} />;
};

export default EditPage;
