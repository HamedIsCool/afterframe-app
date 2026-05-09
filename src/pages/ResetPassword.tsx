import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated");
      navigate("/feed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 font-['Space_Grotesk']">
      <div className="w-full max-w-sm bg-[#141414] border border-[#2A2A2A] p-8">
        <h1 className="text-xl font-bold text-[#F5F0E8] mb-2">
          New password
        </h1>
        <p className="text-sm text-[#888] mb-6">
          Choose a new password for your account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#888] block mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2
                         text-sm text-[#F5F0E8] outline-none
                         focus:border-[#C8A96E] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[#888] block mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
