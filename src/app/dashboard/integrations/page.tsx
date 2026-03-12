"use client";

import { useState, useEffect } from "react";

interface HubSpotStatus {
  connected: boolean;
  enabled: boolean;
  portalId: string | null;
}

export default function IntegrationsPage() {
  const [hubspot, setHubspot] = useState<HubSpotStatus | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/integrations/hubspot")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setHubspot(data);
      })
      .catch(() => {
        // Silent fail — show disconnected state
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function handleConnect() {
    setError(null);
    setSuccess(null);
    setConnecting(true);

    try {
      const res = await fetch("/api/integrations/hubspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to connect.");
      } else {
        setSuccess("HubSpot connected successfully!");
        setToken("");
        setHubspot({
          connected: true,
          enabled: true,
          portalId: data.portalId,
        });
      }
    } catch {
      setError("Connection failed. Please try again.");
    }
    setConnecting(false);
  }

  async function handleDisconnect() {
    setError(null);
    setSuccess(null);
    setDisconnecting(true);

    try {
      const res = await fetch("/api/integrations/hubspot", {
        method: "DELETE",
      });
      if (res.ok) {
        setHubspot({ connected: false, enabled: false, portalId: null });
        setSuccess("HubSpot disconnected.");
      }
    } catch {
      setError("Failed to disconnect.");
    }
    setDisconnecting(false);
  }

  async function handleToggle(enabled: boolean) {
    setError(null);
    try {
      const res = await fetch("/api/integrations/hubspot", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        setHubspot((prev) =>
          prev ? { ...prev, enabled } : prev
        );
      }
    } catch {
      setError("Failed to update setting.");
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-sm text-text-muted mt-1">
          Connect your CRM to enrich leak data with customer behavior signals.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg">
          <svg className="w-4 h-4 text-danger flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-danger">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-danger/60 hover:text-danger cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
          <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-success">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto text-success/60 hover:text-success cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* HubSpot Card */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* HubSpot Logo */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF7A59]/10 border border-[#FF7A59]/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF7A59">
                  <path d="M17.1 9.4V7.2c.7-.3 1.2-1 1.2-1.9 0-1.1-.9-2-2-2s-2 .9-2 2c0 .8.5 1.5 1.2 1.9v2.2c-.9.2-1.7.6-2.4 1.2l-6.3-4.9c.1-.2.1-.5.1-.7 0-1.3-1.1-2.4-2.4-2.4S2.1 3.7 2.1 5s1.1 2.4 2.4 2.4c.5 0 .9-.2 1.3-.4l6.2 4.8c-.5.8-.8 1.8-.8 2.8 0 2.9 2.4 5.3 5.3 5.3s5.3-2.4 5.3-5.3c0-2.6-1.9-4.8-4.4-5.2zm-.8 8.5c-1.8 0-3.3-1.5-3.3-3.3s1.5-3.3 3.3-3.3 3.3 1.5 3.3 3.3-1.5 3.3-3.3 3.3z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">HubSpot CRM</h3>
                <p className="text-sm text-text-muted mt-0.5">
                  Enrich leaks with customer engagement data
                </p>
              </div>
            </div>

            {/* Status badge */}
            {loading ? (
              <div className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
            ) : hubspot?.connected ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-success bg-success/10 border border-success/20 rounded-full">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-medium text-text-muted bg-surface-light border border-border rounded-full">
                Not Connected
              </span>
            )}
          </div>

          {/* What it does */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 14.5l-2.846 2.846a2.25 2.25 0 01-1.591.659H8.637a2.25 2.25 0 01-1.591-.659L4.2 14.5m15.6 0h-1.034a2.25 2.25 0 00-2.25 2.25v1.25" />
                ),
                title: "Smart Severity",
                desc: "Adjusts leak priority based on CRM engagement level",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                ),
                title: "Recovery Accuracy",
                desc: "Refines recovery estimates using real customer signals",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                ),
                title: "Context You Need",
                desc: "\"Customer inactive 45d\" vs just \"payment failed\"",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-2.5 p-3 bg-white/[0.02] border border-border-light rounded-lg"
              >
                <svg className="w-4 h-4 text-[#FF7A59] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {feature.icon}
                </svg>
                <div>
                  <p className="text-xs font-medium text-white">{feature.title}</p>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connected State */}
        {hubspot?.connected && (
          <div className="px-6 pb-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-light/50 border border-border-light rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">
                  HubSpot Portal {hubspot.portalId && <span className="text-text-muted font-mono">#{hubspot.portalId}</span>}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {hubspot.enabled
                    ? "Leaks will be enriched with CRM data on your next scan."
                    : "Enrichment is paused. Toggle on to resume."}
                </p>
              </div>
              <button
                onClick={() => handleToggle(!hubspot.enabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hubspot.enabled ? "bg-brand" : "bg-surface"
                }`}
                role="switch"
                aria-checked={hubspot.enabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    hubspot.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-xs text-danger/70 hover:text-danger transition cursor-pointer disabled:opacity-50"
            >
              {disconnecting ? "Disconnecting..." : "Disconnect HubSpot"}
            </button>
          </div>
        )}

        {/* Not Connected State */}
        {!loading && !hubspot?.connected && (
          <div className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-text-muted">
                HubSpot Private App Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-3 py-2.5 text-sm bg-surface-dim border border-border rounded-lg text-white placeholder:text-text-dim focus:outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 font-mono"
              />
              <p className="text-[11px] text-text-dim">
                Create a Private App in HubSpot Settings &rarr; Integrations &rarr; Private Apps.
                Required scopes: <span className="font-mono text-text-muted">crm.objects.contacts.read</span>.{" "}
                <a
                  href="https://developers.hubspot.com/docs/api/private-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:text-brand-light transition underline underline-offset-2"
                >
                  Learn more
                </a>
              </p>
            </div>

            <button
              onClick={handleConnect}
              disabled={connecting || !token.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-black bg-brand hover:bg-brand-light rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Connect HubSpot
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Coming Soon Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            name: "Salesforce",
            desc: "Enterprise CRM integration",
            color: "#00A1E0",
          },
          {
            name: "Intercom",
            desc: "Customer messaging signals",
            color: "#286EFA",
          },
        ].map((integration) => (
          <div
            key={integration.name}
            className="bg-surface border border-border rounded-xl p-6 opacity-50"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${integration.color}15`, border: `1px solid ${integration.color}30` }}
              >
                <span className="text-sm font-bold" style={{ color: integration.color }}>
                  {integration.name[0]}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">{integration.name}</h3>
                <p className="text-xs text-text-muted">{integration.desc}</p>
              </div>
            </div>
            <span className="mt-3 inline-block px-2 py-0.5 text-[10px] font-medium text-text-muted bg-surface-light border border-border rounded">
              Coming Soon
            </span>
          </div>
        ))}
      </div>

      {/* Security note */}
      <div className="flex items-start gap-3 p-4 bg-white/[0.01] border border-border-light rounded-lg">
        <svg className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <div>
          <p className="text-xs font-medium text-white">Your data stays private</p>
          <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
            We never store personal data from your CRM. Only aggregated behavioral signals
            (engagement level, days since activity) are used. Your HubSpot token is encrypted
            with AES-256-GCM and never exposed.
          </p>
        </div>
      </div>
    </div>
  );
}
