"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import { getMessages, sendMessage, MessageResponse } from "@/lib/api";
import Cookies from "js-cookie";

function ChatContent() {
  const params = useParams<{ matchId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentUserId = (() => {
    const raw = Cookies.get("user");
    return raw ? JSON.parse(raw).id : null;
  })();

  const load = async () => {
    const data = await getMessages(params.matchId);
    setMessages(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
    // Simple polling for near-real-time updates. Swap for SignalR/WebSockets for true real-time.
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [params.matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const msg = await sendMessage(params.matchId, text.trim());
      setMessages((prev) => [...prev, msg]);
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <button onClick={() => router.push("/matches")} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold">Conversation</h1>
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                    mine ? "bg-brand-500 text-white" : "bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </main>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 bg-white p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  return (
    <RequireAuth>
      <ChatContent />
    </RequireAuth>
  );
}
