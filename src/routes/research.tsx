import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Loader2, Search, BookOpen, Scale, Clock } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { research, delay, latency } from "@/lib/simulated-ai";

const SUGGESTIONS = [
  "AI adoption in mid-sized teams",
  "async-first meeting culture",
  "measuring developer productivity",
  "knowledge management tooling",
];

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI" },
      {
        name: "description",
        content:
          "Ask a research question and get an overview, key findings, credibility-scored sources and counterpoints.",
      },
      { property: "og:title", content: "AI Research Assistant — Workplace AI" },
      {
        property: "og:description",
        content: "Overview, findings, sources and counterarguments for any workplace question.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState<ReturnType<typeof research> | null>(null);

  async function run(q = query) {
    if (!q.trim()) {
      toast.error("Enter a topic to research.");
      return;
    }
    setQuery(q);
    setResult(null);
    setLoading(true);
    for (const s of ["Scanning sources…", "Weighing credibility…", "Synthesising findings…"]) {
      setStage(s);
      await delay(latency(500, 900));
    }
    setResult(research(q));
    setLoading(false);
    toast.success("Research brief ready");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Research"
        title="AI Research Assistant"
        description="Ask a question and get a structured brief: what the consensus is, which sources carry weight, and where the argument is weakest."
      />

      <Card className="shadow-soft">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
              placeholder="e.g. how do teams measure AI productivity gains?"
              className="h-11"
            />
            <Button onClick={() => run()} disabled={loading} className="h-11 sm:w-40">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Researching
                </>
              ) : (
                <>
                  <Search className="size-4" /> Research
                </>
              )}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => run(s)}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="l" exit={{ opacity: 0 }} className="space-y-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {stage}
            </p>
            <Skeleton className="h-28" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </motion.div>
        ) : result ? (
          <motion.div
            key="r"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="shadow-soft">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Overview</CardTitle>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="size-3" /> {result.readingTime} min read
                </Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-relaxed">{result.overview}</p>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold">Key findings</h3>
                  <ul className="mt-3 space-y-2">
                    {result.findings.map((f, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex gap-3 text-sm text-muted-foreground"
                      >
                        <span className="mt-0.5 font-mono text-xs text-primary">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{f}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="size-4 text-primary" /> Sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.sources.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium leading-snug">{s.title}</p>
                        <Badge variant="outline" className="shrink-0">
                          {s.credibility}
                        </Badge>
                      </div>
                      <Progress value={s.credibility} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">{s.type}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Scale className="size-4 text-primary" /> Counterpoints
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.counterpoints.map((c, i) => (
                    <p
                      key={i}
                      className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground"
                    >
                      {c}
                    </p>
                  ))}
                  <p className="pt-2 text-xs text-muted-foreground">
                    Simulated output for prototype purposes — sources are illustrative.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
