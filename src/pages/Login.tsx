import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      // Map raw Supabase errors to friendly messages
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid login credentials")) {
        toast.error("Wrong email or password.");
      } else if (msg.includes("email not confirmed")) {
        toast.error("Please confirm your email first. Check your inbox.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    navigate("/feed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 font-['Space_Grotesk']">
      <div className="w-full max-w-sm bg-[#141414] border border-[#2A2A2A] p-8">
        <h1 className="text-2xl font-bold text-[#F5F0E8] mb-6">Log In</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-[#888] block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2 text-[#F5F0E8] text-sm outline-none focus:border-[#C8A96E] transition-colors"
            />
          </div>
          <div>
            <label className="text-sm text-[#888] block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2 text-[#F5F0E8] text-sm outline-none focus:border-[#C8A96E] transition-colors"
            />
          </div>
          <div className="flex justify-end -mt-1">
            <Link
              to="/forgot-password"
              className="text-xs text-[#555] hover:text-[#C8A96E] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" variant="accentFill" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>
        <p className="text-sm text-[#888] mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#C8A96E] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
