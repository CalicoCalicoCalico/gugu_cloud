# Designing State & Fields — A Step-by-Step Template

A reusable guide for deciding **what fields an object/class needs**, in an order that
stops you from missing the important ones. Written so a teammate can follow it cold,
**without searching anything online** — the reference tables you need are built in.

---

## The one idea behind everything

**You do not brainstorm fields. You derive them.**

Missing fields happen when you invent state from imagination. They stop happening when
every field is _forced into existence_ by one of two things:

1. **Something visible on screen** — it must have data behind it, or it couldn't render.
2. **Something an interaction reads or writes** — a click, a key, a timer, a collision.

If a visible element or interaction has no field behind it, **that's a missing field.**
Every step exists to make that gap obvious.

---

## DATA vs STATE — settle this first (the #1 junior mistake)

|                      | **DATA** (static config)               | **STATE** (mutable runtime)                 |
| -------------------- | -------------------------------------- | ------------------------------------------- |
| Changes during play? | Never                                  | Yes                                         |
| Examples             | coin value, sprite sizes, level layout | player position, score, coin collected?     |
| Where it lives       | `DATA.*`, constants                    | `STATE.*`                                   |
| Needs invariants?    | No (it's a constant)                   | **Yes — every field gets the 7-point spec** |

_"Would two players see the same value at game start?"_ → DATA. _"Does it differ as
they play?"_ → STATE.

---

## Step 0 — Triage (30 sec): how much process do I need?

| #   | Question                                                           | Yes? |
| --- | ------------------------------------------------------------------ | ---- |
| 1   | Does this operation change **2+ pieces of state at once**?         |      |
| 2   | Does it touch **money or inventory** (anything the player "owns")? |      |
| 3   | Does it **persist state across a scene/map change**?               |      |
| 4   | Does it introduce **a system that doesn't exist yet**?             |      |

| Yeses | Risk       | What you run                                                  |
| ----- | ---------- | ------------------------------------------------------------- |
| 3–4   | **HIGH**   | Full sequence (Steps 1–11). ~45–60 min before code.           |
| 1–2   | **MEDIUM** | Steps **1, 4, 5, 6, 9, 10** only. ~25 min.                    |
| 0     | **LOW**    | Re-read invariants of state you'll touch. Code. Test. ~5 min. |

**Always do, even on LOW:** atomicity thinking for any 2+ state op (Step 4); re-read the
invariants of state you modify (Step 6).

---

## The full sequence at a glance

| Step                            | You produce       | Catches                                |
| ------------------------------- | ----------------- | -------------------------------------- |
| 1 Purpose                       | One sentence      | Scope creep                            |
| 2 Visible elements              | Table             | Forgotten data behind UI               |
| 3 Interactions                  | Table             | Forgotten triggers                     |
| 4 Transactions                  | Table             | Half-applied changes / corruption      |
| 5 Derive state                  | List of nouns     | Invented or missing fields             |
| 6 **Field spec (7 invariants)** | Block per field   | Wrong types, null crashes, drift       |
| 7 Operations                    | Block/line per op | Bad ordering, missing failure handling |
| 8 Bug scenarios                 | List              | Edge cases before they ship            |
| 9 Unit tests                    | List              | Regressions                            |
| 10 Open questions               | Table             | Decisions made by accident             |
| 11 Lock & code                  | Status flip       | Designing while coding                 |

**Where your specific concerns land:**

- **Nullable** → Step 6, invariant #3.
- **Bug scenarios** → Step 8, derived from Step 4 failures + Step 6 domain limits.
- **Unit tests** → Step 9, derived from Step 6 invariants + Step 7 failures + Step 8 bugs.

---

## Running example (kept deliberately tiny)

> Player moves around a field. Walking into a single coin collects it and adds 1 to the
> score; the coin then disappears.

Small enough to hold in your head, but it still has a moving character, a collision, a
transaction (score + coin together), a number, a boolean, and a nullable question.

---

## Step 1 — Purpose (2 min)

One sentence. If it needs "and" twice, it's two systems — split it.

**Template — copy this:**

```
"<subject> <does what> so that <result>."
```

**Example:**

> "Player walks into the coin to collect it, adding 1 to the score."

Stop when the sentence exists. Don't polish.

---

## Step 2 — Visible elements (5 min)

Walk the mockup. List **every** visible thing.

**Template — copy this:**

| Element | Kind (img/number/array/button…) | Changes / moves? | Already exists? |
| ------- | ------------------------------- | ---------------- | --------------- |
|         |                                 |                  |                 |

**Example:**

| Element          | Kind       | Changes / moves?          | Already exists? |
| ---------------- | ---------- | ------------------------- | --------------- |
| Player character | img/sprite | moves with keys           | No              |
| Coin             | img/icon   | disappears when collected | No              |
| Score            | number     | increases by 1            | No              |

Stop when every visible thing has a row. _Each row demands a field in Step 5._

---

## Step 3 — Interactions (5 min)

For every interactive element from Step 2, list each trigger. Include keyboard, clicks,
**timers firing**, and **scene entry** — not just clicks.

**Template — copy this:**

| Element | Trigger | Function | Input | What happens (state changes) |
| ------- | ------- | -------- | ----- | ---------------------------- |
|         |         |          |       |                              |

**Example:**

| Element     | Trigger        | Function          | Input | What happens                    |
| ----------- | -------------- | ----------------- | ----- | ------------------------------- |
| Player      | Arrow key down | `movePlayer(dir)` | dir   | `player.x/y` change             |
| Player↔coin | boxes overlap  | `collect()`       | —     | coin marked collected; score +1 |

Stop when every interactive element from Step 2 has at least one row.

---

## Step 4 — Transactions (5 min) — DO NOT SKIP

For each Step-3 row, ask: **does it change 2+ state pieces?** If yes, write a row. The
last two columns are your future bug list.

**Template — copy this:**

| Operation | State A change | State B change | If A fails | If B fails |
| --------- | -------------- | -------------- | ---------- | ---------- |
|           |                |                |            |            |

**Example:**

| Operation   | State A change          | State B change | If A fails           | If B fails                    |
| ----------- | ----------------------- | -------------- | -------------------- | ----------------------------- |
| `collect()` | `coin.collected = true` | `score += 1`   | abort, add no points | (clamp; can't fail in-memory) |

Two state pieces → it's a transaction → needs atomicity (Step 6 #7) and a mutation order
(Step 7). Stop when every multi-state op has a row.

---

## Step 5 — Derive state (5 min): just the nouns

**Do not invent — walk the tables:**

- **Per visible element (Step 2):** what data, when changed, makes it render differently?
- **Per interaction (Step 3):** what does the trigger read or write?

Already in STATE? Skip. Otherwise add it. Group repeated structure into objects. No types yet.

**Template — copy this:**

```
DATA.<NAME> = { … }              // static config, if any
STATE.<name> = { … } / value
```

**Example:**

```
DATA.COIN_VALUE = 1                       // static
STATE.player = { x, y, w, h }
STATE.coin   = { x, y, collected }
STATE.score  = 0
```

Stop when **every** Step-2 element has backing state **and every** Step-3 trigger has a
state piece it reads/writes. That double-check is the anti-missing-field gate.

---

## Step 6 — Field spec: the 7 invariants (10 min per state) ★ the core

Fill all seven for each **new** STATE object. Writing `??` is allowed — it becomes an
open question (Step 10).

**Template — copy this:**

```
### STATE.<name>
1. Type:          number / string / boolean / array / object {…}
2. Domain:        which values are legal  (use the table below)
3. Nullable when: can it be null / undefined / empty? when? what does that mean?
4. Relationships: what other state must it AGREE with (sum-of, mirror-of, derived-from)?
5. Lifecycle:     created when? reset when? destroyed when?
6. Mutators:      which functions may WRITE it? (everything else is read-only)
7. Atomicity:     what other state must change in the SAME operation?
```

### Domain reference — legal-value shapes (no lookup needed)

Pick the type, then pick the constraints that apply. This is the whole point of "write a
dev doc without searching."

**Numbers** — combine a sign rule + an integer rule + a bound + (optionally) an allowed set:

| Constraint kind      | Options you can write                                       | Game example                        |
| -------------------- | ----------------------------------------------------------- | ----------------------------------- |
| Sign                 | `≥ 0`, `> 0`, `≤ 0`, `< 0`, `≠ 0`, any                      | score `≥ 0`; damage `> 0`           |
| Integer-ness         | integer only · decimals allowed                             | count = integer; velocity = decimal |
| Bounds               | `[min, max]` inclusive · one-sided `[0, ∞)` · open `(0, 1)` | x `∈ [0, fieldW − w]`               |
| Allowed set          | specific values `{1, 3, 5}` · multiples of N                | tile size `∈ {16, 24, 32}`          |
| Special-value safety | must be **finite** (exclude `NaN`, `±Infinity`)             | any computed value                  |

Common number _roles_ and their usual domain (steal these):

| Role                  | Usual domain                                                |
| --------------------- | ----------------------------------------------------------- |
| Count / score / lives | integer, `≥ 0`                                              |
| Position (x, y)       | decimal, clamped to field bounds                            |
| Index into an array   | integer, `∈ [0, length − 1]`, or `null` if nothing selected |
| Ratio / fill %        | `∈ [0, 1]` (or `[0, 100]`)                                  |
| Timer / countdown     | `≥ 0`, counts down to 0 then fires                          |
| Velocity / delta      | decimal, any sign, finite                                   |

**Strings:**

| Constraint kind  | Options                                    | Example                             |
| ---------------- | ------------------------------------------ | ----------------------------------- |
| Enum (fixed set) | one of `{…}`                               | `status ∈ {"playing","won","lost"}` |
| ID reference     | must be a **key in `DATA.X`**              | `itemId ∈ keys(DATA.ITEM_TYPES)`    |
| Free text        | non-empty · length `≤ N` · charset/pattern | name: 1–12 chars, alphanumeric      |

**Boolean:** `true` / `false` only. ⚠ Trap: if there's a meaningful _third_ state
(unknown / not-yet-loaded), it isn't a boolean — make it an enum instead.

**Arrays:**

| Constraint kind | Options                               | Example                       |
| --------------- | ------------------------------------- | ----------------------------- |
| Length          | non-empty · `≤ N` · fixed length      | items `≤ 6`                   |
| Elements        | each element satisfies its own domain | every item has a valid `type` |
| Uniqueness      | no duplicate ids                      | unique `id` per item          |
| No holes        | no `null`/`undefined` gaps            | dense array                   |

**Objects `{…}`:** every field satisfies its own domain (recurse), required keys are
present, and write any **cross-field rule** here (e.g. `current ≤ goal`, `x` and `w` keep
the box on-screen).

> **One-line recipe:** _base type → sign/bounds or allowed set → integer or decimal →
> any relationship to other state._ Example: `score` = "integer, ≥ 0".

### Examples (two fields, to show a number, a boolean, and nullable)

```
### STATE.score
1. Type:          number
2. Domain:        integer, ≥ 0
3. Nullable when: never null; starts at 0 (0 is "empty", not null)
4. Relationships: equals the number of coins collected (1 each)
5. Lifecycle:     created at game start; reset to 0 on restart
6. Mutators:      addScore() only — collision code calls it, never writes score directly
7. Atomicity:     increases in the same op as setting coin.collected = true
```

```
### STATE.coin
1. Type:          object { x: number, y: number, collected: boolean }
2. Domain:        x ∈ [0, fieldW − w]; y ∈ [0, fieldH − h]; collected ∈ {true, false}
3. Nullable when: the object always exists; once collected === true it just renders
                  nothing (invisible ≠ null). Only goes null if the level has no coin.
4. Relationships: collected === true  ⇒  score was incremented exactly once for it
5. Lifecycle:     created at game start; collected resets to false on restart
6. Mutators:      collect() sets collected; spawnCoin() sets x,y
7. Atomicity:     collected flips in the same op as the score increment
```

Stop when every new state has seven lines (some may be `??`).

---

## Step 7 — Operations (10 min)

Transactions get a full block; non-transactions get one line.

**Template — copy this:**

```
### <opName>(args)   [transaction]
- Precondition: <what must be true to run>
- Failure: <condition> → <abort / fallback>
- Mutation order: (1) … (2) …
    Rationale: <why this order leaves state consistent if a step fails>
- Re-renders: <which views redraw>

- <simpleOp>(args): <one line — what it reads/writes, no failure mode>
```

**Example:**

```
### collect()   [transaction]
- Precondition: coin.collected === false  AND  player box overlaps coin box
- Failure: coin already collected → abort, add no score
- Mutation order: (1) coin.collected = true   (2) addScore(DATA.COIN_VALUE)
    Rationale: flipping the flag first means a re-collision in the same frame fails
    the precondition, so score can't be added twice.
- Re-renders: coin layer, score

- movePlayer(dir): writes player.x/y, clamps to field bounds, no failure mode
```

Stop when every operation has a block or a line.

---

## Step 8 — Bug scenarios (5 min): read them off, don't imagine them

Each comes mechanically from an earlier table.

**Template — copy this:**

| Source | Bug scenario | Guard |
| ------ | ------------ | ----- |
|        |              |       |

**Example:**

| Source                    | Bug scenario                              | Guard                                       |
| ------------------------- | ----------------------------------------- | ------------------------------------------- |
| Step 4 "If A fails"       | Double collect (collision fires 2 frames) | check `collected` flag first                |
| Step 6 #2 domain (lower)  | Score goes negative                       | n/a here, but clamp at 0 if penalties added |
| Step 6 #4 relationship    | Score added but coin not hidden           | flip flag + add score in one op             |
| Step 2 (sprite vs hitbox) | Collision box ≠ visible sprite size       | define `w/h` explicitly; test AABB          |

Stop when each `??`, domain limit, and transaction-failure has a scenario.

---

## Step 9 — Unit tests (write before/with code)

One assertion per invariant + one per bug scenario. They're already listed — just phrase them.

**Template — copy this:**

```
<call / condition>  →  <expected state>          (source: invariant/step)
```

**Example:**

```
collect() when overlapping     → score === 1 AND coin.collected === true   (op + #7)
collect() when already collected → no-op, score unchanged                  (Step 8 double-collect)
movePlayer past edge           → x clamped within [0, fieldW − w]           (#2 position)
AABB(overlapping boxes) === true; (apart) === false                        (Step 8 hitbox)
```

If you can't write the test, the invariant (Step 6) wasn't precise enough — fix it there.

---

## Step 10 — Open questions, then decide blocking ones

Sweep the doc for `??`, "not sure," "TBD."

**Template — copy this:**

| Question | Tag (BLOCKING / NON-BLOCKING) |
| -------- | ----------------------------- |
|          |                               |

**Example:**

| Question                                             | Tag          |
| ---------------------------------------------------- | ------------ |
| Does the coin respawn after collection or stay gone? | BLOCKING     |
| Sound effect on collect?                             | NON-BLOCKING |

Decide every **BLOCKING** one (one line of answer + one line of why). Non-blocking can wait.

---

## Step 11 — Lock & code

Flip the header to `Status: DESIGNED, [date]`. Stop editing — the doc is reference now,
not a draft. Code against it.

---

## Quick-reference card

**Per-field checklist:** 1 Type · 2 Domain · 3 Nullable-when · 4 Relationships ·
5 Lifecycle · 6 Mutators · 7 Atomicity

**Domain one-liner:** base type → sign/bounds or allowed set → integer vs decimal →
relationship to other state.

**Workflow by risk:** HIGH = Steps 1–11 · MEDIUM = 1, 4, 5, 6, 9, 10 · LOW = re-read
invariants → code → test.

**Never skip:** atomicity for 2+ state ops; re-read invariants before touching state.

**Doc header template:**

```
# <feature> — Phase <N>
Status: DESIGNING        (→ DESIGNED when locked)
Risk: HIGH | MEDIUM | LOW
Started: <date>
```
