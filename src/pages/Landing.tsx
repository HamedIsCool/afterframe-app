import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const FIELDS = [
  { label: "The Event", desc: "What happened. Factual, no interpretation." },
  { label: "The Gut-Punch", desc: "How it felt in the first 24 hours." },
  { label: "The Pivot", desc: "The specific action you took to move forward." },
  { label: "The Retroactive Why", desc: "Why this was necessary. The sense-making." },
  { label: "The One-Liner", desc: "One sentence for someone in the middle of it right now." },
];

const Landing = () => {
  const { user, loading } = useAuth();
  const [frames, setFrames] = useState<any[]>([]);

  useEffect(() => {
    const fetchFrames = async () => {
      const { data } = await supabase
        .from("afterframes")
        .select("id, title, the_one_liner, author:profiles!author_id(username)")
        .eq("is_published", true)
        .not("the_one_liner", "is", null)
        .order("published_at", { ascending: false })
        .limit(3);
      setFrames(data || []);
    };
    fetchFrames();
  }, []);

  if (!loading && user) return <Navigate to="/feed" replace />;

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-['Space_Grotesk']">

      {/* HERO */}
      <section className="px-4 py-24 md:py-36 text-center max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-[0.3em] text-[#C8A96E] font-bold mb-6">
          Afterframe
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-[#F5F0E8] tracking-tight mb-6 leading-tight">
          Understood backwards.<br />Shared forwards.
        </h1>
        <p className="text-[#888] text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          A structured place to record the experiences you only understood after the fact.
          Not a journal. Not a blog. A permanent frame around what finally makes sense.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto text-center bg-[#C8A96E] text-[#0A0A0A]
                       font-bold text-sm uppercase tracking-widest px-8 py-4
                       hover:bg-[#B89558] transition-colors"
          >
            Frame It
          </Link>
          <Link
            to="/wall"
            className="w-full sm:w-auto text-center border border-[#2A2A2A] text-[#888]
                       font-bold text-sm uppercase tracking-widest px-8 py-4
                       hover:border-[#C8A96E] hover:text-[#F5F0E8] transition-colors"
          >
            Browse the Archive
          </Link>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="border-t border-[#2A2A2A] px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[#888] font-bold mb-6">
            The Problem
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#F5F0E8] leading-snug mb-6">
            You lived through something hard.<br />
            Then you understood it.<br />
            Then it disappeared.
          </h2>
          <p className="text-[#888] leading-relaxed text-base mb-6">
            Most hard experiences follow the same arc — chaos, confusion, survival,
            and then, sometimes years later, clarity. A moment where you finally see
            why it had to happen. That moment of retroactive understanding is one of
            the most valuable things a person can produce. Almost no one records it.
          </p>
          <p className="text-[#888] leading-relaxed text-base">
            Afterframe is the structure that captures it before it disappears —
            and makes it useful for someone else still living it forwards.
          </p>
        </div>
      </section>

      {/* THE FORMAT */}
      <section className="border-t border-[#2A2A2A] px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[#888] font-bold mb-6">
            The Format
          </p>
          <h2 className="text-2xl font-bold text-[#F5F0E8] mb-3">
            Five fields. One complete story.
          </h2>
          <p className="text-[#888] text-sm leading-relaxed mb-10">
            Every Afterframe uses the same structure. It forces you to separate
            facts from feelings, action from meaning — and distil everything into
            one line that can travel on its own.
          </p>
          <div className="space-y-0">
            {FIELDS.map((field, i) => (
              <div
                key={field.label}
                className="flex items-start gap-6 py-5 border-b border-[#1A1A1A]"
              >
                <span className="text-xs text-[#333] font-bold tabular-nums mt-0.5 shrink-0">
                  0{i + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-[#F5F0E8] uppercase tracking-widest mb-1">
                    {field.label}
                  </p>
                  <p className="text-sm text-[#555] leading-relaxed">
                    {field.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/theory"
              className="text-xs uppercase tracking-widest text-[#C8A96E]
                         hover:text-[#F5F0E8] transition-colors font-bold"
            >
              Read the full theory →
            </Link>
          </div>
        </div>
      </section>

      {/* FROM THE ARCHIVE */}
      {frames.length > 0 && (
        <section className="border-t border-[#2A2A2A] px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-[#888] font-bold mb-10">
              From the Archive
            </p>
            <div className="space-y-0">
              {frames.map((frame) => (
                <Link
                  key={frame.id}
                  to={`/frame/${frame.author?.username}/${frame.id}`}
                  className="group block py-7 border-b border-[#141414]
                             hover:border-[#2A2A2A] transition-colors"
                >
                  <p className="text-lg font-bold italic text-[#555]
                                 group-hover:text-[#F5F0E8] transition-colors
                                 leading-snug mb-2">
                    "{frame.the_one_liner}"
                  </p>
                  <p className="text-xs text-[#333] group-hover:text-[#555] transition-colors">
                    {frame.title} — {frame.author?.username}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Link
                to="/wall"
                className="text-xs uppercase tracking-widest text-[#555]
                           hover:text-[#C8A96E] transition-colors font-bold"
              >
                See all one-liners →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="border-t border-[#2A2A2A] px-4 py-24 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-8 h-8 border-t-2 border-l-2 border-[#C8A96E] mb-8 mx-auto" />
          <h2 className="text-2xl md:text-3xl font-bold text-[#F5F0E8] mb-4 leading-snug">
            You already have a story<br />that finally makes sense.
          </h2>
          <p className="text-[#888] text-sm leading-relaxed mb-8">
            Frame it before the clarity fades.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-[#C8A96E] text-[#0A0A0A] font-bold
                       text-sm uppercase tracking-widest px-8 py-4
                       hover:bg-[#B89558] transition-colors"
          >
            Frame It
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Landing;
