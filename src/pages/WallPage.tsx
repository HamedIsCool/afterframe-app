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

      {/* GRID */}
      <div className="max-w-5xl mx-auto px-6 py-12">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lines.map((line) => (
              <Link
                key={line.id}
                to={`/frame/${line.author?.username}/${line.id}`}
                className="group flex flex-col justify-between
                           h-[200px] border border-[#2A2A2A] bg-[#141414]
                           p-5 hover:border-[#C8A96E] transition-colors"
              >
                {/* One-liner */}
                <p className="text-sm font-semibold italic text-[#666]
                               group-hover:text-[#F5F0E8]
                               transition-colors leading-relaxed mb-4">
                  "{line.the_one_liner}"
                </p>

                {/* Divider */}
                <div className="w-6 h-px bg-[#2A2A2A] group-hover:bg-[#C8A96E]/40
                                transition-colors mb-3" />

                {/* Title */}
                <p className="text-xs text-[#444] group-hover:text-[#666]
                               transition-colors leading-snug mb-3 line-clamp-2">
                  {line.title}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#333] group-hover:text-[#555]
                                   transition-colors font-medium">
                    {line.author?.username}
                  </span>
                  <span className="text-xs text-[#2A2A2A] group-hover:text-[#444]
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
