"use client";

import { useEffect, useState } from "react";
import { apiBase } from "../lib/api";

const STORAGE_KEY = "mindtrack_userId";

export function SettingsPageClient() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(window.localStorage.getItem(STORAGE_KEY));
  }, []);

  function clearSession() {
    window.localStorage.removeItem(STORAGE_KEY);
    setUserId(null);
  }

  return (
    <>
      <h1>Settings</h1>
      <p className="mt-page-desc">Local preferences and developer-oriented connection info for the MVP.</p>

      <div className="mt-card">
        <p className="mt-card-title">API</p>
        <p style={{ margin: "0 0 0.5rem" }}>
          Browser calls: <code>{apiBase()}</code>
        </p>
        <p className="mt-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          Override with <code>NEXT_PUBLIC_API_URL</code> in <code>.env.local</code> (see <code>.env.example</code>).
        </p>
      </div>

      <div className="mt-card">
        <p className="mt-card-title">Session (this browser)</p>
        {userId ? (
          <p style={{ margin: "0 0 0.75rem" }}>
            Stored user id: <code>{userId}</code>
          </p>
        ) : (
          <p className="mt-muted" style={{ margin: "0 0 0.75rem" }}>
            No user id in local storage. Register on Today.
          </p>
        )}
        <button type="button" className="mt-btn mt-btn-danger" onClick={clearSession} disabled={!userId}>
          Clear stored user
        </button>
      </div>

      <div className="mt-card">
        <p className="mt-card-title">Privacy (coming)</p>
        <p className="mt-muted" style={{ margin: 0 }}>
          Screenshot cadence, retention days, and redaction will live here when tracking ships.
        </p>
      </div>
    </>
  );
}
