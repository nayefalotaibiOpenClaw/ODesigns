"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Loader2, Copy, Check, Link2, MousePointerClick, UserPlus,
  ShoppingCart, DollarSign, Clock, Send,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

function fmt$(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatCard({ label, value, icon: Icon }: {
  label: string; value: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800/60 rounded-2xl p-4">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-8 h-8 bg-slate-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-600 dark:text-neutral-300" />
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-neutral-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-xl font-black tracking-tight text-slate-900 dark:text-neutral-100">{value}</div>
    </div>
  );
}

// ── Application Form ──────────────────────────────────

function ApplyForm() {
  const apply = useMutation(api.affiliates.apply);
  const [code, setCode] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      await apply({ code: code.trim(), bio: bio || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Link2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-neutral-100">
          Become an Affiliate
        </h1>
        <p className="text-sm text-slate-500 dark:text-neutral-500 mt-2">
          Share your unique link and earn 20% commission on every sale you bring in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
            Referral Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
            placeholder="e.g. SARAH20"
            maxLength={20}
            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
          <p className="text-[11px] text-slate-400 dark:text-neutral-600 mt-1">
            3-20 characters. Letters, numbers, dashes, underscores.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
            Bio (optional)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about your audience..."
            maxLength={500}
            rows={3}
            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || code.trim().length < 3}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Apply to Become an Affiliate
        </button>
      </form>
    </div>
  );
}

// ── Pending / Rejected Status ─────────────────────────

function StatusCard({ status }: { status: string }) {
  const config: Record<string, { bg: string; icon: string; label: string; desc: string }> = {
    pending: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      icon: "text-amber-600 dark:text-amber-400",
      label: "Application Pending",
      desc: "Your application is being reviewed. We'll notify you once it's approved.",
    },
    rejected: {
      bg: "bg-red-100 dark:bg-red-900/30",
      icon: "text-red-600 dark:text-red-400",
      label: "Application Rejected",
      desc: "Your affiliate application was not approved.",
    },
    suspended: {
      bg: "bg-red-100 dark:bg-red-900/30",
      icon: "text-red-600 dark:text-red-400",
      label: "Account Suspended",
      desc: "Your affiliate account has been suspended.",
    },
  };
  const c = config[status] || {
    bg: "bg-slate-100 dark:bg-slate-900/30",
    icon: "text-slate-600 dark:text-slate-400",
    label: status,
    desc: "",
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
        <Clock className={`w-7 h-7 ${c.icon}`} />
      </div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-neutral-100 mb-2">
        {c.label}
      </h1>
      <p className="text-sm text-slate-500 dark:text-neutral-500">{c.desc}</p>
    </div>
  );
}

// ── Affiliate Dashboard ───────────────────────────────

function AffiliateDashboard() {
  const affiliate = useQuery(api.affiliates.getMyAffiliate);
  const stats = useQuery(api.affiliates.getMyStats);

  const [copied, setCopied] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = affiliate ? `${appUrl}/?ref=${affiliate.code}` : "";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralLink]);

  if (!affiliate || !stats) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-neutral-100">
          Affiliate Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-neutral-500 mt-1">
          {Math.round(stats.commissionRate * 100)}% commission on every sale
        </p>
      </div>

      {/* Referral Link */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
            Your Referral Link
          </span>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-white dark:bg-neutral-900 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-neutral-300 border border-emerald-200 dark:border-emerald-800/40 truncate">
            {referralLink}
          </code>
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Clicks" value={stats.totalClicks.toLocaleString()} icon={MousePointerClick} />
        <StatCard label="Signups" value={stats.totalSignups.toLocaleString()} icon={UserPlus} />
        <StatCard label="Conversions" value={stats.totalConversions.toLocaleString()} icon={ShoppingCart} />
        <StatCard label="Total Earned" value={fmt$(stats.totalEarnings)} icon={DollarSign} />
        <StatCard label="Pending Payout" value={fmt$(stats.pendingPayout)} icon={Clock} />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wide mb-3">
          Recent Activity
        </h2>
        {stats.recentEvents.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-neutral-600">No activity yet. Share your link to get started.</p>
        ) : (
          <div className="space-y-1.5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(stats.recentEvents as any[])
              .filter((e) => e.type !== "click")
              .slice(0, 20)
              .map((event) => (
              <div key={event._id} className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-neutral-900/60 border border-slate-100 dark:border-neutral-800/40 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    event.type === "signup" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                    event.type === "conversion" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                    event.type === "payout" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" :
                    "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}>
                    {event.type}
                  </span>
                  {event.commissionAmount != null && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      +{fmt$(event.commissionAmount)}
                    </span>
                  )}
                  {event.payoutAmount != null && (
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      -{fmt$(event.payoutAmount)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 dark:text-neutral-600">{fmtDate(event.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────

export default function AffiliatePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const affiliate = useQuery(api.affiliates.getMyAffiliate, isAuthenticated ? {} : "skip");

  if (isLoading || (isAuthenticated && affiliate === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 p-6 md:p-10 max-w-4xl mx-auto">
      {!affiliate ? (
        <ApplyForm />
      ) : affiliate.status === "approved" ? (
        <AffiliateDashboard />
      ) : (
        <StatusCard status={affiliate.status} />
      )}
    </div>
  );
}
