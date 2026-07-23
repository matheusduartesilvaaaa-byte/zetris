"use client";

import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { askZiaAction } from "@/modules/zia/actions/zia.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "zia";
  text: string;
}

export function ZiaWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "zia", text: "Oi! Sou a ZIA. Pergunte sobre receita, estoque, ticket médio ou clientes." },
  ]);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;

    const userMessage: Message = { role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    const result = await askZiaAction(userMessage.text);
    setMessages((prev) => [...prev, { role: "zia", text: result.answer }]);
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-[0_0_24px_rgba(56,189,248,0.55)] transition-transform hover:scale-105 hover:shadow-[0_0_32px_rgba(56,189,248,0.75)]"
        aria-label="Abrir ZIA"
      >
        <Sparkles size={22} />
      </button>
    );
  }

  return (
    <div className="glass-panel fixed bottom-6 right-6 z-20 flex h-[480px] w-80 flex-col rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between border-b border-white/10 p-3">
        <div className="flex items-center gap-2 font-medium text-white">
          <Sparkles size={16} className="text-sky-300" /> ZIA
        </div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((message, i) => (
          <div
            key={i}
            className={
              message.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-sky-500 px-3 py-2 text-sm text-white"
                : "mr-auto max-w-[85%] rounded-lg bg-white/5 px-3 py-2 text-sm text-white"
            }
          >
            {message.text}
          </div>
        ))}
        {loading && <div className="mr-auto text-xs text-muted-foreground">ZIA está pensando...</div>}
      </div>

      <div className="flex gap-2 border-t border-white/10 p-3">
        <Input
          placeholder="Pergunte algo..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
        />
        <Button size="icon" onClick={handleAsk} disabled={loading}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
