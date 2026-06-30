import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { toast } from "sonner";
import { frameUrl } from "@/lib/frameUrl";

interface ShareButtonProps {
  title: string;
  oneLiner: string;
  authorUsername: string;
  frameId: string;
  isAnonymous?: boolean;
}

const ShareButton = ({
  title,
  oneLiner,
  authorUsername,
  frameId,
  isAnonymous,
}: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://afterfra.me${frameUrl({ id: frameId, is_anonymous: isAnonymous, authorUsername })}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers without clipboard API (or non-HTTPS)
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        const ok = document.execCommand("copy");
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } else {
          toast.error("Couldn't copy. Long-press to copy the link.");
        }
      } catch {
        toast.error("Couldn't copy. Long-press to copy the link.");
      }
      document.body.removeChild(ta);
    }
  };

return (
    <div className="flex flex-wrap items-center gap-2">

      {/* Copy link */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2
                   border border-[#2A2A2A] text-[#888]
                   hover:border-[#C8A96E] hover:text-[#C8A96E]
                   transition-colors text-xs uppercase
                   tracking-widest font-medium"
      >
        {copied ? <Check size={13} /> : <Link2 size={13} />}
        {copied ? "Copied" : "Copy Link"}
      </button>


</div>
  );
};

export default ShareButton;
