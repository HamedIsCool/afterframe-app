import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { frameUrl } from "@/lib/frameUrl";
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
  const isPublished = initialData?.is_published === "true";
  const authorUsername = initialData?.author_username || "";
  const wasAnonymous = initialData?.is_anonymous === "true";

  const [isAnonymous, setIsAnonymous] = useState(wasAnonymous);
  const [dirty, setDirty] = useState(false);
  const [linkChanged, setLinkChanged] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const handleSave = async (publish: boolean) => {
    if (!user) return;
    if (!title.trim()) { 
      toast.error("A title is required"); 
      return; 
    }
    if (publish) {
      for (const f of fields) {
        if (!values[f.key]?.trim()) { 
          toast.error(`${f.label} is required to publish`); 
          return; 
        }
      }
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
      is_anonymous: isAnonymous,
      // Only stamp published_at the first time a frame is published.
      // Editing an already-published frame must not reset its date.
      ...(publish && !isPublished ? { published_at: new Date().toISOString() } : {}),
    };

    let error;
    if (editId) {
      ({ error } = await supabase
        .from("afterframes")
        .update(payload)
        .eq("id", editId));
    } else {
      ({ error } = await supabase
        .from("afterframes")
        .insert(payload));
    }

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    // If editing an already-published frame and the anonymity flag flipped,
    // the canonical URL changed. Surface the new link so the user can re-share.
    if (editId && isPublished && isAnonymous !== wasAnonymous) {
      const newPath = frameUrl({ id: editId, is_anonymous: isAnonymous, authorUsername });
      setLinkChanged(`https://afterfra.me${newPath}`);
      return;
    }

    toast.success(publish ? "Published!" : "Draft saved");
    navigate("/dashboard");
  };

  const copyNewLink = async () => {
    if (!linkChanged) return;
    await navigator.clipboard.writeText(linkChanged);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-10 px-4 
                  font-['Space_Grotesk']">
      <div className="w-full max-w-[720px] mx-auto">

        {/* TITLE */}
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
          placeholder="Give your story a title"
          maxLength={70}
          className="w-full bg-transparent text-3xl font-bold 
                     text-[#F5F0E8] tracking-tight 
                     placeholder:text-[#333] border-none 
                     outline-none mb-8 leading-snug"
        />

        {/* BENTO GRID */}
        <div className="w-full border border-[#2A2A2A]">

          {/* ROW 1 — Event + Pivot */}
          <div className="flex flex-col md:flex-row 
                        border-b border-[#2A2A2A]">

            {/* THE EVENT */}
            <div className="relative w-full md:w-1/2 
                          border-b md:border-b-0 
                          md:border-r border-[#2A2A2A] 
                          p-6 min-h-[180px] 
                          focus-within:bg-[#0F0F0F] 
                          transition-colors">
              <div className="flex items-center 
                              justify-between mb-3">
                <label className="text-xs font-bold uppercase 
                                  tracking-[0.2em] text-[#555]">
                  The Event
                </label>
                <span className="text-xs text-[#333] tabular-nums">
                  {values.the_event.length}/120
                </span>
              </div>
              <textarea
                maxLength={120}
                value={values.the_event}
                onChange={(e) => { setValues(v => ({
                  ...v, the_event: e.target.value
                })); setDirty(true); }}
                placeholder="What happened?"
                className="w-full h-[120px] resize-none 
                           bg-transparent text-[#F5F0E8] 
                           font-medium leading-relaxed 
                           text-base outline-none 
                           placeholder:text-[#2A2A2A]"
              />
            </div>

            {/* THE PIVOT */}
            <div className="relative w-full md:w-1/2 
                          p-6 min-h-[180px] 
                          focus-within:bg-[#0F0F0F] 
                          transition-colors">
              <div className="flex items-center 
                              justify-between mb-3">
                <label className="text-xs font-bold uppercase 
                                  tracking-[0.2em] text-[#555]">
                  The Pivot
                </label>
                <span className="text-xs text-[#333] tabular-nums">
                  {values.the_pivot.length}/120
                </span>
              </div>
              <textarea
                maxLength={120}
                value={values.the_pivot}
                onChange={(e) => { setValues(v => ({
                  ...v, the_pivot: e.target.value
                })); setDirty(true); }}
                placeholder="What was the first move?"
                className="w-full h-[120px] resize-none 
                           bg-transparent text-[#F5F0E8] 
                           font-medium leading-relaxed 
                           text-base outline-none 
                           placeholder:text-[#2A2A2A]"
              />
            </div>
          </div>

          {/* ROW 2 — Gut-Punch + Retroactive Why */}
          <div className="flex flex-col md:flex-row">

            {/* THE GUT-PUNCH */}
            <div className="w-full md:w-[38%] 
                          border-b md:border-b-0 
                          md:border-r border-[#2A2A2A] 
                          bg-[#141414] p-6 min-h-[200px]
                          focus-within:bg-[#1A1212] 
                          transition-colors"
                 style={{ borderLeft: '3px solid #8B3A3A' }}>
              <div className="flex items-center 
                              justify-between mb-3">
                <label className="text-xs font-bold uppercase 
                                  tracking-[0.2em] text-[#8B3A3A]">
                  Gut-Punch
                </label>
                <span className="text-xs text-[#8B3A3A]/40 
                                 tabular-nums">
                  {values.the_gut_punch.length}/100
                </span>
              </div>
              <div className="w-8 h-px bg-[#8B3A3A]/30 mb-4" />
              <textarea
                maxLength={100}
                value={values.the_gut_punch}
                onChange={(e) => { setValues(v => ({
                  ...v, the_gut_punch: e.target.value
                })); setDirty(true); }}
                placeholder="How did it feel?"
                className="w-full h-[120px] resize-none 
                           bg-transparent text-[#F5F0E8]/80 
                           italic font-medium leading-relaxed 
                           text-base outline-none 
                           placeholder:text-[#8B3A3A]/20"
              />
            </div>

            {/* THE RETROACTIVE WHY */}
            <div className="relative w-full md:w-[62%] 
                          p-8 min-h-[200px] 
                          flex flex-col justify-center 
                          text-center 
                          focus-within:border-[#C8A96E]/40 
                          transition-colors"
                 style={{ 
                   border: '1px solid rgba(200,169,110,0.15)',
                   borderLeft: 'none',
                   borderTop: 'none'
                 }}>
              <div className="absolute top-0 left-0 w-6 h-6 
                              border-t-2 border-l-2 
                              border-[#C8A96E]" />
              <div className="absolute bottom-0 right-0 w-6 h-6 
                              border-b-2 border-r-2 
                              border-[#C8A96E]" />
              <div className="flex items-center 
                              justify-between mb-4">
                <label className="text-xs font-bold uppercase 
                                  tracking-[0.3em] text-[#C8A96E]">
                  Retroactive Why
                </label>
                <span className="text-xs text-[#C8A96E]/30 
                                 tabular-nums">
                  {values.the_retroactive_why.length}/200
                </span>
              </div>
              <textarea
                maxLength={200}
                value={values.the_retroactive_why}
                onChange={(e) => { setValues(v => ({
                  ...v, the_retroactive_why: e.target.value
                })); setDirty(true); }}
                placeholder="What truth can't you unsee now?"
                className="w-full h-[130px] resize-none 
                           bg-transparent text-center 
                           text-[#F5F0E8] font-semibold 
                           leading-relaxed text-base 
                           outline-none 
                           placeholder:text-[#C8A96E]/10"
              />
            </div>
          </div>
        </div>

        {/* ONE-LINER — below the grid */}
        <div className="w-full bg-[#F5F0E8] 
                        focus-within:bg-[#C8A96E] 
                        transition-colors px-8 py-6">
          <div className="flex items-center 
                          justify-between mb-3">
            <label className="text-[10px] font-bold uppercase 
                              tracking-[0.25em] text-[#0A0A0A]/50">
              The One-Liner
            </label>
            <span className="text-xs text-[#0A0A0A]/30 tabular-nums">
              {values.the_one_liner.length}/80
            </span>
          </div>
          <input
            type="text"
            value={values.the_one_liner}
            onChange={(e) => { setValues(v => ({
              ...v, the_one_liner: e.target.value
            })); setDirty(true); }}
            placeholder="Distil it to one sentence"
            maxLength={80}
            className="w-full bg-transparent font-bold 
                       text-[#0A0A0A] uppercase italic 
                       text-center outline-none text-base
                       placeholder:text-[#0A0A0A]/25"
          />
        </div>

        {/* STICKY FOOTER */}
        <div className="sticky bottom-0 bg-[#0A0A0A]
                        border-t border-[#2A2A2A]
                        py-4 mt-0 flex items-center
                        justify-between gap-3">

          {/* Left: anonymity toggle + view-frame link */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => { setIsAnonymous(a => !a); setDirty(true); }}
              className="flex items-center gap-2 text-xs text-[#888]
                         hover:text-[#F5F0E8] transition-colors"
            >
              <span className={`w-4 h-4 border flex items-center justify-center
                ${isAnonymous ? "bg-[#C8A96E] border-[#C8A96E]" : "border-[#555]"}`}>
                {isAnonymous && <span className="text-[#0A0A0A] text-[10px] font-bold">✓</span>}
              </span>
              Publish anonymously
            </button>
            {isPublished && isAnonymous !== wasAnonymous && (
              <p className="text-[10px] text-[#C8A96E] leading-snug max-w-[260px]">
                Changing this will change your frame's link. You'll get the new
                link after saving.
              </p>
            )}
            {editId && isPublished && (
              <a
                href={frameUrl({ id: editId, is_anonymous: wasAnonymous, authorUsername })}
                className="text-xs text-[#555] hover:text-[#C8A96E]
                           transition-colors uppercase tracking-widest"
              >
                ↗ View Frame
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isPublished && (
              <Button variant="ghost"
                      onClick={() => handleSave(false)}
                      disabled={saving || !dirty}>
                Save Draft
              </Button>
            )}
            <Button variant="accentFill"
                    onClick={() => handleSave(true)}
                    disabled={saving || !dirty}>
              {isPublished ? "Save Changes" : "Publish Afterframe"}
            </Button>
          </div>
        </div>

      </div>

      {/* NEW LINK MODAL — shown when anonymity change altered the URL */}
      {linkChanged && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm bg-[#141414] border border-[#2A2A2A] p-6 font-['Space_Grotesk']">
            <div className="w-8 h-8 border-t-2 border-l-2 border-[#C8A96E] mb-6" />
            <p className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-bold mb-3">
              Your link changed
            </p>
            <p className="text-sm text-[#888] leading-relaxed mb-4">
              Because you changed the anonymity setting, this frame now lives at a
              new address. Old links will redirect, but here's the canonical one:
            </p>
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2 mb-4">
              <p className="text-xs text-[#F5F0E8] font-mono break-all">{linkChanged}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={copyNewLink}
                className="flex-1 text-sm font-bold uppercase tracking-widest px-4 py-2.5
                           bg-[#C8A96E] text-[#0A0A0A] hover:bg-[#B89558] transition-colors"
              >
                {copied ? "Copied" : "Copy Link"}
              </button>
              <button
                onClick={() => { setLinkChanged(null); navigate("/dashboard"); }}
                className="text-sm text-[#888] px-4 py-2.5 border border-[#2A2A2A]
                           hover:border-[#555] hover:text-[#F5F0E8] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritePage;
