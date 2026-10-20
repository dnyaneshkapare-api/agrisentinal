# AgriSentinel AI: Threat Model & Risk Assessment

**Document Version:** 1.0.0  
**Target Environment:** Indian Agricultural Extension, Krishi Vigyan Kendra (KVK) Networks, District Agro-Advisory Cells (Nashik / Maharashtra)

---

## 1. Primary Assets

1. **Farmer PII & Geospatial Data:** Precise plot coordinates, land parcel records, phone numbers, crop yields, and socio-economic profiling.
2. **Crop-Health Diagnostic Pipeline:** Vision models, evidence fusion algorithms, calibration parameters, and outbreak prediction models.
3. **Pesticide & Treatment Decision Engine:** Knowledge base rules governing chemical doses, pre-harvest intervals, and toxicity warnings. An attack leading to fraudulent or toxic recommendations could cause crop failure, ecological damage, or acute farmer poisoning.
4. **Audit Log Ledger:** Cryptographically linked event ledger tracking case validations, expert overrides, and advisory dispatches.
5. **API & Cloud Infrastructure:** Server runtime, database, storage buckets, and model inference servers.

---

## 2. Threat Actors

- **Malicious External Actors / Hackers:** Opportunistic attackers scanning for misconfigured servers, open API keys, or SQL/command injection vectors.
- **Rogue / Unauthorized Pesticide Vendors:** Actors attempting to inject unapproved chemical products, alter label doses, or bypass the IPM safety ladder to drive commercial sales.
- **Compromised User Accounts:** Compromised farmer or extension worker accounts attempting unauthorized data harvesting or malicious status changes.
- **Untrusted Mobile Clients / Replay Attacks:** Unreliable network environments in remote villages leading to unintentional duplicate requests or replay injections.

---

## 3. Top 10 Threats & Implemented Mitigations

### T-01: Unauthorized Chemical Advisory Injection / Poisoning
- **Threat:** An attacker manipulates API requests to generate unverified or banned pesticide recommendations.
- **Mitigation:**
  - **Hard Rule Base Only:** Generative LLMs never formulate chemical prescriptions or dosages (§6.2 Rule 1).
  - All recommendations query a versioned, immutable table cross-checked against CIB&RC schedules.
  - Chemical recommendations are locked unless evidence quality gate passes and validated status exists.
  - Every advisory logs rule ID, version, and authority source in an append-only audit trail.

### T-02: Quality Gate Bypass & False Epidemic Trigger
- **Threat:** Submitting blurry, synthetic, or out-of-context images to trigger panic epidemic warnings or misdiagnoses.
- **Mitigation:**
  - Automated image-quality gate strictly checks blur (Laplacian variance), glare, focal distance, and framing scale before vision inference.
  - Recaptures are required on failure; silent classification is prohibited (§2.5).
  - Fusing weather anomalies, crop growth stage, and neighboring validated cases prevents false single-point triggers.

### T-03: Insecure Direct Object Reference (IDOR) on Farm Coordinates
- **Threat:** An authenticated farmer enumerating case IDs to inspect private crop yields and high-precision GPS coordinates of other landholders.
- **Mitigation:**
  - Server-side object-level ownership checks against derived session tokens.
  - Public map endpoints return coarse/fuzzed coordinates for non-admin/non-extension roles.

### T-04: Privilege Escalation & Admin Route Bypass (`/godmode`)
- **Threat:** A non-expert attempting to access the Expert Crop-Protection Console to modify pesticide rules.
- **Mitigation:**
  - Central role verification middleware denys access to non-experts (`expert` or `system_admin`).
  - Unauthorized users receive uniform 404/403 responses without route enumeration clues.
  - Overrides require a mandatory $\ge 10$-character recorded rationale and generate a SHA-256 hash in the audit ledger.

### T-05: Cross-Site Scripting (XSS) via Symptom Notes & Marathi Free-Text
- **Threat:** Injection of malicious script tags into farmer symptom questionnaires or pathologist notes.
- **Mitigation:**
  - Input text bounded and sanitized using Zod schemas.
  - Framework auto-escaping prevents HTML interpolation in React JSX.
  - Strict Content-Security-Policy (CSP) headers disallow untrusted external scripts.

### T-06: Denial of Service via High-Frequency Diagnosis Inference
- **Threat:** Flooding compute-heavy `/v1/diagnose` vision endpoints to exhaust server resources.
- **Mitigation:**
  - Sliding-window rate limiter enforces strict caps (15–20 req/min on diagnose and recommendation endpoints).
  - Request body payload capped at 10MB; oversized base64 payloads are rejected immediately with 413.

### T-07: Offline Sync Replay & Duplicate Ingestion
- **Threat:** Intermittent field network drops causing repeated retries and duplicate observation entries in extension queues.
- **Mitigation:**
  - Mandatory client-generated UUIDs and unique `idempotency_key` tokens on every observation submission.
  - Repeated submissions return the previously cached record with `already_processed` status without duplicate triage creation.

### T-08: Secret & API Key Leakage
- **Threat:** Exposing Gemini API keys, storage secrets, or database URLs in client-side bundles or git history.
- **Mitigation:**
  - All AI model calls and data queries run through server-side proxy routes. Zero client-side `NEXT_PUBLIC_` or `VITE_` secret prefixes.
  - `.env*` files excluded by `.gitignore`; fast-fail environment validator on startup.

### T-09: Cross-Origin Resource Sharing (CORS) Misconfiguration
- **Threat:** Arbitrary origin reflection allowing malicious web pages to execute authenticated cross-origin requests.
- **Mitigation:**
  - Origin allow-list strictly verified against `ALLOWED_ORIGINS` environment configuration; no wildcards (`*`).

### T-10: Audit Log Tampering / Repudiation
- **Threat:** An operator altering validation records after an incorrect pesticide application.
- **Mitigation:**
  - Append-only audit trail linking each entry to the previous entry's cryptographic hash (`previous_hash` $\to$ `entry_hash`).
  - Operator ID, role, client IP address, and timestamp are indelibly captured.
