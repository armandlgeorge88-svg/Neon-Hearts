import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api, { photoUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const = useState([]);
  const = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { data } = await api.get("/matches");
      setMatches(data);
    } catch (e) {
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-bone">Loading matches...</div>;
  }

  return (
    <div className="min-h-screen bg-bone pb-20">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border/60">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <div className="font-display font-bold text-xl">Matches</div>
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h- text-center px-6">
          <MessageCircle className="h-16 w-16 text-terracotta mb-4" />
          <h2 className="font-display text-2xl font-bold">No matches yet</h2>
          <p className="text-ink/60 mt-2">Keep swiping — your person is out there.</p>
          <Button onClick={() => navigate("/app/discover")} className="mt-6 rounded-full bg-terracotta text-white">Go to Discover</Button>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-3">
          {matches.map((m) => (
            <div key={m.id} onClick={() => navigate(`/app/chat/${m.id}`)} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-soft active:bg-sand cursor-pointer">
              <div className="h-14 w-14 rounded-full overflow-hidden bg-sand flex-shrink-0">
                {m.other?.photos?.[0 0])} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xl font-bold text-ink/40">{m.other?.name?.[0] || "?"}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg">{m.other?.name}</div>
                <div className="text-sm text-ink/60 truncate">{m.last_message_at ? "Tap to chat" : "Say hi!"}</div>
              </div>
              <MessageCircle className="h-5 w-5 text-terracotta flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
