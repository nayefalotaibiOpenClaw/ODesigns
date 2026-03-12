"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Users, CreditCard, TrendingUp, Cpu, DollarSign, UserPlus } from "lucide-react";

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string; icon: React.ElementType; sub?: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-neutral-800 rounded-xl flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-neutral-400" />
        </div>
        <span className="text-sm font-medium text-neutral-500">{label}</span>
      </div>
      <div className="text-2xl font-black tracking-tight">{value}</div>
      {sub && <div className="text-xs text-neutral-600 mt-1">{sub}</div>}
    </div>
  );
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(ts: number | undefined) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const CATEGORY_COLORS: Record<string, string> = {
  generation: "bg-blue-500/20 text-blue-400",
  adaptation: "bg-purple-500/20 text-purple-400",
  website_analysis: "bg-green-500/20 text-green-400",
  image_analysis: "bg-amber-500/20 text-amber-400",
  crawl: "bg-cyan-500/20 text-cyan-400",
  classification: "bg-pink-500/20 text-pink-400",
  product_extraction: "bg-orange-500/20 text-orange-400",
};

export default function AdminOverviewPage() {
  const overview = useQuery(api.admin.getOverview);
  const recentUsers = useQuery(api.admin.listRecentUsers);
  const recentUsage = useQuery(api.admin.listRecentUsage);

  if (!overview) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight mb-6">Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <StatCard label="Total Users" value={overview.totalUsers.toLocaleString()} icon={Users} />
        <StatCard label="Active Subs" value={overview.activeSubCount.toLocaleString()} icon={CreditCard} />
        <StatCard label="MRR" value={formatCurrency(overview.mrr)} icon={TrendingUp} />
        <StatCard label="AI Cost (30d)" value={formatCurrency(overview.aiCost30d)} icon={Cpu} />
        <StatCard label="Revenue" value={formatCurrency(overview.totalRevenue)} icon={DollarSign} />
        <StatCard label="New Users (7d)" value={overview.newUsersLast7d.toLocaleString()} icon={UserPlus} />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800">
            <h2 className="text-sm font-bold text-neutral-400">Recent Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-600">
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Plan</th>
                  <th className="text-right px-5 py-3 font-medium">AI Usage</th>
                  <th className="text-right px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers?.map((u) => (
                  <tr key={u._id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {u.image ? (
                          <img src={u.image} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 bg-neutral-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                            {(u.name || u.email || "U")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-neutral-200 truncate max-w-[140px]">{u.name || "—"}</div>
                          <div className="text-[11px] text-neutral-600 truncate max-w-[140px]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        u.plan === "pro" ? "bg-violet-500/20 text-violet-400" :
                        u.plan === "starter" ? "bg-blue-500/20 text-blue-400" :
                        "bg-neutral-800 text-neutral-500"
                      }`}>
                        {u.plan || "none"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-neutral-400 tabular-nums">
                      {u.subscription
                        ? `${(u.subscription.aiTokensUsed / 1000).toFixed(0)}k / ${(u.subscription.aiTokensLimit / 1000).toFixed(0)}k`
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-neutral-500 tabular-nums">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent AI Usage */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800">
            <h2 className="text-sm font-bold text-neutral-400">Recent AI Usage</h2>
          </div>
          <div className="overflow-y-auto max-h-[500px]">
            {recentUsage?.length === 0 && (
              <div className="px-5 py-10 text-center text-neutral-600 text-sm">No AI usage logged yet</div>
            )}
            {recentUsage?.map((log) => (
              <div key={log._id} className="px-5 py-3 border-b border-neutral-800/50 hover:bg-neutral-800/30">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      CATEGORY_COLORS[log.category] || "bg-neutral-800 text-neutral-400"
                    }`}>
                      {log.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-neutral-500">{log.user?.name || log.user?.email || "Unknown"}</span>
                  </div>
                  <span className="text-[11px] text-neutral-600 tabular-nums">{timeAgo(log.createdAt)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span className="tabular-nums">{log.totalTokens.toLocaleString()} tokens</span>
                  <span className="tabular-nums">${log.estimatedCostUsd.toFixed(4)}</span>
                  <span className="text-neutral-700">{log.endpoint}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
