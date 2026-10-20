# AgriSentinel AI: API Specification (`/v1`)

**Protocol:** HTTPS only  
**Base Path:** `/v1`  
**Authentication:** Bearer token or Cookie session with role context (`farmer`, `extension_worker`, `expert`, `district_admin`, `system_admin`)

---

## 1. Endpoints & RBAC Matrix

| Method | Endpoint | Allowed Roles | Description | Rate Limit |
|---|---|---|---|---|
| `GET` | `/api/health` | Public | Minimal safe health status | 120/min |
| `GET` | `/v1/risk/map` | All (Farmer gets coarse) | Spatial risk nodes & outbreak exposure edges | 60/min |
| `GET` | `/v1/alerts` | extension_worker, expert, admin | Priority triage alert queue | 60/min |
| `GET` | `/v1/plots/:id/health` | Owner farmer, extension, expert | Plot digital twin timeline & risk forecasts | 60/min |
| `GET` | `/v1/explain/:case_id` | Owner farmer, extension, expert | Explainable AI card & evidence fusion ledger | 60/min |
| `POST` | `/v1/diagnose` | farmer, extension, expert | Calibrated vision diagnosis with quality check | 20/min |
| `POST` | `/v1/observations` | farmer, extension | Field observation upload with idempotency | 30/min |
| `POST` | `/v1/validate` | expert, system_admin | Senior pathologist case validation verdict | 20/min |
| `POST` | `/v1/crop-protection/recommend` | farmer, extension, expert | IPM-first Crop Protection Advisor | 20/min |
| `GET` | `/v1/godmode/rules` | expert, system_admin only | Expert Crop-Protection Console (Rules & Products) | 30/min |
| `POST` | `/v1/godmode/override` | expert, system_admin only | Authorized rule override with mandatory reason | 15/min |
| `GET` | `/v1/audit/logs` | expert, district_admin, admin | Tamper-evident cryptographic audit ledger | 60/min |

---

## 2. Selected Request & Response Schemas

### 2.1 POST `/v1/diagnose`
Evaluates foliage image and fuses context to return calibrated hypotheses.

**Request Body:**
```json
{
  "crop": "Soybean",
  "growth_stage": "Pod / Fruit Formation",
  "variety": "JS-335",
  "symptoms": {
    "leaf_spots": true,
    "underside_spores": true,
    "chewed_foliage": true
  },
  "image_quality": {
    "blur_score": 88,
    "glare_score": 14,
    "distance_score": 82,
    "occlusion_score": 11
  }
}
```

**Response (200 OK):**
```json
{
  "id": "diag-1742080000",
  "case_id": "case-184",
  "model_version": "AgriSentinel-ViT-Fusion-v1.4",
  "top_hypothesis": {
    "issue_id": "soybean_rust",
    "common_name": {
      "en": "Soybean Rust",
      "mr": "सोयाबीन तांबेरा रोग",
      "hi": "सोयाबीन गेरुआ रोग"
    },
    "scientific_name": "Phakopsora pachyrhizi",
    "category": "disease",
    "confidence": 0.74,
    "severity_band": "Warning"
  },
  "alternative_hypotheses": [
    {
      "issue_id": "spodoptera_litura",
      "confidence": 0.68,
      "severity_band": "Watch"
    }
  ],
  "raw_probability": 0.81,
  "calibrated_probability": 0.74,
  "farmer_risk_band": "Warning",
  "quality_gate_passed": true,
  "uncertainty_score": 0.26,
  "validation_status": "unvalidated"
}
```

### 2.2 POST `/v1/crop-protection/recommend`
Generates safe, IPM-ordered crop-protection pathway with mandatory resistance rotation and safety blocks.

**Request Body:**
```json
{
  "case_id": "case-184",
  "crop": "Soybean",
  "issue_id": "soybean_rust",
  "risk_band": "Warning",
  "is_uncertain": false
}
```

**Response (200 OK):**
```json
{
  "case_id": "case-184",
  "crop": "Soybean",
  "issue_name": "Soybean Rust (Phakopsora pachyrhizi)",
  "risk_band": "Warning",
  "gated_chemical_allowed": true,
  "abstain_state": false,
  "ipm_pathway": {
    "step_1_monitoring": {
      "etl_threshold": "1 rust lesion per leaf on 5% of sampled plants during R1 to R5 stage.",
      "scouting_protocol": "Inspect lower and middle third of canopy across 5 sampling stations."
    },
    "step_2_cultural": [ ... ],
    "step_3_biological_botanical": [ ... ],
    "step_4_chemical_last_resort": [
      {
        "rule_id": "rule-rust-chem-03",
        "action_title": { "en": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC" },
        "dose_text": "1.0 mL per litre of water (200 mL per acre)",
        "water_volume_text": "500 litres of clean water per hectare",
        "phi_days": 30,
        "rei_hours": 24,
        "ppe_text": "Full protective chemical splash goggles, N95 respirator mask, nitrile gloves",
        "resistance_rotation_hint": "MANDATORY ROTATION: Do NOT repeat FRAC Group 11 sprays consecutively.",
        "toxicity_warning": "TOXIC TO AQUATIC FAUNA. Do NOT spray near open water bodies.",
        "verification_status": "TODO: verify with agronomist"
      }
    ]
  },
  "requires_expert_validation": true,
  "rule_version": "CIBRC-2025.10-SAFE"
}
```

### 2.3 POST `/v1/validate`
Used by authorized plant pathologists to record validation decisions.

**Request Body:**
```json
{
  "case_id": "case-184",
  "validation_status": "expert_confirmed",
  "validator_remarks": "Microscopic mount confirmed Phakopsora pachyrhizi urediniospores with sub-epidermal eruption."
}
```
