import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { Loader2, ListChecks, Plus, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { planTasks, delay, latency, type Priority } from "@/lib/simulated-ai";

type Task = ReturnType<typeof planTasks>[number];

const priorityStyle: Record<Priority, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-warning/15 text-warning-foreground border-warning/40",
  low: "bg-success/10 text-success border-success/30",
};

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workplace AI" },
      {
        name: "description",
        content:
          "Turn a goal into a sequenced task plan with priorities, estimates and a day-by-day breakdown.",
      },
      { property: "og:title", content: "AI Task Planner — Workplace AI" },
      {
        property: "og:description",
        content: "Describe the goal, get a prioritised plan you can actually work through.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [goal, setGoal] = useState("Launch the new customer onboarding flow");
  const [horizon, setHorizon] = useState("this week");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [manual, setManual] = useState("");

  const progress = useMemo(
    () => (tasks.length ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0),
    [tasks],
  );

  async function run() {
    setLoading(true);
    await delay(latency(900, 1700));
    const plan = planTasks(goal, horizon);
    setTasks(plan);
    setLoading(false);
    toast.success("Plan generated", { description: `${plan.length} tasks sequenced for ${horizon}.` });
  }

  function addManual() {
    if (!manual.trim()) return;
    setTasks((t) => [
      ...t,
      {
        id: `${Date.now()}`,
        title: manual.trim(),
        priority: "medium",
        estimate: "1h",
        day: "Fri",
        done: false,
      },
    ]);
    setManual("");
    toast.success("Task added");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Task Planner"
        title="AI Task Planner"
        description="Name the outcome and the time you have. The planner breaks it into ordered tasks with priorities and estimates — then you tune it."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal">What do you want to achieve?</Label>
              <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time horizon</Label>
              <Select value={horizon} onValueChange={setHorizon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["today", "this week", "next two weeks", "this month"].map((h) => (
                    <SelectItem key={h} value={h} className="capitalize">
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={run} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Building plan…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate plan
                </>
              )}
            </Button>

            {tasks.length > 0 && (
              <div className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="mt-3" />
                <p className="mt-3 text-xs text-muted-foreground">
                  {tasks.filter((t) => t.done).length} of {tasks.length} tasks complete
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Plan</CardTitle>
            {tasks.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <ListChecks className="size-3" /> {tasks.length} tasks
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)
            ) : tasks.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Generate a plan to see your sequenced tasks.
              </p>
            ) : (
              <>
                <AnimatePresence initial={false}>
                  {tasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: loading ? 0 : i * 0.04 }}
                      className="group flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-shadow hover:shadow-soft"
                    >
                      <Checkbox
                        checked={task.done}
                        onCheckedChange={(v) =>
                          setTasks((prev) =>
                            prev.map((t) => (t.id === task.id ? { ...t, done: Boolean(v) } : t)),
                          )
                        }
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${task.done ? "text-muted-foreground line-through" : ""}`}
                        >
                          {task.title}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${priorityStyle[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                          <Badge variant="outline">{task.estimate}</Badge>
                          <Badge variant="secondary">{task.day}</Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => {
                          setTasks((prev) => prev.filter((t) => t.id !== task.id));
                          toast("Task removed");
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="flex gap-2 pt-2">
                  <Input
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addManual()}
                    placeholder="Add your own task…"
                  />
                  <Button variant="outline" onClick={addManual}>
                    <Plus className="size-4" /> Add
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
