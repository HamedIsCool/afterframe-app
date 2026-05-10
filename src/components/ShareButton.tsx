import { useState } from "react";
import { Link2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  oneLiner: string;
  authorUsername: string;
  frameId: string;
}

const ShareButton = ({
  title,
  oneLiner,
  authorUsername,
  frameId,
}: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const frameUrl = `https://afterfra.me/frame/${authorUsername}/${frameId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(frameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
