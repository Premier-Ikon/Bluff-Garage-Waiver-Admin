"use client";

import { useEffect, useState } from "react";
import { AdminChrome } from "../components/AdminChrome";
import { Member, postApi } from "../lib/api";
import { useAuth } from "../lib/AuthProvider";

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    user
      .getIdToken()
      .then((token) =>
        postApi<{ members: Member[] }>({ action: "listMembers" }, token),
      )
      .then((payload) => setMembers(payload.members || []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load the team."),
      );
  }, [user]);

  return (
    <AdminChrome>
      <main className="shell">
        <div className="page-head">
          <div>
            <p className="eyebrow">Allowlist</p>
            <h1>Team</h1>
          </div>
        </div>

        <p className="lede">
          Only these approved emails can request a one-time sign-in code. Access
          is fixed for Dylan, Melina, and Jessica.
        </p>

        {error ? <p className="notice bad">{error}</p> : null}

        <section className="list team-list">
          {members.map((member) => (
            <div className="row" key={member.email}>
              <div>
                <h2>{member.email}</h2>
                <p className="meta">Approved · email code sign-in</p>
              </div>
              <span className="pill">Active</span>
            </div>
          ))}
          {!members.length && !error ? (
            <p className="empty">Loading approved emails…</p>
          ) : null}
        </section>
      </main>
    </AdminChrome>
  );
}
