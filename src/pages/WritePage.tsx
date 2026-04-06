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
      ...values,
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Give your story a title"
        className="w-full bg-transparent text-3xl font-bold text-foreground placeholder:text-muted-foreground border-none outline-none pb-4 border-b border-border focus:border-accent transition-colors"
        style={{ borderBottom: "1px solid" }}
      />

      <div className="mt-8 space-y-8">
        {fields.map((field) => (
          <div key={field.key}>
            <label className={`text-sm uppercase tracking-widest font-medium block mb-1 ${field.special ? "text-accent text-base" : "text-muted-foreground"}`}>
              {field.label}
            </label>
            <p className="text-xs text-muted-foreground mb-2">{field.helper}</p>
            <textarea
              value={values[field.key]}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              rows={field.special ? 2 : 4}
              className={`w-full bg-background border-l-2 ${field.special ? "border-accent text-lg" : "border-transparent focus:border-accent"} rounded-none px-4 py-3 text-foreground resize-none focus:outline-none transition-colors`}
            />
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-background border-t border-border py-4 mt-8 flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={() => handleSave(false)} disabled={saving}>
          Save Draft
        </Button>
        <Button variant="accentFill" onClick={() => handleSave(true)} disabled={saving}>
          Publish Afterframe
        </Button>
      </div>
    </div>
  );
};

export default WritePage;
