# AgriSentinel AI: Architectural Specification & 4-Layer Separation

**Project:** AgriSentinel AI (Smart India Hackathon 2026, Problem Statement 26131)  
**Reference Document:** PS 26131 Blueprint & Section 4 Architectural Principles  

---

## 1. System Overview

AgriSentinel AI is not a point-in-time leaf photo classifier. It is a **Crop-Health Early-Warning and Decision Platform** designed for Maharashtra field conditions. The architecture fuses visual symptoms, microclimatic anomalies, phenological crop vulnerability, and spatial cluster dynamics into a continuously updated digital twin, closing the loop with extension-worker and pathologist validation.

---

## 2. The Four-Layer Separation (§4)

A fundamental architectural mandate of AgriSentinel AI is the strict decoupling of its four functional layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      LAYER 1: PERCEPTION MODELS                        │
│   • Optical Quality Gate (Blur, Glare, Distance, Framing, Occlusion)   │
│   • Multimodal Vision Classifier (ViT / MobileNet ONNX Calibrated)     │
│   • Differential Hypotheses + Saliency Bounding Heatmaps               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Top-k Hypotheses + Quality Metrics
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   LAYER 2: RISK & FORECAST MODELS                      │
│   • Context Evidence Fusion (Microclimate RH, Rain, Temp Anomaly)      │
│   • Phenological Stage Vulnerability (e.g. R3 Pod Fill vs Vegetative)  │
│   • Spatial Cluster Graph & Vector Exposure (Wind, Drainage, Proximity)│
│   • Calibrated Probabilities vs Categorical Bands (Monitor/Watch/Warn) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Fused Risk Score + Spatial Clusters
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     LAYER 3: DECISION ENGINE (RULES)                   │
│   • Safe-Action Optimizer (CIB&RC Registered Schedule Database)        │
│   • Non-Chemical IPM First (Scouting ETL → Cultural → Biological)      │
│   • Chemical LAST RESORT (Strictly Gated on Evidence & Expert Review)  │
│   • IRAC / FRAC Resistance Rotation & Mandatory Safety Blocks          │
│   * Generative AI is NEVER the source of treatment decisions           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Structured IPM Pathway + Audit Entry
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  LAYER 4: COMMUNICATION & VALIDATION                   │
│   • Extension Worker Priority Queue (Impact × Uncertainty × Spread)    │
│   • Senior Plant Pathologist Validation Interface & Field Remarks      │
│   • Multilingual Farmer Interface (मराठी, हिंदी, English)              │
│   • Day +7 Re-Observation Task Scheduling & Follow-Up Closed Loop      │
└────────────────────────────────────────────────────────────────────────┘
```

### Architectural Guardrails:
1. **Zero Hallucinated Prescriptions:** Generative models (e.g., LLMs) are strictly confined to human language translation or natural phrasing of pre-validated rule strings. They are prohibited from altering, generating, or guessing product names, doses, PHI, or active ingredients.
2. **Abstain and Escalate Principle (§2.5):**
   ```
   IF quality_gate_failed    → RECAPTURE (Never classify blurry images)
   ELSE IF confidence < 0.65 → ESCALATE (Flag as uncertain, lock chemicals)
   ELSE IF evidence_conflict → ESCALATE (Defer to extension pathologist)
   ELSE                      → CONTINUE to Risk & Decision Pipeline
   ```

---

## 3. End-to-End Pipeline

```
[1. Field Capture]
    │ Farmer or extension assistant captures abaxial leaf photo with GPS + variety + stage.
    ▼
[2. Optical Quality Gate]
    │ Laplacian blur detection, glare analysis, distance/scale verification.
    │ Pass -> proceed. Fail -> immediate corrective recapture request.
    ▼
[3. Vision Inference]
    │ Calibrated ViT / MobileNet ONNX baseline generates top-k hypotheses + saliency regions.
    ▼
[4. Context Evidence Fusion]
    │ Microclimate weather telemetry (RH > 85%, rain anomaly) + R3 crop stage vulnerability.
    ▼
[5. Risk Forecasting]
    │ Fused risk score calculated; raw probability mapped to farmer risk band (Monitor/Watch/Warning/Critical).
    ▼
[6. Spatial Cluster Check]
    │ PostGIS / Graph Worker correlates proximity, downwind vectors, and active local cases.
    ▼
[7. Safe-Action Decision Engine]
    │ Evaluates CIB&RC rule database: Monitoring (ETL) -> Cultural -> Biological -> Chemical (gated).
    ▼
[8. Human Validation Workflow]
    │ Case queued for Block Extension Officer / KVK Pathologist confirmation and audit logging.
    ▼
[9. Follow-Up Loop]
    │ Automated Day +7 re-observation task created to verify canopy recovery.
    ▼
[10. Continuous Learning]
    │ Validated cases and field outcomes feed back into regional risk priors and calibration sets.
```
