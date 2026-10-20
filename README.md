# AgriSentinel AI: Early-Warning & Decision Platform for Crop Health

> **Smart India Hackathon 2026** — Problem Statement 26131  
> *Early detection and management of crop diseases and pest infestations (Maharashtra / Indian Field Conditions)*

AgriSentinel AI is an AI crop-health early-warning and decision platform that fuses visual, environmental, temporal, and spatial evidence, closing the loop with extension-worker and plant pathologist validation.

---

## 1. Quick Start

### Installation & Run

```bash
# Install dependencies
npm install

# Run automated security and invariant tests
npm test

# Run type check and lint
npm run lint

# Start full-stack development server (Express API + Vite SPA)
npm run dev

# Build production bundle
npm run build
```

The application runs on `http://localhost:3000`.

---

## 2. Key Architecture & Differentiators

- **Not a Simple Leaf Classifier:** Turns isolated leaf observations into an interconnected crop-health intelligence network.
- **The Four-Layer Separation (§4):**
  1. *Perception Layer:* Optical quality gate + calibrated vision models.
  2. *Risk & Forecast Layer:* Context evidence fusion (microclimate RH, crop stage, spatial vectors).
  3. *Decision Engine (Rules):* Non-chemical IPM first; chemical last resort strictly gated on evidence and CIB&RC registration schedules. Generative AI never dispenses chemical doses.
  4. *Communication Layer:* Priority queue (`Impact × Uncertainty × Spread`), pathologist validation, and Marathi/Hindi/English UI.
- **Abstain and Escalate Principle (§2.5):**
  - Blurry / glary images trigger an immediate **Recapture Request** with corrective feedback; silent classification is prohibited.
  - Low confidence or conflicting signals trigger an **Abstain State** that locks chemical options until verified by an expert.
- **Crop-Protection Advisor (§6):**
  - Curated IPM ladder: Economic Threshold Level (ETL) $\to$ Cultural $\to$ Biological (Azadirachtin / Trichoderma) $\to$ Gated Chemical.
  - Full safety blocks: Active ingredient, IRAC/FRAC resistance group, label dose, water volume, Pre-Harvest Interval (PHI), Re-Entry Interval (REI), and mandatory PPE.
  - Seed rows marked `TODO: verify with agronomist`.
- **Expert Console (`/godmode` §6.5):**
  - Role-gated for `expert` and `system_admin`.
  - Non-experts receive a standard 404/403 denial.
  - Overrides require a recorded reason ($\ge 10$ chars) and append to an immutable SHA-256 audit ledger.

---

## 3. Environment Variables (`.env.example`)

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Server-side key for multimodal vision & reasoning |
| `APP_ENV` | `development` \| `staging` \| `production` |
| `PORT` | Server port (default: `3000`) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins allow-list |
| `JWT_SECRET` | Secret token signing key (min 32 characters in prod) |
| `DATABASE_URL` | PostgreSQL / PostGIS connection string (prod) |
| `REDIS_URL` | Redis URL for distributed rate limiting (prod) |

---

## 4. Documentation & Deliverables

- `docs/SECURITY_CHECKLIST.md` — Section 5 verification audit table (✅ 13/13).
- `docs/THREAT_MODEL.md` — Primary assets, actors, top 10 threats & defensive mitigations.
- `docs/architecture.md` — 4-layer separation and end-to-end data pipeline.
- `docs/api.md` — `/v1/*` endpoint schemas, query parameters, and RBAC matrix.
- `docs/model_card.md` — ML governance, calibration metrics, and drift monitoring.
- `.github/workflows/ci.yml` — Automated CI pipeline for lint, security, and build checks.
