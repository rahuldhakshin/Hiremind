"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, RefreshCw, User, Bot } from "lucide-react";
import { GlassCard } from "@/components/ui/liquid-glass";
import { aiChatAPI } from "@/lib/api";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { label: "Resume Tips", prompt: "How can I improve my resume to get shortlisted at top MNCs?" },
  { label: "Google Prep", prompt: "How should I prepare for a Google SDE interview in 2 months?" },
  { label: "Skill Gap", prompt: "I know Python and React. What other skills should I learn for better placements?" },
  { label: "Salary Tips", prompt: "How do I negotiate my salary offer during campus placements?" },
];

const DOCK_ICONS = [
  { src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=64&h=64&fit=crop", alt: "AI", label: "AI Coach" },
  { src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop", alt: "Resume", label: "Resume" },
  { src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=64&h=64&fit=crop", alt: "Interview", label: "Interview" },
  { src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=64&h=64&fit=crop", alt: "Career", label: "Career" },
];

// Removed MOCK_AI_RESPONSES

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: `Hello! I'm your **HireMind Career Coach**, powered by Groq AI (LLaMA 3.3).

I'm here to help you with:
- **Resume tips** & ATS optimisation
- **Interview preparation** strategies
- **Skill gap analysis** & learning roadmaps
- **Placement drive** guidance
- **Salary negotiation** advice

What's on your mind today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now(), role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    let aiResponse = "";
    try {
      const history = messages.filter(m => m.id !== 0).map(m => ({ role: m.role, content: m.content }));
      const res = await aiChatAPI.send(msg, history);
      aiResponse = res.data.response || res.data.reply || res.data.message || res.data.answer || "I could not process your request.";
    } catch (err) {
      console.error("AI Chat Error:", err);
      aiResponse = "Oops, something went wrong communicating with the AI. Please try again.";
    }
    let streamed = "";
    const aiMsg: Message = { id: Date.now() + 1, role: "assistant", content: "", timestamp: new Date() };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);

    // Streaming effect
    const chars = aiResponse.split("");
    for (let i = 0; i < chars.length; i++) {
      streamed += chars[i];
      const finalStreamed = streamed;
      setMessages((prev) =>
        prev.map((m) => (m.id === aiMsg.id ? { ...m, content: finalStreamed } : m))
      );
      await new Promise((r) => setTimeout(r, 8));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 0, role: "assistant",
      content: "Chat cleared! How can I help you today?",
      timestamp: new Date(),
    }]);
  };

  // Simple markdown-ish renderer
  const renderContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <p className="label-caps mb-1" style={{ color: "#000000" }}>
            Powered by Groq AI · LLaMA 3.3 70B
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>
            HireMind Career Coach
          </h1>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 text-xs glass-btn px-4 py-2"
          style={{ color: "#888888" }}
        >
          <RefreshCw size={13} /> Clear chat
        </button>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 flex-wrap mb-4 flex-shrink-0">
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            onClick={() => sendMessage(qp.prompt)}
            className="text-xs px-3 py-2 rounded-full transition-all duration-200"
            style={{
              background: "rgba(200,184,154,0.08)",
              border: "1px solid rgba(200,184,154,0.2)",
              color: "#000000",
            }}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <GlassCard
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 min-h-0"
        hover={false}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              style={{
                background: msg.role === "assistant"
                  ? "rgba(200,184,154,0.15)"
                  : "rgba(255,255,255,0.08)",
                border: msg.role === "assistant"
                  ? "1px solid rgba(200,184,154,0.3)"
                  : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {msg.role === "assistant"
                ? <Bot size={14} style={{ color: "#000000" }} />
                : <User size={14} style={{ color: "#666666" }} />
              }
            </div>

            {/* Bubble */}
            <div className={`max-w-[75%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: msg.role === "user"
                    ? "rgba(200,184,154,0.15)"
                    : "rgba(255,255,255,0.05)",
                  border: msg.role === "user"
                    ? "1px solid rgba(200,184,154,0.25)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: "#666666",
                  borderRadius: msg.role === "user"
                    ? "20px 4px 20px 20px"
                    : "4px 20px 20px 20px",
                }}
                dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
              />
              <span className="text-[10px] mt-1 px-1" style={{ color: "#888888" }}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(200,184,154,0.15)", border: "1px solid rgba(200,184,154,0.3)" }}
            >
              <Bot size={14} style={{ color: "#000000" }} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-1"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px 20px 20px 20px" }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: "#000000",
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </GlassCard>

      {/* Input area */}
      <div className="mt-4 flex-shrink-0">
        <GlassCard className="p-3" hover={false}>
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about placements, interviews, resume, career..."
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none outline-none"
              style={{
                color: "#000000",
                maxHeight: "120px",
                lineHeight: 1.6,
              }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
              style={{
                background: input.trim() ? "rgba(200,184,154,0.25)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${input.trim() ? "rgba(200,184,154,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: input.trim() ? "#000000" : "#888888",
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </GlassCard>
        <p className="text-center text-xs mt-2" style={{ color: "#888888" }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
