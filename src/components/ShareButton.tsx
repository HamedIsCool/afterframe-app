import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Share2, Check } from "lucide-react";
import ShareCard from "./ShareCard";

interface ShareButtonProps {
  title: string;
  oneLiner: string;
  authorUsername: string;
  retroactiveWhy: string;
  frameId: string;
}

const ShareButton = ({ 
  title, 
  oneLiner, 
  authorUsername,
  retroactiveWhy,
  frameId
}: ShareButtonProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<
    "idle" | "generating" | "done"
  >("idle");

  const handleDownload = async () => {
    if (!cardRef.current || state === "generating") return;
    setState("generating");

    try {
      const canvas = await html2canvas(cardRef.current, {
        width: 1200,
        height: 630,
        scale: 2,
        useCORS: true,
        backgroundColor: "#0A0A0A",
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `afterframe-${frameId.slice(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      setState("done");
      setTimeout(() => setState("idle"), 2500);
    } catch (err) {
      console.error("Share card error:", err);
      setState("idle");
    }
  };

  const handleNativeShare = async () => {
    if (!cardRef.current || state === "generating") return;
    setState("generating");

    try {
      const canvas = await html2canvas(cardRef.current, {
        width: 1200,
        height: 630,
        scale: 2,
        useCORS: true,
        backgroundColor: "#0A0A0A",
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) { setState("idle"); return; }
        const file = new File([blob], "afterframe.png", { 
          type: "image/png" 
        });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: title,
            text: `"${oneLiner}" — afterfra.me/frame/${authorUsername}/${frameId}`,
            files: [file],
          });
          setState("done");
          setTimeout(() => setState("idle"), 2500);
        } else {
          // Fallback to download if Web Share API not available
          const link = document.createElement("a");
          link.download = `afterframe-${frameId.slice(0, 8)}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          setState("done");
          setTimeout(() => setState("idle"), 2500);
        }
      }, "image/png");
    } catch (err) {
      console.error("Share error:", err);
      setState("idle");
    }
  };

  return (
    <>
      {/* Hidden card rendered off-screen for capture */}
      <ShareCard
        ref={cardRef}
        title={title}
        oneLiner={oneLiner}
        authorUsername={authorUsername}
        retroactiveWhy={retroactiveWhy}
      />

      {/* Share UI — two buttons side by side */}
      <div className="flex items-center gap-2">

        {/* Download card */}
        <button
          onClick={handleDownload}
          disabled={state === "generating"}
          className="flex items-center gap-2 px-4 py-2 
                     border border-[#2A2A2A] text-[#888] 
                     hover:border-[#C8A96E] hover:text-[#C8A96E] 
                     transition-colors text-xs uppercase 
                     tracking-widest font-medium
                     disabled:opacity-40 disabled:cursor-wait"
        >
          {state === "done" 
            ? <Check size={13} /> 
            : <Download size={13} />}
          {state === "generating" 
            ? "Generating..." 
            : state === "done" 
            ? "Saved" 
            : "Save Card"}
        </button>

        {/* Share (native share API or copy link) */}
        <button
          onClick={handleNativeShare}
          disabled={state === "generating"}
          className="flex items-center gap-2 px-4 py-2 
                     border border-[#2A2A2A] text-[#888] 
                     hover:border-[#C8A96E] hover:text-[#C8A96E] 
                     transition-colors text-xs uppercase 
                     tracking-widest font-medium
                     disabled:opacity-40 disabled:cursor-wait"
        >
          <Share2 size={13} />
          Share
        </button>
      </div>
    </>
  );
};

export default ShareButton;
