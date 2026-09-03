import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { chatReply, delay, latency } from "@/lib/simulated-ai";

type Message = { id: string; role: "user" | "assistant"; text: string };

const GREETING: Message = {
  id: "seed",
  role: "assistant",
  text: "Hi Kgomotso — I'm your workplace assistant. Ask me to draft something, unpack a decision, or plan your week.",
};

const PROMPTS = [
  "Help me plan my week",
  "Draft a follow-up to a client",
  "Summarise my standup notes",
  "How do I say no to a meeting?",
];

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Assistant Chat — Workplace AI" },
      {
        name: "description",
        content:
          "Chat with your workplace assistant about drafting, planning, summarising and decision-making.",
      },
      { property: "og:title", content: "Assistant Chat — Workplace AI" },
      {
        property: "og:description",
        content: "A conversational assistant for everyday work questions.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  async function send(text = input) {
    if (!text.trim() || typing) return;
    const userMsg: Message = { id: `${Date.now()}`, role: "user", text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    await delay(latency(700, 1500));
    setMessages((m) => [
      ...m,
      { id: `${Date.now()}-a`, role: "assistant", text: chatReply(text, m.length) },
    ]);
    setTyping(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Chatbot"
        title="Assistant Chat"
        description="A general-purpose conversation for everything that doesn't fit a form — decisions, phrasing, prioritising, thinking out loud."
        action={
          <Button
            variant="outline"
            onClick={() => {
              setMessages([GREETING]);
              toast.success("Conversation cleared");
            }}
          >
            <RotateCcw className="size-4" /> New chat
          </Button>
        }
      />

      <Card className="flex h-[62vh] min-h-[430px] flex-col overflow-hidden shadow-soft">
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-5">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[76%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-surface text-surface-foreground"
                  }`}
                >
                  {m.text}
                </div>
                {m.role === "user" && (
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-secondary text-xs font-semibold">KM</AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 rounded-2xl border border-border bg-surface px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="size-1.5 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </CardContent>

        <div className="space-y-3 border-t border-border bg-card p-4">
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything about your work…"
              className="h-11"
            />
            <Button onClick={() => send()} disabled={typing || !input.trim()} className="h-11 px-5">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
