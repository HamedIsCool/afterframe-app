import { Link } from "react-router-dom";

const TheoryPage = () => (
  <div className="min-h-screen bg-[#0A0A0A] font-['Space_Grotesk'] px-4 py-16">
    <div className="max-w-2xl mx-auto">

      {/* Epigraph */}
      <div className="border-l-2 border-[#C8A96E] pl-6 mb-16">
        <p className="text-2xl font-semibold italic text-[#F5F0E8] leading-snug mb-3">
          "Life can only be understood backwards; 
          but it must be lived forwards."
        </p>
        <p className="text-sm text-[#888] tracking-widest uppercase">
          Søren Kierkegaard
        </p>
      </div>

      {/* Section 1 */}
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-[#888] mb-4">
          The Problem
        </p>
        <h2 className="text-xl font-semibold text-[#F5F0E8] mb-4 leading-snug">
          You lived through something hard. 
          Then you understood it. 
          Then it disappeared.
        </h2>
        <p className="text-[#888] leading-relaxed text-base">
          Most hard experiences follow the same arc: 
          chaos, confusion, survival, and then — 
          sometimes months or years later — clarity. 
          A moment where you finally see why it had to happen. 
          That moment of retroactive understanding is 
          one of the most valuable things a person can produce. 
          And almost no one records it.
        </p>
      </div>

      <div className="w-full my-14 overflow-hidden">
        <svg width="100%" viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
          <line x1="64" y1="30" x2="64" y2="320" stroke="#2A2A2A" strokeWidth="0.5"/>
          <line x1="64" y1="320" x2="640" y2="320" stroke="#2A2A2A" strokeWidth="0.5"/>
          <text x="30" y="175" fontSize="11" fill="#555" textAnchor="middle" transform="rotate(-90 30 175)" fontFamily="Space Grotesk, sans-serif">Clarity</text>
          <text x="352" y="348" fontSize="11" fill="#555" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">Time</text>
          <path d="M64 190 C100 188, 140 186, 165 188 C180 190, 195 200, 210 250 C222 290, 230 308, 248 312 C268 316, 288 310, 310 295 C340 275, 370 240, 405 195 C435 158, 460 120, 500 88 C520 72, 545 60, 580 54" fill="none" stroke="#C8A96E" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="190" cy="222" r="5" fill="#C8A96E"/>
          <circle cx="248" cy="312" r="5" fill="#8B3A3A"/>
          <circle cx="335" cy="272" r="5" fill="#555"/>
          <circle cx="450" cy="130" r="5" fill="#C8A96E" opacity="0.6"/>
          <circle cx="568" cy="58" r="7" fill="#F5F0E8" stroke="#C8A96E" strokeWidth="1.5"/>
          <line x1="190" y1="224" x2="190" y2="320" stroke="#2A2A2A" strokeWidth="0.5" strokeDasharray="3 3"/>
          <line x1="248" y1="314" x2="248" y2="320" stroke="#8B3A3A" strokeWidth="0.5" strokeDasharray="3 3"/>
          <line x1="335" y1="274" x2="335" y2="320" stroke="#2A2A2A" strokeWidth="0.5" strokeDasharray="3 3"/>
          <line x1="568" y1="60" x2="568" y2="320" stroke="#C8A96E" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4"/>
          <text x="190" y="338" fontSize="11" fill="#C8A96E" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">The Event</text>
          <text x="248" y="338" fontSize="11" fill="#8B3A3A" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">Gut-Punch</text>
          <text x="335" y="338" fontSize="11" fill="#555" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">The Pivot</text>
          <text x="568" y="338" fontSize="11" fill="#C8A96E" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">One-Liner</text>
          <text x="420" y="108" fontSize="11" fill="#555" fontFamily="Space Grotesk, sans-serif">Retroactive</text>
          <text x="420" y="120" fontSize="11" fill="#555" fontFamily="Space Grotesk, sans-serif">Why</text>
          <text x="340" y="390" fontSize="10" fill="#333" textAnchor="middle" fontStyle="italic" fontFamily="Space Grotesk, sans-serif">"Life can only be understood backwards; but it must be lived forwards." — Kierkegaard</text>
        </svg>
      </div>

      {/* Section 2 */}
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-[#888] mb-4">
          The Model
        </p>
        <h2 className="text-xl font-semibold text-[#F5F0E8] mb-4 leading-snug">
          The Teleological Narrative
        </h2>
        <p className="text-[#888] leading-relaxed text-base mb-4">
          In storytelling, a teleological narrative is one 
          where the ending gives meaning to everything 
          that came before it. You aren't just recounting 
          what happened — you are performing an act of 
          sense-making. You are taking a chaotic, 
          non-linear event and forcing it into a frame of purpose.
        </p>
        <p className="text-[#888] leading-relaxed text-base">
          This is what Afterframe is built on. 
          Not therapy. Not inspiration. 
          The structured, honest act of putting a frame 
          around something — after the fact — 
          and saying: <span className="text-[#F5F0E8] font-medium italic">this is what it meant.</span>
        </p>
      </div>

      {/* The 5 fields explained */}
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-[#888] mb-6">
          The Framework
        </p>
        <div className="space-y-6">
          {[
            { label: "The Event", desc: "What happened, factually. No interpretation yet. Just the raw sequence of events." },
            { label: "The Gut-Punch", desc: "The emotional truth of the first 24 hours. This is where most people stop — the shame, the fear, the disorientation." },
            { label: "The Pivot", desc: "The first specific action taken. Not a feeling — a move. This is where agency begins." },
            { label: "The Retroactive Why", desc: "The core of the Afterframe. Why was this necessary? What could only have been learned this way? This is the sense-making." },
            { label: "The One-Liner", desc: "The distilled truth. One sentence for someone who is in the middle of their own version of this story right now." },
          ].map((f, i) => (
            <div key={i} className="flex gap-6 border-b border-[#2A2A2A] pb-6">
              <span className="text-xs text-[#C8A96E] font-bold w-6 shrink-0 mt-1">
                0{i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-[#F5F0E8] mb-1 uppercase tracking-wider">
                  {f.label}
                </p>
                <p className="text-sm text-[#888] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-[#2A2A2A] pt-10 text-center">
        <p className="text-[#888] text-sm mb-6">
          You already have an Afterframe. 
          You just haven't written it yet.
        </p>
        <Link
          to="/write"
          className="inline-block bg-[#C8A96E] text-[#0A0A0A] font-bold px-8 py-3 text-sm tracking-widest uppercase hover:bg-[#B89558] transition-colors"
        >
          Frame It
        </Link>
      </div>

    </div>
  </div>
);

export default TheoryPage;
