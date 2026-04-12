import { forwardRef } from "react";

interface ShareCardProps {
  title: string;
  oneLiner: string;
  authorUsername: string;
  retroactiveWhy: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ title, oneLiner, authorUsername, retroactiveWhy }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "1200px",
          height: "630px",
          background: "#0A0A0A",
          fontFamily: "'Space Grotesk', sans-serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          boxSizing: "border-box",
          border: "1px solid #2A2A2A",
        }}
      >
        {/* Top: brand */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ 
            fontSize: "14px", 
            color: "#555", 
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 600
          }}>
            Afterframe
          </span>
          <span style={{ 
            fontSize: "13px", 
            color: "#333",
            letterSpacing: "0.08em"
          }}>
            afterfra.me
          </span>
        </div>

        {/* Middle: title + retroactive why */}
        <div style={{ flex: 1, display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "center",
                      padding: "40px 0" }}>
          <p style={{
            fontSize: "13px",
            color: "#555",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: "20px"
          }}>
            {authorUsername}
          </p>
          <h2 style={{
            fontSize: "38px",
            fontWeight: 700,
            color: "#F5F0E8",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            marginBottom: "28px",
            maxWidth: "900px"
          }}>
            {title}
          </h2>
          {retroactiveWhy && (
            <p style={{
              fontSize: "18px",
              color: "#888",
              lineHeight: 1.6,
              maxWidth: "800px",
              fontWeight: 400
            }}>
              {retroactiveWhy.length > 160 
                ? retroactiveWhy.slice(0, 160) + "…" 
                : retroactiveWhy}
            </p>
          )}
        </div>

        {/* Bottom: One-Liner */}
        <div style={{
          borderTop: "1px solid #1E1E1E",
          paddingTop: "28px",
          display: "flex",
          alignItems: "flex-start",
          gap: "20px"
        }}>
          <span style={{
            fontSize: "11px",
            color: "#C8A96E",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginTop: "3px",
            whiteSpace: "nowrap"
          }}>
            One-Liner
          </span>
          <p style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#C8A96E",
            fontStyle: "italic",
            lineHeight: 1.4,
            letterSpacing: "-0.01em"
          }}>
            "{oneLiner}"
          </p>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";
export default ShareCard;
