import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Loader2, Wand2, Clock, AlertTriangle, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { summarizeMeeting, delay, latency } from "@/lib/simulated-ai";

const SAMPLE = `We opened by reviewing the sprint board. Design handoff is complete and the new onboarding flow is in staging.
Engineering flagged a risk: the analytics dependency is still unversioned, which could delay QA.
We agreed to ship the onboarding flow behind a flag on Thursday.
Marketing needs final copy by Wednesday so the announcement can be scheduled.
Priya will prepare the QA checklist and review it with Sam.
There was a concern about support load in the first week, so we should draft a short FAQ.
We decided to hold the pricing page change until next sprint.`;

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Workplace AI" },
      {
        name: "description",
        content:
          "Paste messy meeting notes and get a clean summary with decisions, action items, owners and risks.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Workplace AI" },
      {
        property: "og:description",
        content: "Messy notes in, structured decisions and owners out.",
      },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [notes, setNotes] = useState(SAMPLE);
  const [attendees, setAttendees] = useState("Priya, Sam, Kgomotso, Dana");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof summarizeMeeting> | null>(null);

  async function run() {
    if (notes.trim().length < 20) {
      toast.error("Add a bit more detail to summarise.");
      return;
    }
    setLoading(true);
    setResult(null);
    await delay(latency(1100, 2200));
    const r = summarizeMeeting(notes, attendees);
    setResult(r);
    setLoading(false);
    toast.success("Summary complete", {
      description: `${r.actions.length} action items extracted · ~${r.minutesSaved} min saved`,
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Meeting Notes"
        title="Meeting Notes Summarizer"
        description="Drop in whatever you typed during the call. You get a summary, the decisions that were actually made, action items with owners, and the risks nobody wrote down."
        action={
          <Button variant="outline" onClick={() => setNotes(SAMPLE)}>
            Load sample notes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Raw notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attendees">Attendees</Label>
              <Input
                id="attendees"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="Comma separated"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes transcript</Label>
              <Textarea
                id="notes"
                rows={14}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none font-mono text-xs leading-relaxed"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {notes.trim().split(/\s+/).filter(Boolean).length} words
            </p>
            <Button onClick={run} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Analysing notes…
                </>
              ) : (
                <>
                  <Wand2 className="size-4" /> Summarize meeting
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Structured output</CardTitle>
            {result && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Clock className="size-3" /> ~{result.minutesSaved} min saved
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      `Summary\n${result.summary}\n\nDecisions\n${result.decisions.join("\n")}\n\nActions\n${result.actions
                        .map((a) => `- ${a.task} (${a.owner}, ${a.due})`)
                        .join("\n")}`,
                    );
                    toast.success("Summary copied");
                  }}
                >
                  <Copy className="size-4" /> Copy
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="l" exit={{ opacity: 0 }} className="space-y-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-24" />
                </motion.div>
              ) : result ? (
                <motion.div key="r" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Tabs defaultValue="summary">
                    <TabsList>
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="actions">Actions ({result.actions.length})</TabsTrigger>
                      <TabsTrigger value="risks">Risks ({result.risks.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-5 pt-5">
                      <p className="text-sm leading-relaxed">{result.summary}</p>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-semibold">Decisions made</h3>
                        <ul className="mt-3 space-y-2">
                          {result.decisions.map((d, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06 }}
                              className="flex gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                              <span>{d}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Meeting sentiment</span>
                        <Badge>{result.sentiment}</Badge>
                      </div>
                    </TabsContent>

                    <TabsContent value="actions" className="space-y-3 pt-5">
                      {result.actions.map((a, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
                        >
                          <span className="text-sm">{a.task}</span>
                          <span className="flex items-center gap-2">
                            <Badge variant="secondary">{a.owner}</Badge>
                            <Badge variant="outline">{a.due}</Badge>
                          </span>
                        </motion.div>
                      ))}
                    </TabsContent>

                    <TabsContent value="risks" className="space-y-3 pt-5">
                      {result.risks.length ? (
                        result.risks.map((r, i) => (
                          <div
                            key={i}
                            className="flex gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm"
                          >
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                            <span>{r}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No risks or blockers were raised in these notes.
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </motion.div>
              ) : (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  Summarize your notes to see decisions, owners and risks.
                </p>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
