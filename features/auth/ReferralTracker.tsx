"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Tracks affiliate referrals.
 * - Unauthenticated visitors: records a click
 * - Authenticated users: stamps referredBy on user record + clears cookie
 * Mount this inside ConvexAuthNextjsProvider.
 */
export default function ReferralTracker() {
  const { isAuthenticated } = useConvexAuth();
  const stampReferral = useMutation(api.affiliates.stampReferral);
  const trackClick = useMutation(api.affiliates.trackClick);
  const hasClickTracked = useRef(false);
  const hasStampTracked = useRef(false);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)ref=([^;]+)/);
    if (!match) return;

    let code: string;
    try {
      code = decodeURIComponent(match[1]);
    } catch {
      return; // malformed cookie value
    }

    if (isAuthenticated && !hasStampTracked.current) {
      hasStampTracked.current = true;
      // Stamp referral on user record (idempotent server-side)
      stampReferral({ code })
        .then(() => {
          // Clear cookie after successful stamp to prevent cross-user attribution
          document.cookie = "ref=; path=/; max-age=0";
        })
        .catch(() => {});
    } else if (!isAuthenticated && !hasClickTracked.current) {
      hasClickTracked.current = true;
      trackClick({ code }).catch(() => {});
    }
  }, [isAuthenticated, stampReferral, trackClick]);

  return null;
}
