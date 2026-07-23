import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api, { photoUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const = useState(false);
  const = useState({ name: user?.name || "", age: user?.age || "", height_cm: user?.height_cm || "", bio: user?.bio || "", city: user?.city || "" });

  const saveProfile = async () => {
    try {
      const { data } = await api.put("/profile/me", form);
      setUser(data);
      setEditing(false);
      toast.success("Profile updated");
    } catch (e) {
      toast.error("Failed to save");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-bone">Loading...</div>;

  return (
    <div className="min-h-screen bg-bone pb-20">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/60 bg-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <div className="font-display font-bold text-xl">Profile</div>
        <button onClick={() => setEditing(!editing)}><Edit2 className="h-5 w-5 text-terracotta" /></button>
      </div>

      <div className="px-4 pt-6">
        <div className="flex justify-center mb-6">
          <div className="h-28 w-28 rounded-full overflow-hidden bg-sand border-4 border-white shadow-soft">
            {user.photos?.[0 0])} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-ink/40">{user.name?.[0] || "?"}</div>
            )}
          </div>
        </div>

        {!editing ? (
          <div className="text-center">
            <div className="font-display text-3xl font-bold">{user.name}, {user.age}</div>
            <div className="text-ink/60 mt-1">{user.city || "Nearby"} • {user.height_cm ? `${user.height_cm} cm` : ""}</div>
            {user.bio && <p className="mt-4 text-sm text-ink/80 max-w-md mx-auto">{user.bio}</p>}
          </div>
        ) : (
          <div className="space-y-4 max-w-md mx-auto">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Name" className="w-full bg-white border border-border/60 rounded-2xl px-4 py-3" />
            <div className="grid grid-cols-2 gap-4">
              <input value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="Age" className="bg-white border border-border/60 rounded-2xl px-4 py-3" />
              <input value={form.height_cm} onChange={e => setForm({...form, height_cm: e.target.value})} placeholder="Height cm" className="bg-white border border-border/60 rounded-2xl px-4 py-3" />
            </div>
            <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City" className="w-full bg-white border border-border/60 rounded-2xl px-4 py-3" />
            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Bio" className="w-full bg-white border border-border/60 rounded-2xl px-4 py-3 h-24" />
            <Button onClick={saveProfile} className="w-full rounded-full bg-terracotta text-white h-12">Save Changes</Button>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button onClick={handleLogout} variant="outline" className="rounded-full border-2 border-ink/70 text-ink flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
