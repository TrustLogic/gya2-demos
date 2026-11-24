# GYA² demos (TrustLogic)

GYA² = **Govern Your Agents × Govern Your Assets**: deterministic checks on the AI and on the money.

- **The AI check (GYA-agent)** is run by the **AI platform** (TripMate for Travel AI, PlanWise for Planner AI). It enforces the owner's rules *for that AI*.
- **The money check (GYA-asset)** is run by the **bank** (Maple Demo Bank). It enforces the owner's rules *on that money*.
- They run in **separate places, with different rules**, in order: AI platform first, then the bank. A PASS from either means "allowed to proceed", never "paid". Money moves only after the bank's check passes (or the owner approves a hold).
- Each check sees something the other can't: the AI platform sees **one AI across all its accounts**; the bank sees **one pot of money across all its spenders**. That is the "²".
- **TrustLogic holds $0.** It decides and signs. The bank holds and moves the money.

All names are fictional: Maria Lopez (owner), Tom Lopez, Maple Demo Bank, TripMate, PlanWise, Travel Seller Registry, SkyJet Airlines, etc. Every screen says SIMULATED.

## The three demos

| File | Audience | Screens | Examples |
|---|---|---|---|
| `dist/demo1-money.html` | banks | TripMate (request only), Maple bank app, TrustLogic log | couch hallucination (M-2), $4,000 cruise → Maria approves (M-5), Planner AI + Travel AI share one pot (M-6), registry suspends SkyJet with no transaction (M-3), hacked AI: look-alike seller, J. Smith tickets, fake approval note, revoke R-1 (M-1) |
| `dist/demo2-ai.html` | AI platforms | TripMate console, TrustLogic log | Paris off-task (AI-1), ski expedition the money would allow (AI-2), card + bank across accounts (AI-4), SeatHelper task scope (AI-5), passport sharing, no money at all (AI-6) |
| `dist/demo3-both.html` | everyone (main demo) | TripMate, Maple bank app, TrustLogic log | both pass; only AI catches it (+ replay with no AI check); only money catches it (registry); only money sees every spender (Planner AI on PlanWise); only AI sees every account (credit card) (+ replay) |

Each demo: numbered example pills + Restart at top; a pinned caption bar at the bottom ("director") with one button per step; on phones, tabs that auto-switch to the screen that changed; TrustLogic log has Decisions and Developer (simulated request/response JSON) tabs.

## The rules (single source: `src/engine.js`)

Money (Maria's Travel money, $10,000 for 2026):
- **M-1** Approved AIs only: Travel AI (R-1, TripMate), Planner AI (R-2, PlanWise). Unknown right, or a right belonging to another AI → DENY. Revoked → DENY.
- **M-2** Travel only: airlines, cruises, hotels, expeditions (verified item category, never the AI's label)
- **M-3** Registry sellers only (Travel Seller Registry status, signed updates)
- **M-4** Travelers: Maria and Tom only (verified passenger names; a note from the AI can't add one)
- **M-5** Over $2,500 to one seller in 24 hours → HOLD for Maria's approval on her phone
- **M-6** $10,000 per year, shared by all spenders

AI (Travel AI's policy on TripMate):
- **AI-1** Denver trip, Dec 12–15 · **AI-2** Flights and hotels only · **AI-3** $3,000 per purchase · **AI-4** $3,000 per day, all accounts (counts *authorized* amounts) · **AI-5** Helpers: only the task and amount Travel AI gives them · **AI-6** Passport and ID only to sellers in the current booking

Planner AI has its own, looser policy on PlanWise (`POLICIES['planner-ai']`).

## Layout

```
src/engine.js      shared decision engine: checkMoney, settleMoney, checkAI, authorizeAI, delegate, rules text, shared UI helpers
src/money.js       Demo 1 UI + examples     src/money.py  title, tabs, screen captions, extra CSS
src/ai.js          Demo 2 UI + examples     src/ai.py
src/both.js        Demo 3 UI + examples     src/both.py
src/base.css       shared styles for the product screens
build.py           inlines base.css + engine.js + <demo>.js into one self-contained HTML per demo → dist/
tests/engine.test.js   engine unit tests (node, no deps)
tests/walk.py          clicks through every example at 1440px and 360px with Playwright, prints captions, fails on JS errors
```

Commands:
```
python3 build.py                 # builds all three into dist/
node tests/engine.test.js        # must print ALL PASS
python3 tests/walk.py dist/demo3-both.html 5    # needs playwright + chrome
```
Never hand-edit `dist/`. Change `src/`, rebuild, run both tests. Each dist file must stay a single self-contained HTML file (no external JS; Google Fonts link is the only external request).

## Framing rules (these are the owner's, keep them)

- **The rules are permanent; access is what gets revoked.** Revoking R-1 leaves Travel AI named in M-1, marked "access revoked". Never show a rule being deleted or rewritten.
- Never say GYA "sits on top of" anything. It is **built in / embedded at creation**.
- Never imply autonomous detection or monitoring. Checks run when a request or a signed update arrives.
- The registry is a **court clerk, not a judge**: it reports a signed fact; Maria's rule decides what happens.
- No DAO language. No "nobody built this" or "only TrustLogic" claims.
- No em-dashes in on-screen copy (or in any X / LinkedIn copy).
- Don't show the viewer a claim they didn't actually see happen on screen. If a caption says something, a screen must show it.
- Keep it simple enough for non-AI, non-payments people. Short captions; one idea per step.
- Each screen shows only what its owner could see (e.g. TripMate can't see Planner AI or the registry; the bank can't see the credit card).

## Known limits / good next tasks

1. Turn `src/engine.js` into an ES module with JSDoc types (or TypeScript) while keeping the single-file build output.
2. Add `tests/walk.py` assertions for expected decisions per step (today it prints captions and checks for errors).
3. CI (GitHub Actions): build, engine tests, Playwright walk on all three.
4. Demo 1 and Demo 3 bank app: add the "Rules" and "Activity" tabs (currently decorative).
5. Credit card issuer is not modeled; card purchases are AI-checked only. Keep it that way unless asked.
6. Not in scope for these demos: the stationary trustee / reissued beneficiary architecture. That gets its own demo.
