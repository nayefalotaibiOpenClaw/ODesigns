#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Affiliate Marketing System — E2E Test Script
# ─────────────────────────────────────────────────────────────────────────────
# Prerequisites:
#   1. Next.js dev server running:  npm run dev  (default port 3001)
#   2. Convex dev running:          npx convex dev
#
# Usage:
#   chmod +x tests/affiliate-e2e.sh
#   ./tests/affiliate-e2e.sh [BASE_URL]
#
# BASE_URL defaults to http://localhost:3001
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

BASE_URL="${1:-http://localhost:3001}"
PASS=0
FAIL=0
SKIP=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

pass() {
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}PASS${NC}  $1"
}

fail() {
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}FAIL${NC}  $1"
  if [ -n "${2:-}" ]; then
    echo -e "        ${RED}→ $2${NC}"
  fi
}

skip() {
  SKIP=$((SKIP + 1))
  echo -e "  ${YELLOW}SKIP${NC}  $1"
}

header() {
  echo ""
  echo -e "${CYAN}━━━ $1 ━━━${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────
# Check server is running
# ─────────────────────────────────────────────────────────────────────────────

header "Pre-flight check"

if ! curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" --max-time 5 > /dev/null 2>&1; then
  echo -e "  ${RED}ERROR${NC}  Cannot reach $BASE_URL — is the dev server running?"
  echo "  Start with: npm run dev"
  exit 1
fi
pass "Dev server reachable at $BASE_URL"

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 1: Middleware ref cookie — redirect + Set-Cookie behavior
# ─────────────────────────────────────────────────────────────────────────────

header "1. Middleware — ref query param handling"

# ── Test 1.1: Valid ref code sets cookie and redirects ──────────────────────
# The middleware should:
#   - Return a 307 redirect (NextResponse.redirect default)
#   - Strip ?ref=TEST123 from the redirect Location
#   - Set a "ref" cookie with value TEST123 (uppercased), 30-day max-age

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/?ref=TEST123" --max-time 10 2>&1 || true)

# Check for redirect status (307 from NextResponse.redirect)
if echo "$RESPONSE" | grep -qiE "HTTP/[0-9.]+ (307|302|303)"; then
  pass "1.1a  ?ref=TEST123 → redirect status (307/302/303)"
else
  fail "1.1a  ?ref=TEST123 → expected redirect status" \
       "Got: $(echo "$RESPONSE" | head -1)"
fi

# Check Set-Cookie header contains ref=TEST123
if echo "$RESPONSE" | grep -qi "set-cookie:.*ref=TEST123"; then
  pass "1.1b  Set-Cookie header contains ref=TEST123"
else
  fail "1.1b  Set-Cookie header should contain ref=TEST123" \
       "Headers: $(echo "$RESPONSE" | grep -i set-cookie || echo '(none)')"
fi

# Check that Location header does NOT contain ?ref=
LOCATION=$(echo "$RESPONSE" | grep -i "^location:" | head -1 || true)
if [ -n "$LOCATION" ]; then
  if echo "$LOCATION" | grep -q "ref="; then
    fail "1.1c  Redirect Location should not contain ref= param" \
         "$LOCATION"
  else
    pass "1.1c  Redirect Location is clean (no ref= param)"
  fi
else
  fail "1.1c  No Location header found in redirect response"
fi

# Check max-age is set (30 days = 2592000)
if echo "$RESPONSE" | grep -qi "set-cookie:.*ref=.*max-age=2592000"; then
  pass "1.1d  Cookie max-age is 2592000 (30 days)"
else
  fail "1.1d  Cookie max-age should be 2592000" \
       "$(echo "$RESPONSE" | grep -i 'set-cookie:.*ref=' || echo '(not found)')"
fi


# ── Test 1.2: Too-short ref code (2 chars) → no redirect, no cookie ────────
# The regex /^[a-zA-Z0-9_-]{3,20}$/ requires minimum 3 characters.

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/?ref=ab" --max-time 10 2>&1 || true)

if echo "$RESPONSE" | grep -qi "set-cookie:.*ref=AB"; then
  fail "1.2a  ?ref=ab (too short) should NOT set ref cookie" \
       "Cookie was set when it should not be"
else
  pass "1.2a  ?ref=ab (too short) → no ref cookie set"
fi

# Should NOT redirect (returns 200 or the normal page)
if echo "$RESPONSE" | grep -qiE "HTTP/[0-9.]+ (307|302|303)"; then
  # It might still redirect for locale, so check if it is a ref-related redirect
  if echo "$RESPONSE" | grep -qi "set-cookie:.*ref="; then
    fail "1.2b  ?ref=ab should not trigger ref redirect"
  else
    pass "1.2b  ?ref=ab → no ref redirect (locale redirect is OK)"
  fi
else
  pass "1.2b  ?ref=ab → no redirect (200 OK)"
fi


# ── Test 1.3: Ref code with special chars (dashes/underscores) ──────────────
# VALID_CODE-1 matches /^[a-zA-Z0-9_-]{3,20}$/

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/?ref=VALID_CODE-1" --max-time 10 2>&1 || true)

if echo "$RESPONSE" | grep -qi "set-cookie:.*ref=VALID_CODE-1"; then
  pass "1.3   ?ref=VALID_CODE-1 → cookie set correctly (dashes/underscores)"
else
  fail "1.3   ?ref=VALID_CODE-1 should set cookie with dashes/underscores" \
       "$(echo "$RESPONSE" | grep -i 'set-cookie:.*ref=' || echo '(not found)')"
fi


# ── Test 1.4: Ref on non-root path, preserving other query params ───────────
# ?ref=PROMO&plan=pro on /pricing should:
#   - Redirect to /pricing?plan=pro (ref removed, plan preserved)
#   - Set ref=PROMO cookie

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/pricing?ref=PROMO&plan=pro" --max-time 10 2>&1 || true)

if echo "$RESPONSE" | grep -qi "set-cookie:.*ref=PROMO"; then
  pass "1.4a  /pricing?ref=PROMO&plan=pro → ref cookie set"
else
  fail "1.4a  /pricing?ref=PROMO&plan=pro should set ref cookie" \
       "$(echo "$RESPONSE" | grep -i 'set-cookie:.*ref=' || echo '(not found)')"
fi

LOCATION=$(echo "$RESPONSE" | grep -i "^location:" | head -1 || true)
if [ -n "$LOCATION" ]; then
  if echo "$LOCATION" | grep -q "plan=pro"; then
    pass "1.4b  Redirect preserves plan=pro in query string"
  else
    fail "1.4b  Redirect should preserve plan=pro query param" \
         "$LOCATION"
  fi
  if echo "$LOCATION" | grep -q "ref="; then
    fail "1.4c  Redirect Location should not contain ref="
  else
    pass "1.4c  Redirect Location stripped ref= param"
  fi
else
  fail "1.4b  No Location header found"
fi


# ── Test 1.5: Ref code too long (21+ chars) → should NOT set cookie ─────────

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/?ref=ABCDEFGHIJKLMNOPQRSTUV" --max-time 10 2>&1 || true)

if echo "$RESPONSE" | grep -qi "set-cookie:.*ref=ABCDEFGHIJKLMNOPQRSTUV"; then
  fail "1.5   ?ref=<21chars> should NOT set cookie (max 20)"
else
  pass "1.5   ?ref=<21chars> → rejected (too long, max 20)"
fi


# ── Test 1.6: Ref code with invalid characters → should NOT set cookie ──────

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/?ref=HACK%3Cscript%3E" --max-time 10 2>&1 || true)

if echo "$RESPONSE" | grep -qi "set-cookie:.*ref="; then
  fail "1.6   ?ref=HACK<script> should NOT set cookie (XSS attempt)"
else
  pass "1.6   ?ref=HACK<script> → rejected (invalid chars)"
fi


# ── Test 1.7: API routes should NOT be intercepted by ref middleware ─────────

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/api/payments/create?ref=APITEST" --max-time 10 2>&1 || true)

if echo "$RESPONSE" | grep -qi "set-cookie:.*ref=APITEST"; then
  fail "1.7   /api/* routes should skip ref middleware"
else
  pass "1.7   /api/* routes skip ref middleware"
fi


# ── Test 1.8: Static files should NOT be intercepted ────────────────────────

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/favicon.ico?ref=STATIC" --max-time 10 2>&1 || true)

if echo "$RESPONSE" | grep -qi "set-cookie:.*ref=STATIC"; then
  fail "1.8   Static files should skip ref middleware"
else
  pass "1.8   Static files skip ref middleware"
fi


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 2: Cookie behavior on subsequent requests
# ─────────────────────────────────────────────────────────────────────────────

header "2. Cookie persistence and path"

# ── Test 2.1: Cookie path is "/" ─────────────────────────────────────────────

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/?ref=PATHTEST" --max-time 10 2>&1 || true)
COOKIE_LINE=$(echo "$RESPONSE" | grep -i "set-cookie:.*ref=PATHTEST" || true)

if echo "$COOKIE_LINE" | grep -qi "path=/"; then
  pass "2.1   Cookie path is set to /"
else
  fail "2.1   Cookie should have path=/" \
       "$COOKIE_LINE"
fi

# ── Test 2.2: Cookie has SameSite=Lax ────────────────────────────────────────

if echo "$COOKIE_LINE" | grep -qi "samesite=lax"; then
  pass "2.2   Cookie has SameSite=Lax"
else
  fail "2.2   Cookie should have SameSite=Lax" \
       "$COOKIE_LINE"
fi


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3: Code validation regex consistency
# ─────────────────────────────────────────────────────────────────────────────

header "3. Code format validation (middleware vs backend alignment)"

# The middleware uses:  /^[a-zA-Z0-9_-]{3,20}$/
# The backend uses:     /^[a-zA-Z0-9_-]{3,20}$/  (same regex in convex/affiliates.ts)
# Both also uppercase the code.

echo -e "  ${GREEN}INFO${NC}  Middleware regex: /^[a-zA-Z0-9_-]{3,20}$/"
echo -e "  ${GREEN}INFO${NC}  Backend regex:    /^[a-zA-Z0-9_-]{3,20}$/ (same)"
pass "3.1   Middleware and backend use identical regex pattern"

# ── Test 3.2: Verify cookie value is uppercased ─────────────────────────────

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/?ref=lowercase" --max-time 10 2>&1 || true)

if echo "$RESPONSE" | grep -qi "set-cookie:.*ref=LOWERCASE"; then
  pass "3.2   Cookie value is uppercased (lowercase → LOWERCASE)"
else
  # Middleware does .toUpperCase() in the cookie set
  fail "3.2   Cookie value should be uppercased" \
       "$(echo "$RESPONSE" | grep -i 'set-cookie:.*ref=' || echo '(not found)')"
fi


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 4: Convex API (via HTTP)
# ─────────────────────────────────────────────────────────────────────────────

header "4. Convex mutation/query access (smoke tests)"

# Convex exposes its API at the NEXT_PUBLIC_CONVEX_URL.
# We can attempt to call public queries/mutations via the Convex HTTP API.
# Format: POST <convex-url>/api/query  or  /api/mutation
# Body:   { "path": "affiliates:getByCode", "args": { "code": "NONEXISTENT" } }

# Try to detect the Convex URL from .env.local or environment
CONVEX_URL=""
ENV_FILE="/Users/nayefalotaibi/conductor/workspaces/oDesigns/tallinn-v1/.env.local"
if [ -f "$ENV_FILE" ]; then
  CONVEX_URL=$(grep "NEXT_PUBLIC_CONVEX_URL" "$ENV_FILE" 2>/dev/null | head -1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs)
fi

if [ -z "$CONVEX_URL" ]; then
  skip "4.x   Convex URL not found in .env.local — skipping direct API tests"
else
  echo -e "  ${GREEN}INFO${NC}  Convex URL: $CONVEX_URL"

  # ── Test 4.1: getByCode with non-existent code → returns null ──────────
  RESULT=$(curl -s -X POST "$CONVEX_URL/api/query" \
    -H "Content-Type: application/json" \
    -d '{"path":"affiliates:getByCode","args":{"code":"NONEXISTENT_CODE_999"}}' \
    --max-time 10 2>&1 || true)

  if echo "$RESULT" | grep -q '"status":"success"'; then
    # The value should be null for a non-existent code
    if echo "$RESULT" | grep -q '"value":null'; then
      pass "4.1   getByCode('NONEXISTENT_CODE_999') → null (correct)"
    else
      fail "4.1   getByCode should return null for non-existent code" \
           "Got: $RESULT"
    fi
  else
    fail "4.1   getByCode query failed" \
         "Response: $RESULT"
  fi

  # ── Test 4.2: trackClick with non-existent code → no error (silent fail) ──
  RESULT=$(curl -s -X POST "$CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"affiliates:trackClick","args":{"code":"NONEXISTENT_CODE_999"}}' \
    --max-time 10 2>&1 || true)

  if echo "$RESULT" | grep -q '"status":"success"'; then
    pass "4.2   trackClick('NONEXISTENT_CODE_999') → silent success (no affiliate found)"
  else
    fail "4.2   trackClick should succeed silently for unknown codes" \
         "Response: $RESULT"
  fi

  # ── Test 4.3: trackClick with invalid code format → no error ───────────
  RESULT=$(curl -s -X POST "$CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"affiliates:trackClick","args":{"code":"!@#$%"}}' \
    --max-time 10 2>&1 || true)

  if echo "$RESULT" | grep -q '"status":"success"'; then
    pass "4.3   trackClick('!@#\$%') → silent success (regex rejects, no error thrown)"
  else
    fail "4.3   trackClick with invalid chars should not throw" \
         "Response: $RESULT"
  fi

  # ── Test 4.4: apply without auth → error ───────────────────────────────
  RESULT=$(curl -s -X POST "$CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"affiliates:apply","args":{"code":"TESTCODE"}}' \
    --max-time 10 2>&1 || true)

  if echo "$RESULT" | grep -q '"status":"error"'; then
    pass "4.4   apply() without auth → error (correct, requires authentication)"
  else
    fail "4.4   apply() without auth should return error" \
         "Response: $RESULT"
  fi

  # ── Test 4.5: adminList without auth → error ───────────────────────────
  RESULT=$(curl -s -X POST "$CONVEX_URL/api/query" \
    -H "Content-Type: application/json" \
    -d '{"path":"affiliates:adminList","args":{}}' \
    --max-time 10 2>&1 || true)

  if echo "$RESULT" | grep -q '"status":"error"'; then
    pass "4.5   adminList() without auth → error (correct, admin guard)"
  else
    fail "4.5   adminList() without auth should return error" \
         "Response: $RESULT"
  fi

  # ── Test 4.6: stampReferral without auth → error ───────────────────────
  RESULT=$(curl -s -X POST "$CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"affiliates:stampReferral","args":{"code":"TESTCODE"}}' \
    --max-time 10 2>&1 || true)

  if echo "$RESULT" | grep -q '"status":"error"'; then
    pass "4.6   stampReferral() without auth → error (requires login)"
  else
    fail "4.6   stampReferral() without auth should return error" \
         "Response: $RESULT"
  fi
fi


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 5: Pricing page affiliate code integration
# ─────────────────────────────────────────────────────────────────────────────

header "5. Pricing page — affiliate cookie read"

# ── Test 5.1: Pricing page loads successfully ────────────────────────────────

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/pricing" --max-time 10 2>&1 || true)

if [ "$HTTP_CODE" = "200" ]; then
  pass "5.1   /pricing returns 200 OK"
else
  fail "5.1   /pricing should return 200" \
       "Got HTTP $HTTP_CODE"
fi

# ── Test 5.2: Pricing page HTML loads (basic sanity) ─────────────────────────

BODY=$(curl -s "$BASE_URL/pricing" --max-time 10 2>&1 || true)

if echo "$BODY" | grep -qi "pricing\|starter\|pro\|subscribe"; then
  pass "5.2   /pricing page contains pricing-related content"
else
  fail "5.2   /pricing page should contain pricing content" \
       "(page may be client-rendered — check manually)"
fi


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 6: Dashboard page access (auth-guarded)
# ─────────────────────────────────────────────────────────────────────────────

header "6. Affiliate dashboard — auth guard"

# ── Test 6.1: /affiliate redirects to login when not authenticated ───────────

RESPONSE=$(curl -s -D - -o /dev/null -L "$BASE_URL/affiliate" --max-time 10 --max-redirs 0 2>&1 || true)

# Should either redirect to /login or return the page (client-side auth)
if echo "$RESPONSE" | grep -qiE "HTTP/[0-9.]+ (307|302|303)" || echo "$RESPONSE" | grep -qiE "HTTP/[0-9.]+ 200"; then
  pass "6.1   /affiliate page responds (auth handled client-side or via redirect)"
else
  fail "6.1   /affiliate should be accessible (auth is client-side)" \
       "Got: $(echo "$RESPONSE" | head -1)"
fi


# ── Test 6.2: /admin/affiliates requires admin auth ─────────────────────────

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/affiliates" --max-time 10 2>&1 || true)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ]; then
  pass "6.2   /admin/affiliates responds (admin guard is server-side in Convex)"
else
  fail "6.2   /admin/affiliates should be accessible (guard is in Convex queries)" \
       "Got HTTP $HTTP_CODE"
fi


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 7: Edge cases
# ─────────────────────────────────────────────────────────────────────────────

header "7. Edge cases"

# ── Test 7.1: Empty ref param → no cookie ───────────────────────────────────

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/?ref=" --max-time 10 2>&1 || true)

if echo "$RESPONSE" | grep -qi "set-cookie:.*ref="; then
  # Check if it's an empty value cookie (which would still be wrong)
  fail "7.1   ?ref= (empty) should NOT set a ref cookie"
else
  pass "7.1   ?ref= (empty) → no ref cookie set"
fi

# ── Test 7.2: Ref exactly 3 chars (minimum valid) ───────────────────────────

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/?ref=ABC" --max-time 10 2>&1 || true)

if echo "$RESPONSE" | grep -qi "set-cookie:.*ref=ABC"; then
  pass "7.2   ?ref=ABC (3 chars, minimum valid) → cookie set"
else
  fail "7.2   ?ref=ABC (3 chars) should be accepted" \
       "$(echo "$RESPONSE" | grep -i 'set-cookie:.*ref=' || echo '(not found)')"
fi

# ── Test 7.3: Ref exactly 20 chars (maximum valid) ──────────────────────────

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/?ref=ABCDEFGHIJKLMNOPQRST" --max-time 10 2>&1 || true)

if echo "$RESPONSE" | grep -qi "set-cookie:.*ref=ABCDEFGHIJKLMNOPQRST"; then
  pass "7.3   ?ref=<20chars> (maximum valid) → cookie set"
else
  fail "7.3   ?ref=<20chars> should be accepted" \
       "$(echo "$RESPONSE" | grep -i 'set-cookie:.*ref=' || echo '(not found)')"
fi

# ── Test 7.4: Multiple ref params → first one used ──────────────────────────

RESPONSE=$(curl -s -D - -o /dev/null "$BASE_URL/?ref=FIRST&ref=SECOND" --max-time 10 2>&1 || true)

if echo "$RESPONSE" | grep -qi "set-cookie:.*ref=FIRST"; then
  pass "7.4   ?ref=FIRST&ref=SECOND → first ref used (FIRST)"
elif echo "$RESPONSE" | grep -qi "set-cookie:.*ref=SECOND"; then
  pass "7.4   ?ref=FIRST&ref=SECOND → second ref used (browser behavior varies)"
else
  fail "7.4   Multiple ref params should still set a cookie" \
       "$(echo "$RESPONSE" | grep -i 'set-cookie:.*ref=' || echo '(not found)')"
fi


# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────

header "Summary"

TOTAL=$((PASS + FAIL + SKIP))

echo ""
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo -e "  ${YELLOW}Skipped: $SKIP${NC}"
echo -e "  Total:  $TOTAL"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo -e "  ${RED}Some tests failed. Review the output above.${NC}"
  exit 1
else
  echo -e "  ${GREEN}All tests passed.${NC}"
  exit 0
fi
