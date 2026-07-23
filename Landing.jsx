import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck, MessageCircle, Sparkles } from "lucide-react";

const HERO = "https://images.unsplash.com/photo-1656017054238-f08a0e1482fe?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwzfHxqb3lmdWwlMjBjb3VwbGUlMjBsYXVnaGluZ3xlbnwwfHx8fDE3ODQ0OTMxMjR8MA&ixlib=rb-4.1.0&q=85";
const FEAT = "https://images.unsplash.com/photo-1571771826307-98d0d0999028?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwyfHxqb3lmdWwlMjBjb3VwbGUlMjBsYXVnaGluZ3xlbnwwfHx8fDE3ODQ0OTMxMjR8MA&ixlib=rb-4.1.0&q=85";

const Pebble = () => (
  <span className="inline-flex items-center gap-2 font-display font-extrabold tracking-tighter">
    <span className="h-8 w-8 rounded-[62%_38%_55%_45%/45%_60%_40%_55%] bg-terracotta shadow-pebble" />
    Pebble&nbsp;Sphere
  </span>
);

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-bone overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 bg-peach blob-1 opacity-70" />
      <div className="pointer-events-none absolute top-1/2 -left-20 h-64 w-64 bg-sage/30 blob-2" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-40 w-40 bg-terracotta/15 blob-3" />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-6">
        <Pebble />
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" className="rounded-full" data-testid="nav-login-btn">Log in</Button></Link>
          <Link to="/signup"><Button className="rounded-full bg-terracotta hover:bg-terracotta/90 text-white shadow-pebble" data-testid="nav-signup-btn">Join</Button></Link>
        </div>
      </header>

      <main className="relative z-10 px-6 sm:px-12 pt-8 pb-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-sage/10 border border-sage/30 px-3 py-1 text-sm text-sage font-medium mb-6">
            <ShieldCheck className="h-4 w-4" /> A safer space, built by us — for us
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tighter text-ink">
            Big hearts.<br />
            <span className="text-terracotta">Little&nbsp;people.</span><br />
            Real&nbsp;connections.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-ink/70 font-body max-w-lg leading-relaxed">
            Pebble Sphere is a warm, community-first dating app made for people with dwarfism. Meet folks who get it — the joy, the humour, the everyday.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup">
              <Button size="lg" className="rounded-full h-12 px-8 bg-terracotta hover:bg-terracotta/90 text-white shadow-pebble hover:-translate-y-0.5 transition-transform" data-testid="hero-cta-signup">
                Join Pebble Sphere
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="rounded-full h-12 px-8 bg-sand text-ink hover:bg-sand/70" data-testid="hero-cta-login">
                I already have an account
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-ink/60">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sage" /> Verified profiles</div>
            <div className="flex items-center gap-2"><Heart className="h-4 w-4 text-terracotta" /> No shame, ever</div>
          </div>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="relative aspect-[4/5] overflow-hidden blob-1 shadow-[0_30px_80px_-20px_rgba(224,122,95,0.35)]">
            <img src={HERO} alt="Joyful couple" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden sm:block w-40 aspect-square overflow-hidden blob-2 border-4 border-bone shadow-soft">
            <img src={FEAT} alt="Smiling couple" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -top-4 -right-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-border/60 px-4 py-3 shadow-soft flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-terracotta/15 flex items-center justify-center">
              <Heart className="h-4 w-4 text-terracotta" />
            </div>
            <div>
              <div className="text-xs text-ink/60">New match</div>
              <div className="text-sm font-semibold">You & Ava</div>
            </div>
          </div>
        </div>
      </main>

      <section className="relative z-10 px-6 sm:px-12 pb-24 max-w-6xl mx-auto">
        <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-ink mb-10">Built with care.</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: "Community first", body: "Verified profiles, easy reporting, and moderators who actually listen." },
            { icon: Heart, title: "For us, by us", body: "Filters and preferences designed around little people, not tacked on." },
            { icon: MessageCircle, title: "Real conversations", body: "Match, chat, and meet at your pace — never pushed, never rushed." },
          ].map((f, i) => (
            <div key={i} className="rounded-3xl bg-white border border-border/70 p-6 shadow-soft hover:-translate-y-1 transition-transform duration-300">
              <div className="h-11 w-11 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="font-display font-semibold text-lg text-ink">{f.title}</div>
              <p className="text-sm text-ink/60 mt-2 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/60 px-6 sm:px-12 py-8 text-sm text-ink/50 flex items-center justify-between">
        <Pebble />
        <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Made with warmth</div>
      </footer>
    </div>
  );
}
