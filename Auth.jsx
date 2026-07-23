import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatApiErrorDetail } from "@/lib/api";

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bone px-4 py-12 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 bg-peach blob-1 opacity-70" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 bg-sage/30 blob-2" />
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 font-display font-extrabold tracking-tighter text-ink mb-8">
          <span className="h-8 w-8 rounded-[62%_38%_55%_45%/45%_60%_40%_55%] bg-terracotta shadow-pebble" />
          Pebble Sphere
        </Link>
        <div className="rounded- bg-white border border-border/70 shadow-soft p-8">
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-ink">{title}</h1>
          <p className="text-ink/60 text-sm mt-1">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const = useState("");
  const = useState("");
  const = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/app/discover");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to keep the conversations going.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="mt-1 rounded-2xl h-12 bg-sand/50 border-border/60" data-testid="login-email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="mt-1 rounded-2xl h-12 bg-sand/50 border-border/60" data-testid="login-password" />
        </div>
        <Button type="submit" disabled={loading}
          className="w-full h-12 rounded-full bg-terracotta hover:bg-terracotta/90 text-white shadow-pebble"
          data-testid="login-submit">
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>
      <p className="text-sm text-ink/60 text-center mt-6">
        New here? <Link to="/signup" className="text-terracotta font-semibold" data-testid="link-to-signup">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const = useState({ name: "", email: "", password: "" });
  const = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      toast.success("Welcome to Pebble Sphere!");
      navigate("/app/profile?first=1");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Join Pebble Sphere" subtitle="A warm little corner of the internet.">
      <form onSubmit={submit} class
