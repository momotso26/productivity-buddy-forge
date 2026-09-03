/**
 * Simulated AI engine — deterministic, template-driven text generation with
 * realistic latency. No network calls, no API keys.
 */

export function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function latency(min = 900, max = 1900) {
  return Math.round(min + Math.random() * (max - min));
}

function pick<T>(list: T[], seed: number) {
  return list[Math.abs(seed) % list.length] as T;
}

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return h;
}

/* ---------------------------------- Email --------------------------------- */

export type EmailTone = "professional" | "friendly" | "concise" | "persuasive" | "apologetic";
export type EmailLength = "short" | "medium" | "detailed";

const toneOpeners: Record<EmailTone, string[]> = {
  professional: ["I hope this message finds you well.", "Thank you for your time on this."],
  friendly: ["Hope you're having a good week!", "Great to hear from you —"],
  concise: ["Quick note on this.", "Short one from me."],
  persuasive: [
    "I wanted to share something I think will move the needle for your team.",
    "There's a clear opportunity here worth five minutes of your time.",
  ],
  apologetic: [
    "Thank you for your patience — and apologies for the delay.",
    "I want to start by apologising for the inconvenience caused.",
  ],
};

const toneClosers: Record<EmailTone, string> = {
  professional: "Best regards,",
  friendly: "Thanks so much,",
  concise: "Thanks,",
  persuasive: "Looking forward to your thoughts,",
  apologetic: "With apologies and thanks,",
};

export function generateEmail(input: {
  recipient: string;
  subject: string;
  keyPoints: string;
  tone: EmailTone;
  length: EmailLength;
  sender: string;
}) {
  const seed = hash(input.subject + input.keyPoints + input.tone);
  const points = input.keyPoints
    .split(/\n|·|;|(?<=\.)\s+/)
    .map((p) => p.trim().replace(/^[-*•]\s*/, ""))
    .filter(Boolean);

  const name = input.recipient.trim() || "there";
  const opener = pick(toneOpeners[input.tone], seed);
  const subject = input.subject.trim() || "Following up";

  const body: string[] = [];
  body.push(`Hi ${name},`, "", opener, "");

  if (input.length === "short") {
    body.push(
      points.length
        ? `In short: ${points.join(". ").replace(/\.\./g, ".")}.`
        : `I wanted to follow up on ${subject.toLowerCase()}.`,
    );
  } else {
    body.push(
      `I'm writing regarding ${subject.toLowerCase()}. Here's a quick summary of where things stand:`,
      "",
    );
    points.forEach((p, i) => body.push(`${i + 1}. ${p.charAt(0).toUpperCase() + p.slice(1)}`));
    if (!points.length) body.push("1. Confirming next steps and ownership for this workstream.");
  }

  if (input.length === "detailed") {
    body.push(
      "",
      "For context, my aim is to keep this moving without adding overhead to your week. If any of the above needs adjusting, I'm happy to adapt to what works best on your side.",
    );
  }

  body.push(
    "",
    input.tone === "persuasive"
      ? "Would you be open to a 20-minute call this week to explore it?"
      : "Let me know if that works, or if you'd prefer a different approach.",
    "",
    toneClosers[input.tone],
    input.sender.trim() || "Alex Morgan",
  );

  return {
    subject: `${subject}${input.tone === "concise" ? "" : " — next steps"}`,
    body: body.join("\n"),
    confidence: 88 + (Math.abs(seed) % 10),
  };
}

/* ------------------------------ Meeting notes ----------------------------- */

export function summarizeMeeting(notes: string, attendees: string) {
  const sentences = notes
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
  const people = attendees
    .split(/,|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const owner = (i: number) => people[i % Math.max(people.length, 1)] || "Unassigned";

  const summary = sentences.slice(0, 3).join(" ") || "The team aligned on priorities and next steps.";

  const decisions = sentences
    .filter((s) => /decid|agree|approv|will|confirm|sign off|go with/i.test(s))
    .slice(0, 4);

  const actions = sentences
    .filter((s) => /need|should|action|follow up|send|prepare|review|ship|draft|schedule/i.test(s))
    .slice(0, 5)
    .map((s, i) => ({
      task: s.replace(/^(we|i|they)\s+/i, "").replace(/\.$/, ""),
      owner: owner(i),
      due: pick(["Tomorrow", "This Friday", "Next Monday", "In two weeks"], hash(s)),
    }));

  const risks = sentences.filter((s) => /risk|blocker|concern|delay|issue|depend/i.test(s)).slice(0, 3);

  return {
    summary,
    keyPoints: sentences.slice(0, 6).map((s) => s.replace(/\.$/, "")),
    decisions: decisions.length ? decisions : ["Proceed with the current plan as discussed."],
    actions: actions.length
      ? actions
      : [{ task: "Circulate notes and confirm owners", owner: owner(0), due: "Tomorrow" }],
    risks,
    sentiment: pick(["Positive", "Constructive", "Focused", "Cautiously optimistic"], hash(notes)),
    minutesSaved: Math.max(6, Math.round(notes.split(/\s+/).length / 45)),
  };
}

/* -------------------------------- Planner --------------------------------- */

export type Priority = "high" | "medium" | "low";

export function planTasks(goal: string, horizon: string) {
  const seed = hash(goal + horizon);
  const verbs = [
    "Clarify scope and success metrics for",
    "Draft the first working version of",
    "Collect feedback from stakeholders on",
    "Refine and quality-check",
    "Prepare the rollout plan for",
    "Review outcomes and document learnings from",
  ];
  const subject = goal.trim() || "the new initiative";
  return verbs.map((v, i) => ({
    id: `${Date.now()}-${i}`,
    title: `${v} ${subject.toLowerCase()}`,
    priority: (i < 2 ? "high" : i < 4 ? "medium" : "low") as Priority,
    estimate: pick(["30m", "1h", "2h", "half day"], seed + i),
    day: pick(["Mon", "Tue", "Wed", "Thu", "Fri"], seed + i * 3),
    done: false,
  }));
}

/* -------------------------------- Research -------------------------------- */

export function research(query: string) {
  const q = query.trim() || "the topic";
  const seed = hash(q);
  return {
    overview: `Across recent sources, ${q} is consistently framed as a shift in how teams operate rather than a single tool decision. Adoption tends to succeed where the workflow is narrow, measurable, and owned by one team before it is scaled.`,
    findings: [
      `Teams that pilot ${q} on a single workflow report the fastest measurable gains.`,
      `The main constraint is rarely capability — it is process clarity and data hygiene.`,
      `Mid-sized organisations move fastest because approval chains are shorter.`,
      `Perceived value drops sharply when outputs are not reviewed by a human owner.`,
    ],
    sources: [
      { title: `State of ${q}: annual benchmark report`, type: "Industry report", credibility: 92 },
      { title: `${q} in practice — practitioner survey`, type: "Survey", credibility: 84 },
      { title: `A field guide to evaluating ${q}`, type: "Long-form analysis", credibility: 78 },
      { title: `Case notes: rolling out ${q} across three teams`, type: "Case study", credibility: 71 },
    ],
    counterpoints: [
      `Reported productivity gains are usually self-assessed rather than measured.`,
      `Early wins can mask maintenance cost that appears in month three.`,
    ],
    readingTime: 4 + (Math.abs(seed) % 5),
  };
}

/* --------------------------------- Chatbot -------------------------------- */

export function chatReply(message: string, turn: number) {
  const m = message.toLowerCase();
  if (/hello|hi\b|hey/.test(m))
    return "Hey! I can draft emails, summarise meetings, plan your week, or dig into a topic. What are you working on?";
  if (/email|draft/.test(m))
    return "I can draft that. Give me the recipient, the two or three points you want to land, and the tone — or jump into Smart Email Generator and I'll build it there.";
  if (/meeting|notes|summar/.test(m))
    return "Paste the raw notes into Meeting Notes Summarizer and I'll pull out decisions, owners, and due dates. Rambling notes are fine — that's the point.";
  if (/task|plan|priorit|schedule/.test(m))
    return "Tell me the goal and the time you have. I'll break it into sequenced tasks with priorities and estimates you can reshuffle.";
  if (/research|find out|compare/.test(m))
    return "I'll pull an overview, key findings, credibility-scored sources, and the counterarguments — so you see the weak spots too.";
  if (/\?$/.test(message.trim()))
    return `Good question. Here's how I'd approach it: start by narrowing "${message.replace(/\?$/, "")}" to one decision you need to make this week, then work backwards from the evidence you'd need to make it confidently. Want me to plan that out?`;
  return `Noted — "${message.trim()}". ${pick(
    [
      "The fastest path here is to name the outcome first, then strip anything that doesn't serve it.",
      "I'd sequence this into three moves: clarify, draft, review. Want me to draft the first one?",
      "There's a lot in that. Let's take the highest-leverage piece and finish it properly.",
    ],
    hash(message) + turn,
  )}`;
}
