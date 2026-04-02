"use client";

import { useState, useTransition, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardValue } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Target, Flame, Trophy, MessageSquare, Send, Loader2 } from "lucide-react";

const defaultHabits = [
  { name: "Morning market check", points: 10 },
  { name: "5 outbound calls", points: 15 },
  { name: "Follow up hot leads", points: 15 },
  { name: "Update pipeline", points: 10 },
  { name: "1 viewing booked", points: 20 },
  { name: "Social media post", points: 10 },
  { name: "Evening review", points: 10 },
];

const dailyChallenge = {
  title: "Close a viewing within 2 hours of first contact",
  points: 50,
  difficulty: "Hard",
};

interface CoachData {
  id: string;
  date: string;
  habits: Array<{ name: string; completed: boolean; points: number }>;
  challengesDone: string[];
  streak: number;
  score: number;
  personalBest: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const quickPrompts = [
  { label: "Pipeline Review", prompt: "Review my current pipeline and tell me which deals need attention. What should I prioritize today?" },
  { label: "Slow Day Fix", prompt: "I'm having a slow day with no leads coming in. Give me 5 specific actions I can take right now to generate business." },
  { label: "Motivation", prompt: "I need a motivational boost. Based on my current performance, remind me what I'm doing well and push me to the next level." },
  { label: "Follow-up Plan", prompt: "I have overdue follow-ups. Help me create a prioritized follow-up plan for today." },
  { label: "Closing Tips", prompt: "I have hot deals in my pipeline. Give me specific closing techniques for Dubai luxury real estate." },
];

export default function CoachView({ session, coachContext }: { session: CoachData | null; coachContext: string }) {
  const savedHabits = session?.habits?.length
    ? session.habits
    : defaultHabits.map((h) => ({ ...h, completed: false }));

  const [completed, setCompleted] = useState<Set<number>>(() => {
    const set = new Set<number>();
    savedHabits.forEach((h, i) => { if (h.completed) set.add(i); });
    return set;
  });
  const [isPending, startTransition] = useTransition();

  const habits = savedHabits.map((h, i) => ({
    name: h.name,
    points: h.points,
  }));

  const streak = session?.streak ?? 0;
  const personalBest = session?.personalBest ?? 0;
  const score = Array.from(completed).reduce((sum, i) => sum + habits[i].points, 0);
  const maxScore = habits.reduce((sum, h) => sum + h.points, 0);

  const toggleHabit = (index: number) => {
    const next = new Set(completed);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCompleted(next);

    // Persist to server
    if (session?.id) {
      const updatedHabits = habits.map((h, i) => ({
        name: h.name,
        points: h.points,
        completed: next.has(i),
      }));
      const newScore = Array.from(next).reduce((sum, i) => sum + habits[i].points, 0);

      startTransition(async () => {
        await fetch("/api/coach", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            habits: updatedHabits,
            score: newScore,
          }),
        });
      });
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-gold)]">Discipline & Coach</h2>
        <p className="text-sm text-[var(--text-muted)]">Build elite habits, track your streak</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Score */}
        <Card className="glow-gold">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Today&apos;s Score</CardTitle>
            <Trophy size={16} className="text-[var(--text-gold)]" />
          </CardHeader>
          <CardContent>
            <CardValue className="text-[var(--text-gold)]">{score} / {maxScore}</CardValue>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold-600)] to-[var(--gold-400)] transition-all" style={{ width: `${(score / maxScore) * 100}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Current Streak</CardTitle>
            <Flame size={16} className="text-[var(--amber)]" />
          </CardHeader>
          <CardContent>
            <CardValue className="text-[var(--amber)]">{streak} days</CardValue>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Personal best: {personalBest} days</p>
          </CardContent>
        </Card>

        {/* Challenge */}
        <Card className="border-[var(--border-gold)]">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Daily Challenge</CardTitle>
            <Badge variant="amber">{dailyChallenge.difficulty}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--text-primary)]">{dailyChallenge.title}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-[var(--text-gold)]">+{dailyChallenge.points} pts</span>
              <Button size="sm">Complete</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habits checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Habits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {habits.map((habit, i) => (
            <button
              key={habit.name}
              onClick={() => toggleHabit(i)}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm transition-all ${
                completed.has(i)
                  ? "bg-[var(--green-muted)] text-[var(--green)]"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  completed.has(i) ? "border-[var(--green)] bg-[var(--green)]" : "border-[var(--border-default)]"
                }`}>
                  {completed.has(i) && <span className="text-xs text-white">&#10003;</span>}
                </div>
                <span className={completed.has(i) ? "line-through opacity-70" : ""}>{habit.name}</span>
              </div>
              <Badge variant={completed.has(i) ? "green" : "default"}>+{habit.points}</Badge>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* AI Coach Chat */}
      <AiCoachChat coachContext={coachContext} />
    </div>
  );
}

function AiCoachChat({ coachContext }: { coachContext: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context: coachContext,
          type: "coaching",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to get response");
        setLoading(false);
        return;
      }

      const aiMsg: ChatMessage = { role: "assistant", text: data.data.content };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setError("Network error — check your connection");
    }
    setLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>AI Coach</CardTitle>
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[var(--text-gold)]" />
          {messages.length > 0 && (
            <Badge variant="default">{messages.length} messages</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Chat messages */}
        {messages.length === 0 && !error && (
          <div className="rounded-lg bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">
            <p>
              Your AI coach has access to your live pipeline data, performance
              score, and habits. Ask for personalized advice or use a quick
              prompt below.
            </p>
          </div>
        )}

        {messages.length > 0 && (
          <div className="max-h-[400px] space-y-3 overflow-y-auto rounded-lg bg-[var(--bg-elevated)] p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "rounded-tr-sm bg-[var(--gold-900)] text-[var(--text-primary)]"
                      : "rounded-tl-sm bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl rounded-tl-sm bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-muted)]">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-[var(--red)]/20 bg-[var(--red)]/5 px-4 py-3 text-sm text-[var(--red)]">
            {error}
          </div>
        )}

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((qp) => (
            <Button
              key={qp.label}
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => sendMessage(qp.prompt)}
            >
              {qp.label}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask your AI coach anything..."
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            disabled={loading}
            className="flex-1"
          />
          <Button
            size="md"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
