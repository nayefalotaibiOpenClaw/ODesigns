# Affiliate Marketing System — Manual QA Checklist

> Date: 2026-03-15
> System under test: oDesign affiliate marketing (middleware, Convex backend, dashboard UI, admin UI, pricing integration)

---

## 1. Affiliate Application Flow

### Prerequisites
- Logged-in user account (non-admin)
- No existing affiliate record for this user

### Steps
- [ ] Navigate to `/affiliate`
- [ ] Verify the "Become an Affiliate" form is displayed
- [ ] Enter a code shorter than 3 characters — submit button should be disabled
- [ ] Enter a valid code (3-20 chars, alphanumeric/dashes/underscores), e.g. `SARAH20`
- [ ] Verify the input auto-uppercases and strips invalid characters
- [ ] Optionally fill in PayPal email and bio
- [ ] Enter a bio longer than 500 characters — verify error on submit
- [ ] Submit with a valid code
- [ ] Verify success — page should now show "Application Pending" status card
- [ ] Attempt to submit again (refresh page) — form should NOT appear (already applied)

### Expected Database State
- `affiliates` table: new record with `status: "pending"`, `commissionRate: 0.2`, counters at 0
- `referrals` table: no entries yet

### Edge Cases
- [ ] Try submitting a code that is already taken by another affiliate — verify "code is already taken" error
- [ ] Try submitting from a second browser tab simultaneously — verify only one record is created

---

## 2. Admin Approval Flow

### Prerequisites
- Admin account (email in `ADMIN_EMAILS` env var or `role: "admin"`)
- At least one pending affiliate application

### Steps
- [ ] Navigate to `/admin` — verify "Affiliates" link/card is visible
- [ ] Navigate to `/admin/affiliates`
- [ ] Verify the overview stats section shows correct counts (Total Affiliates, Pending Apps, etc.)
- [ ] Find the pending affiliate in the list — verify it shows a yellow "pending" badge
- [ ] Expand the affiliate row — verify user info, code, bio, PayPal email are shown
- [ ] Click "Approve" — verify the status changes to "approved" with a green badge
- [ ] Verify `approvedAt` timestamp is set in the database

### Rejection Flow
- [ ] Create another test application, then click "Reject" from admin
- [ ] Verify status changes to "rejected"
- [ ] Verify the affiliate dashboard shows "Application Rejected" status card

### Suspension Flow
- [ ] Approve an affiliate, then click "Suspend" from admin
- [ ] Verify status changes to "suspended"
- [ ] Verify the affiliate dashboard shows "Account Suspended" status card

### Re-approval Flow
- [ ] From a rejected or suspended affiliate, click "Re-approve"
- [ ] Verify status changes back to "approved"

### Commission Rate Change
- [ ] Expand an affiliate row, click "Set Commission"
- [ ] Enter a value (e.g. 30 for 30%), click Save
- [ ] Verify the commission rate updates in the UI and database
- [ ] Try setting commission to 0% — should succeed
- [ ] Try setting commission to 100% — should succeed
- [ ] Try setting commission > 100% or negative — verify error

---

## 3. Referral Link Tracking

### Prerequisites
- An approved affiliate with code `TESTCODE`

### 3A. Click Tracking (Unauthenticated Visitor)

- [ ] Open an incognito/private browser window
- [ ] Visit `http://localhost:3001/?ref=TESTCODE`
- [ ] Verify browser is redirected to `http://localhost:3001/` (ref stripped)
- [ ] Open DevTools > Application > Cookies — verify `ref=TESTCODE` cookie exists
  - Path: `/`
  - Max-Age: 2592000 (30 days)
  - SameSite: Lax
- [ ] Verify a `click` event is recorded in the `referrals` table
- [ ] Verify the affiliate's `totalClicks` incremented by 1
- [ ] Refresh the page — verify no duplicate click is recorded (ReferralTracker uses `useRef` guard)

### 3B. Signup Attribution (User Registers)

- [ ] With the `ref` cookie still set, sign up / log in via Google OAuth
- [ ] Verify `ReferralTracker` component calls `stampReferral` mutation
- [ ] Verify the user's `referredBy` field is set to `TESTCODE`
- [ ] Verify a `signup` event is recorded in `referrals` table
- [ ] Verify the affiliate's `totalSignups` incremented by 1
- [ ] Verify the `ref` cookie is cleared after successful stamp
- [ ] Log out and log back in — verify `referredBy` is NOT overwritten (idempotent)

### 3C. Self-Referral Prevention

- [ ] Log in as the affiliate themselves
- [ ] Manually set `ref=TESTCODE` cookie in DevTools
- [ ] Refresh the page — verify `stampReferral` silently does nothing (no self-referral)
- [ ] Verify `referredBy` is NOT set on the affiliate's own user record

### 3D. Non-Approved Affiliate

- [ ] Use a ref code belonging to a pending/rejected/suspended affiliate
- [ ] Middleware will still set the cookie (it doesn't check status)
- [ ] But `trackClick`, `stampReferral`, and `recordConversion` should all silently skip
- [ ] Verify no events are recorded in `referrals` table

---

## 4. Payment Attribution

### Prerequisites
- An approved affiliate with code `PROMO20`
- A user who was referred (has `referredBy: "PROMO20"` or still has the `ref` cookie)

### Steps
- [ ] As the referred user, navigate to `/pricing`
- [ ] Select a plan (Starter or Pro) and click Subscribe
- [ ] Verify the pricing page reads the `ref` cookie: `document.cookie.match(/ref=([^;]+)/)`
- [ ] Verify `createPayment` mutation is called with `affiliateCode: "PROMO20"` in args
- [ ] Verify the payment record in `payments` table has `metadata: '{"affiliateCode":"PROMO20"}'`
- [ ] Complete the UPayments checkout flow (or simulate via webhook)
- [ ] After payment verification (webhook), verify:
  - [ ] A `conversion` event is created in `referrals` table
  - [ ] `referrals.saleAmount` matches the payment amount
  - [ ] `referrals.commissionAmount` = `saleAmount * commissionRate` (e.g. 20%)
  - [ ] `referrals.paymentId` links to the correct payment record
  - [ ] Affiliate's `totalConversions` incremented by 1
  - [ ] Affiliate's `totalEarnings` increased by the commission amount

### Idempotency
- [ ] Re-process the same webhook — verify no duplicate conversion is created (checked via `by_payment` index)

### No Cookie Scenario
- [ ] Complete a payment without any `ref` cookie — verify no affiliate code is sent, no conversion recorded

---

## 5. Payout Recording

### Prerequisites
- An approved affiliate with `totalEarnings > totalPaidOut` (has a pending balance)

### Steps
- [ ] As admin, navigate to `/admin/affiliates`
- [ ] Expand the affiliate with a pending balance
- [ ] Verify "Record Payout" button appears showing the correct pending amount
- [ ] Click "Record Payout"
- [ ] Enter an amount equal to the pending balance, optionally add a note
- [ ] Click "Confirm Payout"
- [ ] Verify:
  - [ ] A `payout` event is created in `referrals` table with `payoutAmount` and optional `payoutNote`
  - [ ] Affiliate's `totalPaidOut` is updated
  - [ ] Pending balance in the UI is now $0.00
  - [ ] "Record Payout" button disappears (no pending balance)

### Edge Cases
- [ ] Try recording a payout of $0 — verify error "must be positive"
- [ ] Try recording a payout greater than pending balance — verify error "exceeds pending balance"
- [ ] Try recording a payout of exactly $0.01 — should succeed
- [ ] Record multiple small payouts — verify running totals remain accurate (no floating point drift)

---

## 6. Affiliate Dashboard UI

### Prerequisites
- Approved affiliate with some activity

### Steps
- [ ] Navigate to `/affiliate`
- [ ] Verify dashboard shows:
  - [ ] Commission rate percentage
  - [ ] Referral link with correct format: `{origin}/?ref={CODE}`
  - [ ] Copy button works — copies link to clipboard
  - [ ] Stats grid: Clicks, Signups, Conversions, Total Earned, Pending Payout
  - [ ] All values match database records
- [ ] Verify "Payout Details" section shows PayPal email or placeholder text
- [ ] Click Edit, change PayPal email, click Save — verify update succeeds
- [ ] Verify "Recent Activity" section shows non-click events (signups, conversions, payouts)
- [ ] Verify events are sorted newest first
- [ ] Verify conversion events show the commission amount in green
- [ ] Verify payout events show the payout amount in purple

---

## 7. Edge Cases to Verify Manually

### Cookie Behavior
- [ ] Visit with `?ref=CODE_A`, then visit again with `?ref=CODE_B` — second cookie should overwrite first
- [ ] Delete cookies, visit `?ref=CODE` — sign up — verify attribution works end-to-end
- [ ] Visit `?ref=CODE` on `/pricing` specifically — verify redirect preserves `/pricing` path

### Concurrent Operations
- [ ] Two admins approve the same pending affiliate simultaneously — only one `approvedAt` should be set
- [ ] Two payments complete at the same time for the same affiliate — verify both conversions are recorded separately
- [ ] User clicks affiliate link in two tabs — verify only one click event is tracked (client-side ref guard)

### Data Integrity
- [ ] Delete a user who was an affiliate — verify no cascading crash in admin queries
- [ ] Create an affiliate, get it approved, then verify `getByCode` returns the affiliate name
- [ ] Call `getByCode` for a pending affiliate — should return `null` (only approved affiliates visible)
- [ ] Verify `totalEarnings` and `totalPaidOut` never go negative
- [ ] Verify commission calculations use `Math.round(... * 100) / 100` to avoid floating point issues

### Security
- [ ] Call `adminApprove` from a non-admin authenticated user — verify "Not authorized" error
- [ ] Call `adminRecordPayout` from a non-admin — verify "Not authorized" error
- [ ] Call `apply` without authentication — verify "Not authenticated" error
- [ ] Call `updateProfile` for another user's affiliate — verify ownership check (uses session userId)
- [ ] Attempt SQL injection / NoSQL injection in the `code` field — regex should block it
- [ ] Attempt XSS in `bio` field — verify it's rendered safely in React (auto-escaped)
- [ ] Verify `recordConversion` and `recordSignup` are `internalMutation` — not callable from client
- [ ] Verify `trackClick` is a public mutation but only increments a counter (no data exposure)

### Localization
- [ ] Visit `/?ref=CODE` with Arabic locale cookie — verify ref cookie is set AND locale redirect happens
- [ ] Visit `/ar/?ref=CODE` — verify middleware handles ref before locale rewrite

### Browser Compatibility
- [ ] Test ref cookie in Safari (stricter cookie policies)
- [ ] Test ref cookie in Firefox private browsing
- [ ] Test ref cookie on mobile Safari (iOS)
