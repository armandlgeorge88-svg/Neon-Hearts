import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import { Login, Signup } from "./pages/Auth";
import Discover from "./pages/DiscoverPolished";
import Matches from "./pages/MatchesPolished";
import Chat from "./pages/ChatPolished";
import Profile from "./pages/ProfilePolished";

function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="min-h-screen flex items-center justify-center bg-bone">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/app/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
      <Route path="/app/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
      <Route path="/app/chat/:matchId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
