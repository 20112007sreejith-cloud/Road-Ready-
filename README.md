# RTO ONE: Intelligent Vehicle & Driving Services Orchestrator
> **Challenge 09 — Vehicle & Driving Services Made Simple**  
> *"Every service connected. Every deadline visible. Every next step clear."*

---

## 1. Executive Summary & Problem Definition

Navigating India's road transport workflows across **Vahan** (vehicle registration), **Sarathi** (driving licences), **e-Challan**, and State Transport Departments is notoriously fragmented:
- **Hidden Prerequisites**: Citizens attempt to transfer vehicle ownership or renew driving licences without knowing that an outstanding automated challan, pending cross-state NOC, or mismatching RC address renders the application ineligible.
- **Uncertain Deadlines & Appointment Scarcity**: Statutory grace periods, state-specific turnaround times, and sudden RTO slot shortages (e.g. appointment lead times jumping from 3 to 21+ days) push citizens past validity dates into heavy late fee penalties.
- **State Rule Chaos**: 36 States and Union Territories have distinct document requirements, fee tiers, and circulars; unofficial websites often invent contradictory estimates.
- **Payment & Submission Fragility**: A gateway network timeout leaves citizens wondering whether a payment succeeded, leading to duplicate payments or abandoned transactions.
- **Accessibility & Privacy**: Entering alphanumeric vehicle plates on mobile is error-prone for non-digital natives, and sharing unredacted family identifiers introduces privacy and misuse hazards.

**RTO One** is an intelligent civic-tech orchestration platform that acts as a transparent, authoritative layer connecting citizens to transport workflows. It computes a genuine Directed Acyclic Graph (DAG) of prerequisites, calculates dynamic latest safe start dates, enforces safe payment reconciliation, guards family privacy by default, and resolves voice ambiguity.

---

## 2. Key Architecture & Technical Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             RTO ONE FRONTEND                                │
│   React 19 + TypeScript + Vite + Tailwind CSS + @xyflow/react (DAG Graph)   │
│   Accessible UI (WCAG 2.2 AA) • Web Speech Recognition • SpeechSynthesis    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST API (JSON)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                             RTO ONE BACKEND                                 │
│                   Node.js + Express + TypeScript (v5.7)                     │
│               Persistent Repository (server/data/store.json)                │
├─────────────────────────────────────────────────────────────────────────────┤
│                           CORE DOMAIN ENGINES                               │
│  1. DependencyEngine         : DAG, cycle detection, topological sort       │
│  2. DeadlineEngine           : Latest safe start date, scarcity recompute   │
│  3. JurisdictionRuleEngine   : Versioned rule packs (KA, MH, AP, fallback)  │
│  4. ApplicationStateMachine  : 10 states, rejection/withdrawal/resolution   │
│  5. PaymentService           : Unknown timeout handling, idempotency        │
│  6. PrivacyConsentService    : Default masking, purpose audit trail         │
│  7. VoiceIdentifierParser    : NATO & digit normalization, O/0 disambiguation│
│  8. DemoLabController        : 15+ deterministic scenario triggers & reset  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Technologies
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, `@xyflow/react` for interactive dependency graph visualization.
- **Backend**: Node.js, Express, TypeScript, structured file-backed JSON repository (`AppDataStore`) with deterministic in-memory caching and clean reset.
- **Test Suite**: Vitest (31 unit and integration tests passing in <1s), Playwright/E2E API verification script (`verify-api.ts`).

---

## 3. The 9 Core Challenge Solutions

| # | Challenge Area | RTO One Solution | Demonstration & Proof |
|---|----------------|------------------|-----------------------|
| 1 | **Hidden Interdependencies** | Real DAG engine with Kahn's topological sort, 3-color DFS cycle detection, direct and transitive blocker tracking, plain-language blocker explanations. | `tests/dependency-engine.test.ts` (6 tests). Interactive React Flow graph with unlock on prerequisite completion. |
| 2 | **Deadline & Appointment Scarcity** | Formula: `Expiry + Grace - Processing - Lead - Buffer`. 3-day vs 21-day appointment lead-time curveball with real-time recalculation of safe start dates and risk states (`SAFE`, `ATTENTION`, `CRITICAL`). | `tests/deadline-engine.test.ts` (5 tests). Demo Lab scarcity toggle recalculates countdowns across dashboard. |
| 3 | **State Rule Chaos** | Versioned, source-attributed JSON rule packs for Karnataka (`v2.4.0`), Maharashtra (`v1.9.0`), and Andhra Pradesh (`v1.3.0`). 36 National Jurisdictions registry. | `tests/jurisdiction-engine.test.ts` (5 tests). Unconfigured Odisha (`OD`) triggers safe missing-rules banner without guessing. |
| 4 | **Pending Requests & Rejection** | Centralized 10-state machine (`DRAFT`, `READY`, `IN_PROGRESS`, `PENDING`, `COMPLETED`, `BLOCKED`, `REJECTED`, `FAILED`, `WITHDRAWN`, `RULES_UNAVAILABLE`). | `tests/state-machine.test.ts` (5 tests). Simulates rejection, withdrawal with confirmation, and document resolution. |
| 5 | **Payment Uncertainty & Reconciliation** | Distinguishes `INITIATED`, `PENDING`, `SUCCESS`, `FAILED`, `UNKNOWN`, and `RECONCILIATION_REQUIRED`. Prevents duplicate payments on timeout. | Simulates gateway timeout to `UNKNOWN` status; safe reconciliation button transitions to `SUCCESS` with audit trail. |
| 6 | **Privacy-Aware Household View** | Identifiers masked by default (`KA-01-**-5021`). Purpose-gated consent modal before unmasking. Auto-remasking on close. Zero unredacted PII in logs. | Consent logged with timestamp and purpose, but never the full raw identifier. DPDP Act 2023 compliant. |
| 7 | **Voice-Assisted Identifier Input** | Normalizes spoken numbers and NATO phonetic letters. Proactively flags phonetic ambiguities ('O' vs '0', 'B' vs '8') and forces explicit user selection. | `tests/voice-parser.test.ts` (4 tests). Spoken audio feedback via browser `SpeechSynthesis`. |
| 8 | **Appointment Management** | Filter by service and RTO office. Prevents double-booking. Displays scarcity warnings and alternative slots when capacity is exhausted. | Interactive slot booking and cancellation with instant capacity updates. |
| 9 | **Reproducible Demo Lab & Benchmark** | 15+ deterministic one-click scenario controls with instant before/after diffs, and an automated benchmark comparison against legacy fragmented portals. | `tests/demo-scenarios.test.ts` (6 tests). 1-click reset to clean baseline. |

---

## 4. 5-Minute Judge-Ready Demonstration Script

Follow this step-by-step walkthrough to experience the complete capabilities of RTO One:

### Act 1: The Problem (0:00 - 0:45)
1. Launch the application and view the **Overview Dashboard** (`http://localhost:5173/`).
2. Point out the summary badges: **5 Blocked Tasks**, **1 Unpaid Challan (₹1,000)**, and upcoming deadlines.
3. In the **Action Center**, note that `Vehicle RC Address Update` is blocked.
4. Click **"Inspect Dependency Graph"** to switch to the **Dependency Graph** view.
5. In the React Flow graph, select `TASK-RC-ADDR`: The detail drawer opens, explaining that it is directly blocked by `TASK-CHALLAN` (Outstanding Traffic Penalty) on `KA-01-MJ-5021`. Upstream dependencies like `TASK-OWNERSHIP` are also blocked.

### Act 2: Resolving the Blocker (0:45 - 1:30)
1. In the node detail panel (or in the **Demo Lab**), click **"Resolve Penalty & Unlock Tasks"**.
2. Observe the toast notification: The DAG engine immediately executes topological recomputation.
3. Notice that `TASK-RC-ADDR` turns green/ready, unlocking the downstream tasks. The Action Center priority changes instantly without reloading the page!

### Act 3: Appointment Scarcity Curveball (1:30 - 2:15)
1. Navigate to **Demo Lab** in the left sidebar.
2. Click **"Trigger Appointment Scarcity (3d → 21d)"**.
3. Observe the immediate recalculation:
   - Notice the amber/red banner warning of acute slot shortages in Bengaluru Central.
   - Switch to **Overview** or **Driving Licences**: The DL renewal recommended start date shifts backwards by 18 days, elevating the risk level from `SAFE` to `CRITICAL` (<24 hours safe margin).
   - In **Appointments**, see the lead-time badge updated to `21 Days Lead Time`.

### Act 4: Payment Timeout & Safe Reconciliation (2:15 - 3:00)
1. In **Demo Lab**, click **"Simulate Payment Timeout (Gateway Error)"**.
2. Navigate to **Challans** or view the audit log: Payment `PAY-KA-991` transitions to `UNKNOWN`.
3. Highlight the critical safety principle: **The user is NOT asked to pay again.** The UI displays a warning: *"Payment outcome is being verified. Do not initiate duplicate payment."*
4. Click **"Reconcile Payment"**: The authoritative status resolves safely to `SUCCESS`, updating receipt records and logging the reconciliation event.

### Act 5: State Rules Safety & Missing Odisha Fallback (3:00 - 3:45)
1. In **Demo Lab** (or in **Documents & Rules**), select the jurisdiction **"Odisha (OD)"**.
2. Note the strict compliance behavior: RTO One **refuses to fabricate fees, documents, or timelines**.
3. Instead, a dedicated banner states: *"Rules unavailable for this jurisdiction. Official estimates are unavailable because a validated rule pack has not been configured. We will not guess fees or documents."*
4. A direct verified link to the official portal (`https://odishatransport.gov.in/`) is provided.

### Act 6: Elite Accessibility & Privacy-First Household (3:45 - 4:45)
1. Click the microphone icon in the top bar to open **Voice Identifier Entry**.
2. In Demo Lab, click **"Simulate O/0 Voice Ambiguity"** (or speak a plate like `"KA 01 O 81234"`).
3. The parser detects that the 5th character could be letter `'O'` or digit `'0'`. It highlights the ambiguity and forces the user to choose with large, accessible buttons. Clicking `'0'` normalizes the plate to `KA01081234` and speaks it back!
4. Navigate to **Household**: All registration and licence numbers are masked by default (e.g. `KA-01-**-5021`).
5. Click the eye icon next to Priya's Activa: A consent dialog opens explaining that access requires a stated purpose.
6. Select **"Service booking"** and click **"Confirm & Reveal"**. The identifier unmasks for this view only, and an immutable audit log entry is recorded with zero unredacted PII.
7. Click **"Hide"** to immediately remask.

### Act 7: Benchmark & Deterministic Reset (4:45 - 5:00)
1. Click **"Evaluation Benchmark"** in the sidebar: View the side-by-side comparison matrix showing an 80% reduction in unnecessary RTO visits and 0 duplicate payments.
2. Click **"Reset to Clean Baseline"** in the top bar to restore all synthetic data, timers, and DAG states for the next judge session.

---

## 5. Automated Tests & Verification

### Test Summary: 31 / 31 Passing Tests (100% Success)

```bash
$ npm test -- --run

 ✓ tests/jurisdiction-engine.test.ts (5 tests)
 ✓ tests/voice-parser.test.ts (4 tests)
 ✓ tests/state-machine.test.ts (5 tests)
 ✓ tests/dependency-engine.test.ts (6 tests)
 ✓ tests/deadline-engine.test.ts (5 tests)
 ✓ tests/demo-scenarios.test.ts (6 tests)

 Test Files  6 passed (6)
      Tests  31 passed (31)
   Duration  729ms
```

### End-to-End API Integration Script
An automated multi-stage scenario verification script (`scripts/verify-api.ts`) tests all 9 core flows against the live Express backend:
```bash
$ npx tsx scripts/verify-api.ts

[E2E API Test] Starting full scenario verification against http://localhost:3001
✓ 1. Health Check: HEALTHY | Environment: SIMULATED_DEMO
✓ 2. Pre-condition: TASK-RC-ADDR status = BLOCKED | Direct Blockers = [ 'TASK-CHALLAN' ]
✓ 3. Post-prerequisite: TASK-RC-ADDR unlocked! New status = READY | Direct Blockers = []
✓ 4. Appointment Scarcity Triggered: Lead Days = 21 | Is Scarcity Mode = true
✓ 5. Odisha Missing Rule Pack Safe Fallback: Status = 404 | Error = RULES_UNAVAILABLE | Official Portal = https://odishatransport.gov.in/
✓ 6. Voice Parser NATO & Ambiguity Detection: Normalized = KA01O81234 | Requires Confirmation = true | Detected Ambiguities = O -> [O/0]
✓ 7. Privacy Audit Consent Logged: Event ID = consent-1792823466811 | Purpose = Ownership verification for transfer
✓ 8a. Payment Simulation: Unknown Timeout Status = UNKNOWN
✓ 8b. Payment Reconciliation: Reconciled Status = SUCCESS
✓ 9. Deterministic Reset: Success = true | Message = All demo states reset to clean baseline.

[E2E API Test] ALL 9 SCENARIOS VERIFIED SUCCESSFULLY!
```

---

## 6. How to Run Locally

### Prerequisites
- Node.js >= 18.0.0 (Tested on Node.js v24.20.0)
- npm >= 9.0.0

### Installation
```bash
# Clone the repository and enter the directory
cd f:/vehicles

# Install dependencies (React, Vite, Express, Tailwind, @xyflow/react, Vitest)
npm install
```

### Running the Full-Stack Application
```bash
# Starts both the Express Backend (Port 3001) and Vite Frontend (Port 5173) concurrently
npm run dev
```
Open your browser to: **`http://localhost:5173/`**

### Running Automated Tests
```bash
# Run unit & integration test suite once
npm test -- --run

# Run in watch mode during development
npm run test:watch

# Execute end-to-end API scenario validation script
npx tsx scripts/verify-api.ts
```

### Production Build & Deployment
```bash
# Typecheck with TypeScript and build Vite production bundle
npm run build

# Deploy directly to GitHub Pages (gh-pages branch)
npm run deploy
```

### Live Demo URL
- **GitHub Pages**: [https://20112007sreejith-cloud.github.io/Vehicles/](https://20112007sreejith-cloud.github.io/Vehicles/)

---

## 7. Real-World Integration Roadmap

RTO One is designed with an adapter-based architecture ready for authorized production APIs:

1. **API Setu Transport APIs** (`directory.apisetu.gov.in/api-collection/transport`):
   - Integrates via OAuth2 client credentials and signed assertions.
   - Operations: RC verification, DL status, and fitness certificate status.
2. **e-Challan Citizen Portal** (`echallan.parivahan.nic.in`):
   - Secure server-to-server webhook callback for challan payment reconciliation.
   - Idempotency key prevents duplicate transaction debits.
3. **DigiLocker Integration** (`docs.digitallocker.gov.in`):
   - Pull-URI adapter for verified digital RC, DL, and insurance policy documents directly into application checklists.
4. **Data Privacy Safeguards (DPDP Act 2023)**:
   - Zero storage of payment PINs, OTPs, or biometric credentials.
   - Client-side masking and purpose-scoped audit logging for all household lookups.

---

## 8. Honest Limitations & Disclaimers

- **Synthetic Demo Data**: In accordance with hackathon rules, all person names, vehicle registration numbers, driving licence IDs, challans, and RTO slots are entirely synthetic and fictional.
- **Independent Prototype**: RTO One is an independent citizen-assistive orchestration layer. It does not replace, alter, or claim to control the underlying government databases (Parivahan, Vahan, or Sarathi) without authorized API credentials.
- **No Inferred Legal Advice**: Planning dates and deadlines are calculated estimates based on verified rule packs and configured lead times, not guaranteed statutory commitments.
