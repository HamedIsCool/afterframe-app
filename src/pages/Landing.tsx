import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const Landing = () => {
  const { user, loading } = useAuth();

  const placeholderFrames = [
    {
      title: "The Day I Got Fired",
      oneLiner: "Losing that job didn't break me — it broke the ceiling I'd been pressing against.",
    },
    {
      title: "When She Left",
      oneLiner: "She didn't leave because I wasn't enough. She left because I was becoming someone who needed to be alone to grow.",
    },
    {
      title: "The Failed Startup",
      oneLiner: "The company died, but the person who built it finally came alive.",
    },
  ];

  if (!loading && user) return <Navigate to="/feed" replace />;

  return (
    <div className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-24 md:py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-6">
          Understood backwards.<br />Shared forwards.
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
          The place where hard experiences finally make sense. Write your Afterframe.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button variant="accentFill" size="lg" asChild>
            <Link to="/signup">Start Writing</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/feed">Read Stories</Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {placeholderFrames.map((frame, i) => (
            <div key={i} className="border border-border bg-card p-6">
              <h3 className="text-foreground font-semibold mb-3">{frame.title}</h3>
              <div className="border-t-2 border-accent pt-3">
                <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">The One-Liner</p>
                <p className="text-accent italic text-sm">"{frame.oneLiner}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
