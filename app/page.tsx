"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminChrome } from "./components/AdminChrome";
import { Waiver, postApi } from "./lib/api";
import { useAuth } from "./lib/AuthProvider";
import { formatDay, fullName } from "./lib/format";

export default function AdminPage() {
  const { user } = useAuth();
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    user
      .getIdToken()
      .then((token) =>
        postApi<{ waivers: Waiver[] }>({ action: "listWaivers", limit: 300 }, token),
      )
      .then((payload) => setWaivers(payload.waivers || []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load waivers."),
      )
      .finally(() => setLoading(false));
  }, [user]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return waivers;
    return waivers.filter((item) => {
      const haystack = [
        item.firstName,
        item.lastName,
        item.phone,
        item.entityName,
        item.dateOfBirth,
        item.id,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [waivers, query]);

  return (
    <AdminChrome>
      <main className="shell">
        <div className="page-head">
          <div>
            <p className="eyebrow">Bluff agreements</p>
            <h1>Signatures</h1>
          </div>
        </div>

        <section className="stats">
          <div className="stat">
            <strong>{waivers.length}</strong>
            <span>Total signed</span>
          </div>
          <div className="stat">
            <strong>{visible.length}</strong>
            <span>Showing</span>
          </div>
          <div className="stat">
            <strong>
              {waivers.filter((item) => item.source === "sheet-migration").length}
            </strong>
            <span>Migrated</span>
          </div>
        </section>

        <div className="toolbar">
          <label className="search">
            Search participants
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, phone, company…"
            />
          </label>
        </div>

        {error ? <p className="error">{error}</p> : null}
        {loading ? <p className="muted">Loading signatures…</p> : null}

        <div className="list">
          {visible.map((waiver) => (
            <Link key={waiver.id} className="row" href={`/waiver/${waiver.id}`}>
              <div>
                <h2>{fullName(waiver.firstName, waiver.lastName)}</h2>
                <p className="meta">
                  {waiver.entityName ? `${waiver.entityName} · ` : ""}
                  {waiver.phone || "No phone"}
                </p>
              </div>
              <div className="row-side">
                <span>{formatDay(waiver.signedAt || waiver.createdAt)}</span>
                <span className="pill">
                  {waiver.source === "sheet-migration" ? "Migrated" : "Live"}
                </span>
              </div>
            </Link>
          ))}
          {!loading && !visible.length ? (
            <p className="empty">No matching signatures yet.</p>
          ) : null}
        </div>
      </main>
    </AdminChrome>
  );
}
