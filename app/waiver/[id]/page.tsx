"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminChrome } from "../../components/AdminChrome";
import { Waiver, postApi } from "../../lib/api";
import { useAuth } from "../../lib/AuthProvider";
import { formatDay, fullName } from "../../lib/format";

export default function WaiverDetailPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const [waiver, setWaiver] = useState<Waiver | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !id) return;
    user
      .getIdToken()
      .then((token) =>
        postApi<{ waiver: Waiver }>({ action: "getWaiver", id }, token),
      )
      .then((payload) => setWaiver(payload.waiver))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load waiver."),
      );
  }, [user, id]);

  return (
    <AdminChrome>
      <main className="shell">
        <div className="page-head">
          <div>
            <p className="eyebrow">
              <Link href="/">← All signatures</Link>
            </p>
            <h1>{waiver ? fullName(waiver.firstName, waiver.lastName) : "Signature"}</h1>
          </div>
        </div>

        {error ? <p className="error">{error}</p> : null}
        {!waiver && !error ? <p className="muted">Loading…</p> : null}

        {waiver ? (
          <section className="invite-panel">
            <div className="form-grid">
              <div>
                <p className="muted">Phone</p>
                <strong>{waiver.phone || "—"}</strong>
              </div>
              <div>
                <p className="muted">Date of birth</p>
                <strong>{waiver.dateOfBirth || "—"}</strong>
              </div>
              <div>
                <p className="muted">Company</p>
                <strong>{waiver.entityName || "—"}</strong>
              </div>
              <div>
                <p className="muted">Signed</p>
                <strong>{formatDay(waiver.signedAt || waiver.createdAt)}</strong>
              </div>
              <div>
                <p className="muted">Source</p>
                <strong>
                  {waiver.source === "sheet-migration" ? "Sheet migration" : "Live form"}
                </strong>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <p className="muted" style={{ marginBottom: 12 }}>
                Signature
              </p>
              {waiver.signatureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="sig-frame"
                  src={waiver.signatureUrl}
                  alt="Participant signature"
                />
              ) : (
                <p className="muted">No signature image on file.</p>
              )}
            </div>
          </section>
        ) : null}
      </main>
    </AdminChrome>
  );
}
