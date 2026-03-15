"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Loader2, Users, DollarSign, Clock, ShoppingCart, Check, X,
  ChevronDown, ChevronUp, Percent, Banknote, Ban, CheckCircle, XCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

function fmt$(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Stat Card ──

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

// ── Status Badge ──

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    suspended: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

// ── Affiliate Row ──

function AffiliateRow({ affiliate }: {
  affiliate: {
    _id: Id<"affiliates">;
    code: string;
    status: string;
    commissionRate: number;
    paypalEmail?: string;
    bio?: string;
    totalClicks: number;
    totalSignups: number;
    totalConversions: number;
    totalEarnings: number;
    totalPaidOut: number;
    createdAt: number;
    approvedAt?: number;
    userName: string;
    userEmail: string;
    userImage?: string;
  };
}) {
  const a = affiliate;
  const [expanded, setExpanded] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [showCommission, setShowCommission] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNote, setPayoutNote] = useState("");
  const [commissionRate, setCommissionRate] = useState(String(Math.round(a.commissionRate * 100)));
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const approve = useMutation(api.affiliates.adminApprove);
  const reject = useMutation(api.affiliates.adminReject);
  const suspend = useMutation(api.affiliates.adminSuspend);
  const setCommission = useMutation(api.affiliates.adminSetCommission);
  const recordPayout = useMutation(api.affiliates.adminRecordPayout);

  const pending = Math.round((a.totalEarnings - a.totalPaidOut) * 100) / 100;

  const handleAction = async (action: string, fn: () => Promise<unknown>) => {
    setLoading(action);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="border border-slate-200 dark:border-neutral-800/60 rounded-xl overflow-hidden">
      {/* Collapsed Row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-neutral-900/40 transition-colors text-left"
      >
        {a.userImage ? (
          <img src={a.userImage} alt="" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-slate-500">
            {a.userName?.[0] || "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-neutral-100 truncate">{a.userName}</span>
            <StatusBadge status={a.status} />
          </div>
          <div className="text-xs text-slate-400 dark:text-neutral-600 truncate">
            {a.userEmail} &middot; <span className="font-mono">{a.code}</span> &middot; {Math.round(a.commissionRate * 100)}%
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-slate-900 dark:text-neutral-100">{fmt$(a.totalEarnings)}</div>
          <div className="text-[10px] text-slate-400 dark:text-neutral-600">
            {a.totalConversions} sales &middot; {fmt$(pending)} pending
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-neutral-800/40 space-y-3">
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-lg">{error}</p>
          )}
          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { label: "Clicks", value: a.totalClicks },
              { label: "Signups", value: a.totalSignups },
              { label: "Conversions", value: a.totalConversions },
              { label: "Earned", value: fmt$(a.totalEarnings) },
              { label: "Paid Out", value: fmt$(a.totalPaidOut) },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 dark:bg-neutral-900/60 rounded-lg py-2">
                <div className="text-sm font-bold text-slate-900 dark:text-neutral-100">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                <div className="text-[10px] text-slate-400 dark:text-neutral-600 uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="text-xs text-slate-500 dark:text-neutral-500 space-y-1">
            {a.paypalEmail && <p>PayPal: {a.paypalEmail}</p>}
            {a.bio && <p>Bio: {a.bio}</p>}
            <p>Applied: {fmtDate(a.createdAt)}{a.approvedAt ? ` · Approved: ${fmtDate(a.approvedAt)}` : ""}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {a.status === "pending" && (
              <>
                <button
                  onClick={() => handleAction("approve", () => approve({ affiliateId: a._id }))}
                  disabled={loading === "approve"}
                  className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50"
                >
                  {loading === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Approve
                </button>
                <button
                  onClick={() => handleAction("reject", () => reject({ affiliateId: a._id }))}
                  disabled={loading === "reject"}
                  className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  {loading === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} Reject
                </button>
              </>
            )}

            {a.status === "approved" && (
              <button
                onClick={() => handleAction("suspend", () => suspend({ affiliateId: a._id }))}
                disabled={loading === "suspend"}
                className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                {loading === "suspend" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />} Suspend
              </button>
            )}

            {(a.status === "rejected" || a.status === "suspended") && (
              <button
                onClick={() => handleAction("approve", () => approve({ affiliateId: a._id }))}
                disabled={loading === "approve"}
                className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50"
              >
                {loading === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Re-approve
              </button>
            )}

            <button
              onClick={() => { setShowCommission(!showCommission); setShowPayout(false); }}
              className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/40"
            >
              <Percent className="w-3 h-3" /> Set Commission
            </button>

            {pending > 0 && (
              <button
                onClick={() => { setShowPayout(!showPayout); setShowCommission(false); }}
                className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <Banknote className="w-3 h-3" /> Record Payout ({fmt$(pending)})
              </button>
            )}
          </div>

          {/* Set Commission Form */}
          {showCommission && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-neutral-900/60 rounded-lg">
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                min={0}
                max={100}
                className="w-20 px-2 py-1.5 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-center"
              />
              <span className="text-sm text-slate-500">%</span>
              <button
                onClick={() => handleAction("commission", async () => {
                  await setCommission({ affiliateId: a._id, rate: Number(commissionRate) / 100 });
                  setShowCommission(false);
                })}
                disabled={loading === "commission"}
                className="px-3 py-1.5 bg-slate-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {loading === "commission" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
              </button>
              <button onClick={() => setShowCommission(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Record Payout Form */}
          {showPayout && (
            <div className="space-y-2 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-purple-700 dark:text-purple-300">$</span>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder={String(pending)}
                  step="0.01"
                  min="0.01"
                  max={pending}
                  className="w-28 px-2 py-1.5 bg-white dark:bg-neutral-800 border border-purple-200 dark:border-purple-800/40 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  placeholder="Note (optional)"
                  className="flex-1 px-2 py-1.5 bg-white dark:bg-neutral-800 border border-purple-200 dark:border-purple-800/40 rounded-lg text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const amt = payoutAmount.trim() ? Number(payoutAmount) : pending;
                    if (!amt || amt <= 0 || amt > pending) {
                      setError(`Amount must be between $0.01 and ${fmt$(pending)}`);
                      return;
                    }
                    handleAction("payout", async () => {
                      await recordPayout({
                        affiliateId: a._id,
                        amount: amt,
                        note: payoutNote || undefined,
                      });
                      setShowPayout(false);
                      setPayoutAmount("");
                      setPayoutNote("");
                    });
                  }}
                  disabled={loading === "payout"}
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading === "payout" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm Payout"}
                </button>
                <button onClick={() => setShowPayout(false)} className="text-purple-400 hover:text-purple-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────

export default function AdminAffiliatesPage() {
  const overview = useQuery(api.affiliates.adminOverview);
  const affiliates = useQuery(api.affiliates.adminList);

  if (!overview || !affiliates) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-neutral-300" />
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-neutral-100">
          Affiliate Management
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Affiliates" value={String(overview.total)} icon={Users} />
        <StatCard label="Pending Apps" value={String(overview.pending)} icon={Clock} />
        <StatCard label="Total Commissions" value={fmt$(overview.totalEarnings)} icon={DollarSign} />
        <StatCard label="Pending Payouts" value={fmt$(overview.totalPending)} icon={ShoppingCart} />
      </div>

      {/* Affiliate List */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wide mb-3">
          All Affiliates ({affiliates.length})
        </h2>

        {affiliates.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-neutral-600 py-8 text-center">
            No affiliate applications yet.
          </p>
        ) : (
          <div className="space-y-2">
            {/* Show pending first, then approved, then rest */}
            {[...affiliates]
              .sort((a, b) => {
                const order: Record<string, number> = { pending: 0, approved: 1, suspended: 2, rejected: 3 };
                return (order[a.status] ?? 4) - (order[b.status] ?? 4);
              })
              .map((a) => (
                <AffiliateRow key={a._id} affiliate={a} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
