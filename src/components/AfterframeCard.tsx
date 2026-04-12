import { Link } from "react-router-dom";
import { Heart, MessageSquare, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AfterframeCardProps {
  id: string;
  title: string;
  oneLiner: string;
  authorUsername: string;
  authorAvatar?: string | null;
  publishedAt: string;
  likeCount: number;
  commentCount: number;
  isSaved?: boolean;
  onSave?: () => void;
}

const AfterframeCard = ({
  id,
  title,
  oneLiner,
  authorUsername,
  authorAvatar,
  publishedAt,
  likeCount,
  commentCount,
  isSaved,
  onSave,
}: AfterframeCardProps) => {
  return (
    <div className="border border-[#1E1E1E] bg-[#111111] p-6 hover:border-[#2A2A2A] transition-colors">
      <Link to={`/frame/${authorUsername}/${id}`}>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-accent italic text-sm mb-4 line-clamp-2">"{oneLiner}"</p>
      </Link>
      <div className="flex items-center justify-between">
        <Link to={`/${authorUsername}`} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
            {authorAvatar ? (
              <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              authorUsername?.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-sm text-[#999]">{authorUsername}</span>
        </Link>
        <div className="flex items-center gap-4 text-[#999] text-sm">
          <span className="flex items-center gap-1">
            <Heart size={14} /> {likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={14} /> {commentCount}
          </span>
          {onSave && (
            <button onClick={onSave} className="hover:text-accent transition-colors">
              <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
            </button>
          )}
          <span>{formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
};

export default AfterframeCard;
