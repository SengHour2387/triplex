# ADR-005: RN API layer — AppError, 401-only single-flight refresh, zod at the boundary, TanStack Query

**Date:** 2026-10-03
**Status:** Accepted
**Deciders:** Project owner (go-ahead for Task 2), Claude (implementation)
**Context link:** [[ADR-003-migrate-flutter-to-react-native-expo]] · plan: `triplex_expo/MIGRATION_PLAN.md` Task 2

---

## Context

The Expo scaffold's HTTP layer was a port of Flutter's `AuthInterceptor` and had real defects, found by reading `triplex_node`:

- It refreshed the token on **401 and 403**. The backend uses **401** for token problems (`auth/missing_token`, `auth/invalid_token`) but **403** for genuine permission errors (`comment/unauthorized`, post ownership) and for a rejected refresh token. So deleting someone else's comment triggered a pointless refresh.
- It set `_retry = true` but never read it → refresh → retry → 403 → refresh … **with no exit**.
- Only `ECONNABORTED` / `ERR_NETWORK` kept the session on refresh failure; a proxy `502`/`503` during refresh would have signed the user out.
- Errors reached the UI as raw axios errors / backend strings; response bodies were cast, not validated (`as any`).

## Decision

1. **One error type, `AppError`** (`src/core/errors`): `kind` (`network | timeout | unauthorized | forbidden | not_found | bad_request | server | invalid_response | unknown`), backend `code`, `status`, and a **user-safe `message`**. Every failure leaving `apiClient` is an `AppError`. Backend codes map to human text via a table; **unknown codes and raw backend strings are never shown**.
2. **Refresh rules:** only `401` on a non-refresh call refreshes. `403` passes through as an `AppError`. **One retry max** per request. Refresh is a **single-flight promise** (all concurrent 401s share one refresh). If a request's 401 arrives after another request already refreshed (the stored token ≠ the token it was sent with), it replays with the stored token instead of refreshing again. Refresh outcome: server **rejects** it (401/403) → wipe credentials + end session; **anything else** (offline, timeout, 5xx, malformed body) → **keep the session** and surface the error.
3. **Validate at the boundary:** `zod` schemas for responses; `send(client, config, schema)` returns typed data or throws `invalid_response`. Types are inferred from schemas (single source of truth).
4. **Query layer:** TanStack Query v5. Retry only transient errors (max 2, 1 s→10 s backoff); mutations never retry (a retried POST can double-post). Focus = `AppState`; online = `expo-network`. **Toast policy:** a query toasts only when a *background* refetch fails with data on screen (a failed first load is the screen's job); mutations toast unless `meta.silent`. Toasts de-duplicate for 2.5 s.
5. **Storage:** reads never throw (unreadable = signed out, logged); **writes throw** (a token that failed to persist must not look saved). Web is not a target — fallbacks removed.
6. **`src/core` is `any`-free**, enforced by ESLint (`no-explicit-any: error`).
7. The API layer ends the session through a tiny typed `sessionEvents` emitter, so `core` never imports the auth feature (no cycle).

## Options Considered

| Option | Verdict |
|--------|---------|
| Patch the ported interceptor | Rejected — three of the defects are structural (the queue, the unread flag, the status check) |
| Refresh on 401 **and** 403 (Flutter behaviour) | Rejected — contradicts the backend contract; causes the loop above |
| Toast every query error | Rejected — a failed first load would show twice (toast + empty state) |
| Result/`Either` types (`fpdart` equivalent) | Rejected — thrown `AppError` + TanStack's `error` state gives the same information with less ceremony |
| `@react-native-community/netinfo` for the online manager | Not chosen — `expo-network` is the SDK-aligned package (both are native) |

## Consequences

- Features call `send(apiClient, …, schema)` and handle `AppError`; they never touch axios or SecureStore.
- **New native dependency `expo-network`** → every checkout needs a dev-client rebuild.
- Persistent 401 *after* a successful refresh ends that request with `unauthorized` but does **not** sign the user out (a fresh token being refused is more likely a server-side bug than a dead session). Revisit if it shows up in practice.
- Not yet exercised end-to-end on device with a real signed-in session — Task 3 (login) is the first task that can; its acceptance should include a forced-refresh and an airplane-mode check.
