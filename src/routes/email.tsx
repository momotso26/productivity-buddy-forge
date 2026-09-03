import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Loader2, Copy, Sparkles, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  generateEmail,
  delay,
  latency,
  type EmailLength,
  type EmailTone,
} from "@/lib/simulated-ai";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace AI" },
      {
        name: "description",
        content:
          "Draft polished work emails in seconds. Choose tone and length, list your key points, and get a ready-to-send draft.",
      },
      { property: "og:title", content: "Smart Email Generator — Workplace AI" },
      {
        property: "og:description",
        content: "Turn a few bullet points into a polished, on-tone work email.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [recipient, setRecipient] = useState("Priya");
  const [subject, setSubject] = useState("Q3 launch timeline");
  const [keyPoints, setKeyPoints] = useState(
    "design handoff is complete\nengineering needs two extra days for QA\nproposing we move launch to the 18th",
  );
  const [tone, setTone] = useState<EmailTone>("professional");
  const [length, setLength] = useState<EmailLength>("medium");
  const [sender, setSender] = useState("Kgomotso");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof generateEmail> | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    if (!subject.trim() && !keyPoints.trim()) {
      toast.error("Add a subject or a few key points first.");
      return;
    }
    setLoading(true);
    setResult(null);
    await delay(latency());
    setResult(generateEmail({ recipient, subject, keyPoints, tone, length, sender }));
    setLoading(false);
    toast.success("Draft ready", { description: "Review the tone before sending." });
  }

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Smart Email"
        title="Smart Email Generator"
        description="Give it the recipient, the points you need to land, and the tone. It writes the email you were going to spend twenty minutes on."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Priya"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender">Sign off as</Label>
                <Input id="sender" value={sender} onChange={(e) => setSender(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">What is it about?</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Key points (one per line)</Label>
              <Textarea
                id="points"
                rows={6}
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                className="resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as EmailTone)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["professional", "friendly", "concise", "persuasive", "apologetic"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Length</Label>
                <Select value={length} onValueChange={(v) => setLength(v as EmailLength)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["short", "medium", "detailed"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={run} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Writing draft…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Draft</CardTitle>
            {result && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{result.confidence}% match to brief</Badge>
                <Button variant="ghost" size="sm" onClick={run}>
                  <RefreshCw className="size-4" /> Rewrite
                </Button>
                <Button variant="outline" size="sm" onClick={copy}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />} Copy
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="load" exit={{ opacity: 0 }} className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-4" style={{ width: `${95 - i * 6}%` }} />
                  ))}
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="rounded-lg border border-border bg-surface px-4 py-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Subject</p>
                    <p className="mt-1 font-medium">{result.subject}</p>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {result.body}
                  </pre>
                </motion.div>
              ) : (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  Your generated draft will appear here.
                </motion.p>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
