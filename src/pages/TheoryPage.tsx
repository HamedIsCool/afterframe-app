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

      <div className="w-full my-14">
  <div style={{
    background: '#f5f0e8',
    border: '1px solid #2A2A2A',
    padding: '2.5rem 1.5rem 2rem'
  }}>
    <svg width="100%" viewBox="0 0 680 460"
         xmlns="http://www.w3.org/2000/svg"
         style={{ fontFamily: "'Space Grotesk', sans-serif", display: 'block' }}>

      <line x1="64" y1="24" x2="64" y2="310" stroke="#333" strokeWidth="0.5"/>
      <line x1="64" y1="310" x2="650" y2="310" stroke="#333" strokeWidth="0.5"/>
      <path d="M60 28 L64 20 L68 28" fill="none" stroke="#333" strokeWidth="0.5"/>
      <path d="M644 306 L652 310 L644 314" fill="none" stroke="#333" strokeWidth="0.5"/>

      <text x="28" y="170" fontSize="11" fill="#444" textAnchor="middle"
            transform="rotate(-90 28 170)">Clarity / Sense-making</text>
      <text x="357" y="380" fontSize="11" fill="#444" textAnchor="middle">Time</text>

      <path
        d="M64 196 C95 194, 130 192, 155 193 C172 194, 188 204, 205 240 C218 262, 228 272, 246 268 C264 264, 284 258, 306 248 C336 234, 366 210, 402 180 C432 153, 460 112, 498 80 C522 60, 548 46, 590 36"
        fill="none" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round"
      />

      <circle cx="190" cy="214" r="4.5" fill="#C8A96E"/>
      <circle cx="246" cy="268" r="4.5" fill="#8B3A3A"/>
      <circle cx="332" cy="234" r="4.5" fill="#555"/>
      <circle cx="462" cy="115" r="4.5" fill="#C8A96E"/>
      <circle cx="578" cy="39" r="6" fill="#F5F0E8" stroke="#C8A96E" strokeWidth="1.5"/>

      <line x1="190" y1="220" x2="190" y2="310" stroke="#2A2A2A" strokeWidth="0.5" strokeDasharray="3 4"/>
      <line x1="246" y1="275" x2="246" y2="310" stroke="#8B3A3A" strokeWidth="0.5" strokeDasharray="3 4"/>
      <line x1="332" y1="244" x2="332" y2="310" stroke="#2A2A2A" strokeWidth="0.5" strokeDasharray="3 4"/>
      <line x1="462" y1="125" x2="462" y2="310" stroke="#2A2A2A" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.3"/>
      <line x1="578" y1="53" x2="578" y2="310" stroke="#C8A96E" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.9"/>

      <text x="148" y="336" fontSize="10.5" fill="#C8A96E" textAnchor="middle"
            fontWeight="600" letterSpacing="0.06em">THE EVENT</text>

      <text x="244" y="336" fontSize="10.5" fill="#8B3A3A" textAnchor="middle"
            fontWeight="600" letterSpacing="0.06em">GUT-PUNCH</text>

      <text x="342" y="336" fontSize="10.5" fill="#666" textAnchor="middle"
            fontWeight="600" letterSpacing="0.06em">THE PIVOT</text>

      <text x="462" y="336" fontSize="10.5" fill="#888" textAnchor="middle"
            fontWeight="500" letterSpacing="0.04em">RETROACTIVE</text>
      <text x="462" y="349" fontSize="10.5" fill="#888" textAnchor="middle"
            fontWeight="500" letterSpacing="0.04em">WHY</text>

      <text x="578" y="336" fontSize="10.5" fill="#C8A96E" textAnchor="middle"
            fontWeight="600" letterSpacing="0.06em">ONE-LINER</text>

      <text x="110" y="184" fontSize="10" fill="#333" textAnchor="middle">stable before</text>
      <text x="592" y="28" fontSize="10" fill="#C8A96E" textAnchor="start">clarity</text>
      <text x="398" y="84" fontSize="10" fill="#555" textAnchor="middle">why it had</text>
      <text x="398" y="96" fontSize="10" fill="#555" textAnchor="middle">to happen</text>

      <text x="340" y="432" fontSize="10" fill="#333" textAnchor="middle"
            fontStyle="italic">
        "Life can only be understood backwards; but it must be lived forwards." - Kierkegaard
      </text>
    </svg>
  </div>
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
