import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api, { photoUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Heart, X, ArrowLeft } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { toast } from "sonner";

export default function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const = useState([]);
  const = useState(0);
  const = useState(true);
  const = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25 0, 150], [0, 1 -150, 0], [1, 0]);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data } = await api.get("/discover?limit=20");
      setProfiles(data);
    } catch (e) {
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  const current = profiles ;

  const handleSwipe = async (action) => {
    if (!current || swiping) return;
    setSwiping(true);
    try {
      const { data } = await api.post("/swipe", {
        target_id: current.id,
        action,
      });
      if (data.matched) {
        toast.success("It's a match! 🎉");
        setTimeout(() => navigate("/app/matches"), 800);
      }
    } catch (e) {
      toast.error("Swipe failed");
    }
    setCurrentIndex((i) => i + 1);
    setSwiping(false);
    x.set(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bone">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-ink/60">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bone px-6 text-center">
        <Heart className="h-16 w-16 text-terracotta mb-6" />
        <h2 className="font-display text-3xl font-bold text-ink">No more profiles</h2>
        <p className="text-ink/60 mt-2">You've seen everyone nearby. Check back later!</p>
        <Button onClick={() => navigate("/app/matches")} className="mt-8 rounded-full bg-terracotta text-white">Go to Matches</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone pb-20">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/60">
        <button onClick={() => navigate(-1)} className="p-2"><ArrowLeft className="h-5 w-5" /></button>
        <div className="font-display font-bold text-xl">Discover</div>
        <div className="w-8" />
      </div>

      <div className="px-4 pt-6 flex justify-center">
        <div className="relative w-full max-w- aspect-[3/3.6]">
          <motion.div
            className="absolute inset-0 bg-white rounded-3xl shadow-pebble overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: -300, right: 300 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 120) handleSwipe("like");
              else if (info.offset.x < -120) handleSwipe("pass");
              else x.set(0);
            }}
          >
            {current.photos?.[0 0])} alt={current.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-sand flex items-center justify-center text-6xl font-display text-ink/30">
                {current.name?.[0] || "?"}
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <div className="flex items-end justify-between">
                <div>
                  <div className="font-display text-3xl font-bold">{current.name}, {current.age}</div>
                  <div className="text-sm opacity-80">{current.city || "Nearby"}</div>
                </div>
                {current.height_cm && <div className="text-right text-sm opacity-80">{current.height_cm} cm</div>}
              </div>
              {current.bio && <p className="mt-3 text-sm opacity-90 line-clamp-3">{current.bio}</p>}
            </div>

            <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 right-8 bg-white/90 text-terracotta px-4 py-1 rounded-full font-bold text-lg border-2 border-terracotta">LIKE</motion.div>
            <motion.div style={{ opacity: passOpacity }} className="absolute top-8 left-8 bg-white/90 text-ink px-4 py-1 rounded-full font-bold text-lg border-2 border-ink">PASS</motion.div>
          </motion.div>
        </div>
      </div>

      <div className="fixed bottom-6 inset-x-0 flex justify-center gap-8">
        <Button onClick={() => handleSwipe("pass")} disabled={swiping} variant="outline" className="h-16 w-16 rounded-full border-2 border-ink/70 text-ink hover:bg-sand">
          <X className="h-8 w-8" />
        </Button>
        <Button onClick={() => handleSwipe("like")} disabled={swiping} className="h-16 w-16 rounded-full bg-terracotta hover:bg-terracotta/90 text-white">
          <Heart className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
