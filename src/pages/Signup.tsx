import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RESERVED = [
  "feed", "wall", "theory", "dashboard", "login", "signup", "write",
  "edit", "saved", "notifications", "frame", "forgot-password",
  "reset-password", "admin", "api", "about", "settings", "profile",
];

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo || "/feed";

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(cleaned);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!USERNAME_RE.test(username)) {
      toast.error("Username must be 3-20 characters: lowercase letters, numbers, or underscores.");
      return;
    }
    if (RESERVED.includes(username)) {
      toast.error("That username is reserved. Please choose another.");
      return;
    }

    setLoading(true);

    // Pre-check username availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      toast.error("That username is already taken.");
      setLoading(false);
      return;
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Supabase does NOT error on duplicate emails. Instead it returns a
    // user with an empty identities array. Detect that and warn the user.
    const identities = signUpData.user?.identities;
    if (identities && identities.length === 0) {
      toast.error("An account with this email already exists. Try logging in.");
      setLoading(false);
      return;
    }

    // Only update profile if a session exists now (no email confirmation).
    // Otherwise the DB trigger handles username from signup metadata.
    if (signUpData.session?.user) {
      await supabase
        .from("profiles")
        .update({ username, full_name: fullName })
        .eq("id", signUpData.session.user.id);
    }

    setLoading(false);

    if (signUpData.session) {
      toast.success("Account created!");
      navigate(returnTo);
    } else {
      toast.success("Check your email to confirm your account.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 font-['Space_Grotesk']">
      <div className="w-full max-w-sm bg-[#141414] border border-[#2A2A2A] p-8">
        <h1 className="text-2xl font-bold text-[#F5F0E8] mb-6">Sign Up</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="signup-username" className="text-sm text-[#888] block mb-1">Username</label>
            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              required
              placeholder="lowercase_only"
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2 text-[#F5F0E8] text-sm outline-none focus:border-[#C8A96E] transition-colors placeholder:text-[#444]"
            />
            <p className="text-xs text-[#555] mt-1">
              3-20 characters. Letters, numbers, underscores.
            </p>
          </div>
          <div>
            <label htmlFor="signup-fullname" className="text-sm text-[#888] block mb-1">Full Name</label>
            <input
              id="signup-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2 text-[#F5F0E8] text-sm outline-none focus:border-[#C8A96E] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="text-sm text-[#888] block mb-1">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2 text-[#F5F0E8] text-sm outline-none focus:border-[#C8A96E] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="text-sm text-[#888] block mb-1">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2 text-[#F5F0E8] text-sm outline-none focus:border-[#C8A96E] transition-colors"
            />
          </div>
          <Button type="submit" variant="accentFill" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        <p className="text-sm text-[#888] mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[#C8A96E] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
