import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AfterframeCard from "@/components/AfterframeCard";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [frames, setFrames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const isOwner = user?.id === profile?.id;

  useEffect(() => {
    const fetch = async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("username", username).single();
      if (!p) { setLoading(false); return; }
      setProfile(p);

      const { data: f } = await supabase
        .from("afterframes")
        .select("id, title, the_one_liner, published_at")
        .eq("author_id", p.id)
        .eq("is_published", true)
        .eq("is_anonymous", false)
        .order("published_at", { ascending: false });

      // Get counts
      const ids = (f || []).map((x: any) => x.id);
      const [likesRes, commentsRes] = await Promise.all([
        supabase.from("likes").select("afterframe_id").in("afterframe_id", ids),
        supabase.from("comments").select("afterframe_id").in("afterframe_id", ids),
      ]);
      const lc: Record<string, number> = {};
      const cc: Record<string, number> = {};
      (likesRes.data || []).forEach((l: any) => { lc[l.afterframe_id] = (lc[l.afterframe_id] || 0) + 1; });
      (commentsRes.data || []).forEach((c: any) => { cc[c.afterframe_id] = (cc[c.afterframe_id] || 0) + 1; });

      setFrames((f || []).map((x: any) => ({ ...x, like_count: lc[x.id] || 0, comment_count: cc[x.id] || 0 })));
      setLoading(false);
    };
    fetch();
  }, [username]);

  useEffect(() => {
    if (searchParams.get("edit") === "true" && profile) {
      setEditName(profile.full_name || "");
      setEditBio(profile.bio || "");
      setEditAvatar(profile.avatar_url || "");
      setEditOpen(true);
      setSearchParams({});
    }
  }, [searchParams, profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    await supabase.from("profiles").update({
      full_name: editName,
      bio: editBio,
      avatar_url: editAvatar,
    }).eq("id", user!.id);
    setProfile((p: any) => ({ 
      ...p, 
      full_name: editName, 
      bio: editBio, 
      avatar_url: editAvatar 
    }));
    setSaving(false);
    setEditOpen(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!loading && !profile) {
    return (
      <div className="w-full py-20 text-center">
        <div className="w-8 h-8 border-t-2 border-l-2 border-[#C8A96E] mb-6 mx-auto" />
        <p className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-bold mb-3">
          Profile not found
        </p>
        <p className="text-sm text-[#888]">
          No one here by that name.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-0 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-xl text-muted-foreground overflow-hidden">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            profile.username?.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-foreground">{profile.full_name || profile.username}</h1>
            {isOwner && (
              <button
                onClick={() => { 
                  setEditName(profile.full_name || ""); 
                  setEditBio(profile.bio || ""); 
                  setEditAvatar(profile.avatar_url || ""); 
                  setEditOpen(true); 
                }}
                className="text-xs text-[#999] border border-[#2A2A2A] px-3 py-1 hover:border-[#C8A96E] hover:text-[#C8A96E] transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-foreground mt-1">{profile.bio}</p>}
        </div>
      </div>

      <div className="space-y-4">
        {frames.map((f: any) => (
          <AfterframeCard
            key={f.id}
            id={f.id}
            title={f.title}
            oneLiner={f.the_one_liner}
            authorUsername={profile.username}
            authorAvatar={profile.avatar_url}
            publishedAt={f.published_at}
            likeCount={f.like_count}
            commentCount={f.comment_count}
          />
        ))}
        {frames.length === 0 && (
          <div className="mt-12 flex flex-col items-center text-center">
            <div className="w-8 h-8 border-t-2 border-l-2 border-[#C8A96E] mb-6" />
            <p className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-bold mb-3">
              {isOwner ? "Your archive is empty" : "No frames yet"}
            </p>
            <p className="text-sm text-[#888] leading-relaxed max-w-xs mb-6">
              {isOwner
                ? "You haven't published a frame yet. Every archive starts with one story."
                : `${profile.username} hasn't published a frame yet.`}
            </p>
            {isOwner && (
              <a
                href="/write"
                className="text-sm font-bold uppercase tracking-widest px-5 py-2.5
                           bg-[#C8A96E] text-[#0A0A0A] hover:bg-[#B89558] transition-colors"
              >
                Frame It
              </a>
            )}
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#141414] border border-[#2A2A2A] text-[#F5F0E8] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#F5F0E8] font-semibold">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Avatar upload */}
            <div>
              <label className="text-xs uppercase tracking-widest text-[#999] block mb-2">
                Picture
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] overflow-hidden flex items-center justify-center text-[#999] text-xl shrink-0">
                  {editAvatar ? (
                    <img src={editAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{editName?.charAt(0)?.toUpperCase() || "?"}</span>
                  )}
                </div>
                <label className="cursor-pointer text-sm text-[#C8A96E] border border-[#C8A96E]/40 px-4 py-2 hover:bg-[#C8A96E]/10 transition-colors">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !user) return;
                      const ext = file.name.split(".").pop();
                      const path = `${user.id}/avatar.${ext}`;
                      const { error } = await supabase.storage
                        .from("avatars")
                        .upload(path, file, { upsert: true });
                      if (error) return;
                      const { data } = supabase.storage
                        .from("avatars")
                        .getPublicUrl(path);
                      setEditAvatar(data.publicUrl);
                    }}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#888] block mb-1">
                Display Name
              </label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2 text-sm text-[#F5F0E8] outline-none focus:border-[#C8A96E] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#888] block mb-1">
                Bio
              </label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2 text-sm text-[#F5F0E8] outline-none focus:border-[#C8A96E] transition-colors resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditOpen(false)}
                className="text-sm text-[#999] px-4 py-2 border border-[#2A2A2A] hover:border-[#F5F0E8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="text-sm bg-[#C8A96E] text-[#0A0A0A] font-semibold px-4 py-2 hover:bg-[#B89558] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
