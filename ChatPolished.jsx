import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

export default function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const = useState([]);
  const = useState("");
  const = useState(null);
  const = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, );

  const loadMessages = async () => {
    try {
      const { data } = await api.get(`/matches/${matchId}/messages`);
      setMessages(data);
      if (data.length) setOtherId(data.find(m => m.sender_id !== user.id)?.sender_id || null);
    } catch (e) {
      toast.error("Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, );

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.post("/messages", { match_id: matchId, text: newMessage.trim() });
      setNewMessage("");
      loadMessages();
    } catch (e) {
      toast.error("Failed to send");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bone">Loading chat...</div>;

  return (
    <div className="min-h-screen bg-bone flex flex-col pb-20">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border/60 bg-white">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <div className="font-display font-bold text-xl">Chat</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender_id === user.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${m.sender_id === user.id ? "bg-terracotta text-white" : "bg-white border border-border/60"}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-border/60 p-4 flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-sand/50 border border-border/60 rounded-full px-5 py-3 text-sm focus:outline-none"
        />
        <Button onClick={sendMessage} className="rounded-full h-12 w-12 bg-terracotta text-white p-0"><Send className="h-5 w-5" /></Button>
      </div>
    </div>
  );
}
