import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import WritePage from "./WritePage";

const EditPage = () => {
  const { id } = useParams();
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: frame } = await supabase
        .from("afterframes")
        .select("*")
        .eq("id", id)
        .single();
      if (frame) {
        setData({
          title: frame.title,
          the_event: frame.the_event,
          the_gut_punch: frame.the_gut_punch,
          the_pivot: frame.the_pivot,
          the_retroactive_why: frame.the_retroactive_why,
          the_one_liner: frame.the_one_liner,
        });
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Not found</div>;

  return <WritePage editId={id} initialData={data} />;
};

export default EditPage;
