"use client";

import type { LeaderboardPayload } from "@/components/types";

type Props = {
  data: LeaderboardPayload;
};

export function Leaderboard({ data }: Props) {
  return (
    <div className="page-shell">
      <section className="hero" style={{ gridTemplateColumns: "1fr" }}>
        <div>
          <h1>Staff Leaderboard</h1>
          <p>Top 5 validators today with live warehouse completion progress for ready deliveries.</p>
        </div>
      </section>

      <section className="leaderboard">
        {data.users.map((user, index) => (
          <article key={user.id} className="leader-card" style={{ animationDelay: `${index * 80}ms` }}>
            <img src={user.avatarUrl} alt={user.name} />
            <h3>{user.name}</h3>
            <p className="hint">Picking Points: {user.points}</p>
          </article>
        ))}
      </section>

      <section className="progress-wrap">
        <strong>Daily Delivery Completion</strong>
        <div className="hint">
          {data.progress.done} done today / {data.progress.ready + data.progress.done} in today scope
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${data.progress.percent}%` }} />
        </div>
      </section>
    </div>
  );
}
