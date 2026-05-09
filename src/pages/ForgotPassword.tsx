import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 font-['Space_Grotesk']">
      <div className="w-full max-w-sm bg-[#141414] border border-[#2A2A2A] p-8">

        {sent ? (
          <div className="text-center">
            <div className="w-8 h-8 border-t-2 border-l-2 border-[#C8A96E] mb-6 mx-auto" />
            <p className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-bold mb-3">
              Check your inbox
            </p>
            <p className="text-sm text-[#888] leading-relaxed mb-6">
              We sent a password reset link to <span className="text-[#F5F0E8]">{email}</span>.
              Check your spam folder if it doesn't arrive.
            </p>
            <Link
              to="/login"
              className="text-xs text-[#555] hover:text-[#C8A96E] transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#F5F0E8] mb-2">
              Reset password
            </h1>
            <p className="text-sm text-[#888] mb-6">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#888] block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2
                             text-sm text-[#F5F0E8] outline-none
                             focus:border-[#C8A96E] transition-colors"
                />
              </div>
              <Button
                type="submit"
                variant="accentFill"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
            <p className="text-xs text-[#555] mt-4 text-center">
              <Link to="/login" className="hover:text-[#C8A96E] transition-colors">
                ← Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
