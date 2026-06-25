import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const WallPage = () => {
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLines = async () => {
      const { data } = await supabase
        .from("afterframes")
        .select("id, the_one_liner, title, published_at, updated_at, author:profiles!author_id(username)")
        .eq("is_published", true)
        .not("the_one_liner", "is", null)
        .order("published_at", { ascending: false });
      setLines(data || []);
      setLoading(false);
    };
    fetchLines();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-['Space_Grotesk']">

      {/* HEADER */}
      <div className="border-b border-[#2A2A2A] px-4 md:px-6 py-10 text-center">
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

      {/* GRID */}
      <div className="w-full px-4 md:px-6 py-8 md:py-12">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lines.map((line) => (
              <Link
                key={line.id}
                to={`/frame/${line.author?.username}/${line.id}`}
                className="group relative flex flex-col
                           border border-[#222] bg-[#101010]
                           pt-7 px-6 pb-5
                           hover:border-[#C8A96E] hover:bg-[#121212]
                           transition-colors"
              >
                {/* Gold corner bracket — the logomark */}
                <div className="absolute top-3 left-3 w-3.5 h-3.5
                                border-t-2 border-l-2 border-[#C8A96E]
                                opacity-50 group-hover:opacity-100
                                transition-opacity" />

                {/* One-liner — bright at rest, the star of the card */}
                <p className="text-[15px] font-semibold text-[#D8D0C4]
                               group-hover:text-[#F5F0E8]
                               leading-[1.45] mb-5 transition-colors">
                  "{line.the_one_liner}"
                </p>

                {/* Footer: username + timestamp */}
                <div className="mt-auto flex items-center justify-between
                                text-[10px] uppercase tracking-[0.12em]">
                  <span className="text-[#555] group-hover:text-[#888]
                                   transition-colors font-medium">
                    {line.author?.username}
                  </span>
                  <span className="text-[#383838] group-hover:text-[#555]
                                   transition-colors">
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
