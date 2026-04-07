import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const fields = [
  { key: "the_event", label: "The Event", helper: "What happened? Keep it factual and specific." },
  { key: "the_gut_punch", label: "The Gut-Punch", helper: "How did it feel in the first 24 hours? Be honest." },
  { key: "the_pivot", label: "The Pivot", helper: "What specific action did you take to move forward?" },
  { key: "the_retroactive_why", label: "The Retroactive Why", helper: "Looking back — why was this necessary for your growth?" },
  { key: "the_one_liner", label: "The One-Liner", helper: "Distill it. One punchy sentence for someone in the middle of it right now.", special: true },
];

interface WritePageProps {
  editId?: string;
  initialData?: Record<string, string>;
}

const WritePage = ({ editId, initialData }: WritePageProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialData?.title || "");
  const [values, setValues] = useState<Record<string, string>>({
    the_event: initialData?.the_event || "",
    the_gut_punch: initialData?.the_gut_punch || "",
    the_pivot: initialData?.the_pivot || "",
    the_retroactive_why: initialData?.the_retroactive_why || "",
    the_one_liner: initialData?.the_one_liner || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (publish: boolean) => {
    if (!user) return;
    if (!title.trim()) { toast.error("Title is required"); return; }
    for (const f of fields) {
      if (!values[f.key]?.trim()) { toast.error(`${f.label} is required`); return; }
    }

    setSaving(true);
    const payload = {
      author_id: user.id,
      title,
      the_event: values.the_event,
      the_gut_punch: values.the_gut_punch,
      the_pivot: values.the_pivot,
      the_retroactive_why: values.the_retroactive_why,
      the_one_liner: values.the_one_liner,
      is_published: publish,
      ...(publish ? { published_at: new Date().toISOString() } : {}),
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from("afterframes").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("afterframes").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(publish ? "Published!" : "Draft saved");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-10 px-4 font-['Space_Grotesk']">
      <div className="w-full max-w-[640px] mx-auto">

        {/* TITLE INPUT */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your story a title"
          maxLength={70}
          className="w-full bg-transparent text-2xl font-bold text-[#F5F0E8] tracking-tight placeholder:text-[#333] border-none outline-none mb-6"
        />

        {/* ONE-LINER BOX — editable, matches view layout */}
        <div className="w-full bg-[#F5F0E8] mb-6 px-6 py-4 focus-within:bg-[#C8A96E] transition-colors">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/50 mb-2 font-bold">
            One-Liner
          </p>
          <input
            type="text"
            value={values.the_one_liner}
            onChange={(e) => setValues(v => ({ ...v, the_one_liner: e.target.value }))}
            placeholder="DISTIL IT TO ONE SENTENCE"
            maxLength={80}
            className="w-full bg-transparent text-base font-bold text-[#0A0A0A] uppercase italic text-center outline-none placeholder:text-[#0A0A0A]/30"
          />
        </div>

        {/* BENTO GRID */}
        <div className="w-full" style={{ containerType: 'inline-size' }}>

          {/* ROW 1 — Event + Pivot */}
          <div className="flex" style={{ height: '28cqw', overflow: 'visible' }}>

            {/* THE EVENT */}
            <div className="relative w-1/2 border-t border-l border-[#2A2A2A] transition-colors focus-within:border-[#444]"
                 style={{ padding: '2.5cqw' }}>
              <span
                className="absolute bg-[#0A0A0A] font-bold uppercase tracking-[0.2em] text-[#888]"
                style={{ top: '-0.9cqw', left: '2cqw', padding: '0 0.8cqw', fontSize: '1.2cqw', zIndex: 10 }}>
                The Event
              </span>
              <div style={{ overflow: 'hidden', height: '100%', paddingTop: '1.5cqw' }}>
                <textarea
                  maxLength={120}
                  value={values.the_event}
                  onChange={(e) => setValues(v => ({ ...v, the_event: e.target.value }))}
                  placeholder="What happened?"
                  className="h-full w-full resize-none bg-transparent text-[#F5F0E8] font-medium leading-snug outline-none placeholder:text-[#2A2A2A]"
                  style={{ fontSize: '2cqw' }}
                />
              </div>
            </div>

            {/* THE PIVOT */}
            <div className="relative w-1/2 border-t border-l border-r border-[#2A2A2A] transition-colors focus-within:border-[#444]"
                 style={{ padding: '2.5cqw' }}>
              <span
                className="absolute bg-[#0A0A0A] font-bold uppercase tracking-[0.2em] text-[#888]"
                style={{ top: '-0.9cqw', left: '2cqw', padding: '0 0.8cqw', fontSize: '1.2cqw', zIndex: 10 }}>
                The Pivot
              </span>
              <div style={{ overflow: 'hidden', height: '100%', paddingTop: '1.5cqw' }}>
                <textarea
                  maxLength={120}
                  value={values.the_pivot}
                  onChange={(e) => setValues(v => ({ ...v, the_pivot: e.target.value }))}
                  placeholder="What was the first move?"
                  className="h-full w-full resize-none bg-transparent text-[#F5F0E8] font-medium leading-snug outline-none placeholder:text-[#2A2A2A]"
                  style={{ fontSize: '2cqw' }}
                />
              </div>
            </div>
          </div>

          {/* ROW 2 — Gut-Punch + Retroactive Why */}
          <div className="grid border-t border-[#2A2A2A]"
               style={{ gridTemplateColumns: '5fr 9fr', height: '38cqw' }}>

            {/* THE GUT-PUNCH */}
            <div className="relative flex flex-col overflow-hidden bg-[#141414] transition-all focus-within:bg-[#1A1212]"
                 style={{
                   borderLeft: '3px solid #8B3A3A',
                   borderRight: '1px solid #2A2A2A',
                   padding: '2.5cqw'
                 }}>
              <span className="font-bold uppercase tracking-[0.2em] text-[#8B3A3A] shrink-0"
                    style={{ fontSize: '1.3cqw', marginBottom: '1.2cqw' }}>
                Gut-Punch
              </span>
              <div className="shrink-0 bg-[#8B3A3A]/30"
                   style={{ height: '1px', width: '5cqw', marginBottom: '1.5cqw' }} />
              <textarea
                maxLength={100}
                value={values.the_gut_punch}
                onChange={(e) => setValues(v => ({ ...v, the_gut_punch: e.target.value }))}
                placeholder="How did it feel?"
                className="h-full w-full resize-none bg-transparent text-[#F5F0E8]/80 italic font-medium leading-snug outline-none overflow-hidden placeholder:text-[#8B3A3A]/20"
                style={{ fontSize: '1.8cqw' }}
              />
            </div>

            {/* THE RETROACTIVE WHY */}
            <div className="relative flex flex-col justify-center overflow-hidden text-center transition-all focus-within:border-[#C8A96E]/50"
                 style={{
                   border: '1px solid rgba(200,169,110,0.2)',
                   borderLeft: 'none',
                   padding: '4cqw'
                 }}>
              <div className="absolute top-0 left-0 border-[#C8A96E]"
                   style={{ width: '3cqw', height: '3cqw', borderTop: '2px solid', borderLeft: '2px solid' }} />
              <div className="absolute bottom-0 right-0 border-[#C8A96E]"
                   style={{ width: '3cqw', height: '3cqw', borderBottom: '2px solid', borderRight: '2px solid' }} />
              <span className="block font-bold uppercase tracking-[0.4em] text-[#C8A96E]"
                    style={{ fontSize: '1.3cqw', marginBottom: '2cqw' }}>
                Retroactive Why
              </span>
              <textarea
                maxLength={200}
                value={values.the_retroactive_why}
                onChange={(e) => setValues(v => ({ ...v, the_retroactive_why: e.target.value }))}
                placeholder="What truth can't you unsee now?"
                className="w-full resize-none bg-transparent text-center text-[#F5F0E8] font-semibold tracking-tight leading-snug outline-none overflow-hidden placeholder:text-[#C8A96E]/10"
                style={{ fontSize: '2.4cqw', height: '55%' }}
              />
            </div>
          </div>
        </div>

        {/* STICKY FOOTER */}
        <div className="sticky bottom-0 bg-[#0A0A0A] border-t border-[#2A2A2A] py-4 mt-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => handleSave(false)} disabled={saving}>
            Save Draft
          </Button>
          <Button variant="accentFill" onClick={() => handleSave(true)} disabled={saving}>
            Publish Afterframe
          </Button>
        </div>

      </div>
    </div>
  );
};

export default WritePage;
