"use client";

import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import FloatingNav from "@/app/components/FloatingNav";

export default function DataDeletionPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <FloatingNav />
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto mb-4 text-green-500" size={48} />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Data Deletion Request
          </h1>
        </div>

        {code ? (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
            <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
              Your data deletion request has been processed.
            </p>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Confirmation code: <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded font-mono">{code}</code>
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
            <p className="text-blue-800 dark:text-blue-200 font-semibold mb-2">
              Data Deletion Information
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              When you remove the oDesigns app from your Facebook or Instagram account settings,
              we automatically delete all associated data from our servers.
            </p>
          </div>
        )}

        <div className="space-y-6 text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">What data is deleted?</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Social account connection details (tokens, account IDs)</li>
              <li>Associated publishing history</li>
              <li>Any cached profile information from your social accounts</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">What data is retained?</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your oDesigns account and workspaces (created independently of social connections)</li>
              <li>Design content you created within the editor</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Need help?</h2>
            <p>
              If you have questions about data deletion, contact us at{" "}
              <a href="mailto:hi@oagents.app" className="text-blue-600 dark:text-blue-400 underline">
                hi@oagents.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
