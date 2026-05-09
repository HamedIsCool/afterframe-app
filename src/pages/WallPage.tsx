import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const WallPage = () => {
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("afterframes")
        .select("id, the_one_liner, title, published_at, updated_at, author:profiles!author_id(username)")
        .eq("is_published", true)
        .not("the_one_liner", "is", null)
        .order("published_at", { ascending: false });
      setLines(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-['Space_Grotesk']">

      {/* HEADER */}
      <div className="border-b border-[#2A2A2A] px-6 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[#C8A96E] font-bold mb-3">
          The Archive
        </p>
        <h1 className="text-2xl font-bold text-[#F5F0E8] mb-3">
          The One-Liner Wall
        </h1>
        <p className="text-sm text-[#888] max-w-sm mx-auto leading-relaxed">
          Every story distilled to one sentence.
          The things people learned the hard way.
        </p>
      </div>

      {/* LINES */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {loading ? (
          <p className="text-[#555] text-sm text-center">Loading...</p>
        ) : lines.length === 0 ? (
          <div className="text-center mt-16">
            <div className="w-8 h-8 border-t-2 border-l-2 border-[#C8A96E] mb-6 mx-auto" />
            <p className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-bold mb-3">
              Nothing here yet
            </p>
            <p className="text-sm text-[#888]">
              The wall fills up as people publish their frames.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {lines.map((line, i) => (
              <Link
                key={line.id}
                to={`/frame/${line.author?.username}/${line.id}`}
                className="group block border-b border-[#141414]
                           hover:border-[#2A2A2A] py-7
                           transition-colors"
              >
                <p className="text-lg font-bold text-[#888] italic
                               group-hover:text-[#F5F0E8]
                               transition-colors leading-snug mb-3">
                  "{line.the_one_liner}"
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#333] group-hover:text-[#555] transition-colors">
                    {line.author?.username}
                  </span>
                  <span className="text-[#2A2A2A]">·</span>
                  <span className="text-xs text-[#333] group-hover:text-[#555] transition-colors">
                    {line.updated_at && new Date(line.updated_at) > new Date(line.published_at)
                      ? `updated ${formatDistanceToNow(new Date(line.updated_at), { addSuffix: true })}`
                      : formatDistanceToNow(new Date(line.published_at), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WallPage;
