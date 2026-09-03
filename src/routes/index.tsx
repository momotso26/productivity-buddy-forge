import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Mail,
  FileText,
  ListChecks,
  Telescope,
  MessagesSquare,
  ArrowUpRight,
  Clock,
  Zap,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "One workspace for drafting emails, summarising meetings, planning tasks, researching topics and chatting with an AI assistant.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Draft, summarise, plan and research — all in one calm workspace.",
      },
    ],
  }),
  component: Index,
});

const stats = [
  { label: "Hours saved this week", value: "11.4", delta: "+2.1", icon: Clock },
  { label: "Drafts generated", value: "38", delta: "+9", icon: Zap },
  { label: "Meetings summarised", value: "14", delta: "+3", icon: FileText },
  { label: "Tasks completed", value: "62%", delta: "+8%", icon: TrendingUp },
];

const tools = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    body: "Bullet points in, a polished on-tone email out. Five tones, three lengths.",
  },
  {
    to: "/meetings",
    icon: FileText,
    title: "Meeting Notes Summarizer",
    body: "Decisions, action items with owners and due dates, plus the risks nobody logged.",
  },
  {
    to: "/planner",
    icon: ListChecks,
    title: "AI Task Planner",
    body: "Turn a goal into a sequenced plan with priorities, estimates and progress tracking.",
  },
  {
    to: "/research",
    icon: Telescope,
    title: "AI Research Assistant",
    body: "Overview, findings, credibility-scored sources and the counterarguments.",
  },
  {
    to: "/chat",
    icon: MessagesSquare,
    title: "Assistant Chat",
    body: "Think out loud. Phrasing, prioritising, decisions — anything without a form.",
  },
] as const;

const activity = [
  { text: "Drafted “Q3 launch timeline” email to Priya", time: "12m ago", tag: "Email" },
  { text: "Summarised Sprint 24 planning call", time: "1h ago", tag: "Meetings" },
  { text: "Generated 6-task plan for onboarding launch", time: "3h ago", tag: "Planner" },
  { text: "Researched async-first meeting culture", time: "Yesterday", tag: "Research" },
];

function Index() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Good day, Kgomotso"
        description="Five assistants, one workspace. Everything here runs locally as a prototype — no keys, no waiting on a backend."
        action={
          <Button asChild>
            <Link to="/email">
              Start a draft <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <s.icon className="size-4" />
                  </span>
                  <Badge variant="secondary" className="text-success">
                    {s.delta}
                  </Badge>
                </div>
                <p className="mt-4 font-display text-2xl font-semibold">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Your assistants
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {tools.map((t, i) => (
              <motion.div
                key={t.to}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                whileHover={{ y: -3 }}
                className={i === 4 ? "sm:col-span-2" : undefined}
              >
                <Link to={t.to} className="block h-full">
                  <Card className="h-full transition-shadow hover:shadow-lift">
                    <CardContent className="flex h-full flex-col pt-6">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <t.icon className="size-5" />
                      </span>
                      <h3 className="mt-4 text-base font-semibold">{t.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {t.body}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Open <ArrowUpRight className="size-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Weekly focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: "Deep work", value: 72 },
                { label: "Comms", value: 48 },
                { label: "Meetings", value: 31 },
              ].map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{b.label}</span>
                    <span className="text-muted-foreground">{b.value}%</span>
                  </div>
                  <Progress value={b.value} className="mt-2 h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activity.map((a) => (
                <div key={a.text} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{a.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {a.tag} · {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
