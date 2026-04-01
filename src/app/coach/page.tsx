"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardValue } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Flame, Trophy, MessageSquare } from "lucide-react";

const habits = [
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

export default function CoachPage() {
  const [completed, setCompleted] = useState<Set<number>>(new Set([0, 1, 3]));
  const streak = 12;
  const score = Array.from(completed).reduce((sum, i) => sum + habits[i].points, 0);
  const maxScore = habits.reduce((sum, h) => sum + h.points, 0);

  const toggleHabit = (index: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
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
            <p className="mt-1 text-xs text-[var(--text-muted)]">Personal best: 24 days</p>
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

      {/* AI Coach chat placeholder */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>AI Coach</CardTitle>
          <MessageSquare size={16} className="text-[var(--text-gold)]" />
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">
            <p>Ask your AI coach for sales tips, pipeline advice, or motivation. Connect your Anthropic API key in Settings to enable.</p>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm">Pipeline Review</Button>
            <Button variant="secondary" size="sm">Slow Day Fix</Button>
            <Button variant="secondary" size="sm">Motivation</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
