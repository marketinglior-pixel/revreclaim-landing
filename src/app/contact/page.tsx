"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Send to Google Sheets webhook
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "contact_form",
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString(),
          }),
        });
      }
    } catch {
      // Silently fail — we have the mailto fallback
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-surface-dim">
        <header className="border-b border-border-light">
          <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">RevReclaim</span>
            </Link>
            <Link href="/" className="text-sm text-text-muted hover:text-white transition">
              ← Back to home
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Message Sent</h1>
          <p className="text-text-muted mb-8">
            Thanks for reaching out! We&apos;ll get back to you within 24 hours.
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition"
          >
            Back to Home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dim">
      {/* Header */}
      <header className="border-b border-border-light">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">RevReclaim</span>
          </Link>
          <Link href="/" className="text-sm text-text-muted hover:text-white transition">
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Contact Us</h1>
        <p className="text-text-muted mb-10">
          Have a question, found a bug, or need help with your account? We&apos;re here to help.
        </p>

        <div className="rounded-2xl border border-border bg-surface p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 bg-surface-dim border border-border rounded-lg text-white placeholder-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-4 py-3 bg-surface-dim border border-border rounded-lg text-white placeholder-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-text-secondary mb-1.5">
                Subject
              </label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-surface-dim border border-border rounded-lg text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition"
              >
                <option value="general">General Question</option>
                <option value="bug">Bug Report</option>
                <option value="billing">Billing & Pricing</option>
                <option value="security">Security Concern</option>
                <option value="feature">Feature Request</option>
                <option value="delete">Account Deletion</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Tell us how we can help..."
                required
                className="w-full px-4 py-3 bg-surface-dim border border-border rounded-lg text-white placeholder-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand hover:bg-brand-dark text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Direct email fallback */}
        <div className="mt-8 text-center">
          <p className="text-sm text-text-muted">
            Or email us directly at{" "}
            <a href="mailto:revreclaim@gmail.com" className="text-brand hover:text-brand-light transition">
              revreclaim@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
