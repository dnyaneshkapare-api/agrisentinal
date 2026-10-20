# AgriSentinel AI: Model Card & ML Governance Specification

**Model Version:** AgriSentinel-ViT-Fusion-v1.4  
**Date of Snapshot:** October 2026  
**Architecture:** Hybrid Vision Transformer (ViT-Small / MobileNetV4 backbone) + Context Evidence Fusion Engine  
**Target Domain:** Maharashtra Kharif Crops (Soybean, Cotton, Tomato) under realistic Indian field conditions  

---

## 1. Model Summary & Scope

- **Intended Use:** Assist agricultural extension officers, Krishi Vigyan Kendra (KVK) pathologists, and farmers in detecting and managing crop diseases and pest infestations early.
- **Out-of-Scope Use:** Autonomous chemical pesticide dispensing without human validation; medical or non-agricultural foliage classification; uncalibrated single-image conclusive diagnosis.

---

## 2. Evaluation Metrics (Held-Out Maharashtra Field Split)

Evaluated on realistic field images collected across Nashik, Ahmednagar, and Jalgaon districts (challenging lighting, partial occlusion, early-stage lesion morphology, abaxial leaf angles):

| Metric | Target Baseline | Evaluated Score | Definition & Relevance |
|:---|:---:|:---:|:---|
| **Macro-F1** | $\ge 0.85$ | **0.884** | Unweighted average F1 across all 12 issue classes. |
| **Balanced Accuracy** | $\ge 0.86$ | **0.891** | Robust across rare quarantine classes and common defoliators. |
| **Critical-Class False-Negative Rate** | $\le 0.08$ | **0.042** | Severe quarantine/epidemic diseases (e.g., Soybean Rust, Late Blight) missed. |
| **Expected Calibration Error (ECE)** | $\le 0.06$ | **0.038** | Temperature-scaled probability matches true empirical accuracy. |
| **Top-3 Diagnostic Accuracy** | $\ge 0.94$ | **0.962** | Top 3 hypotheses contain true pathogen. |
| **Forecast Brier Score (Outbreak Cluster)**| $\le 0.15$ | **0.118** | Spatial cluster emergence accuracy 5–7 days prior to peak. |

> **Lead-Time Evaluation Note (§7):** Early warning lead-time claims (5–7 days prior to peak canopy sporulation) are based strictly on held-out temporal splits across the 2024–2025 Kharif seasons correlating IMD microclimate relative humidity anomalies with subsequent field outbreak verification.

---

## 3. Class Taxonomy (Kharif Priority Scope)

1. **Soybean:**
   - *Phakopsora pachyrhizi* (Asian Soybean Rust) - Critical Fungal
   - *Spodoptera litura* (Tobacco Caterpillar) - Defoliator Pest
   - *Cercospora kikuchii* (Leaf Blight & Purple Seed Stain)
   - *Macrophomina phaseolina* (Charcoal Rot)
   - Healthy Soybean Canopy
2. **Cotton:**
   - *Pectinophora gossypiella* (Pink Bollworm)
   - *Xanthomonas citri pv. malvacearum* (Bacterial Blight)
   - Cotton Leaf Curl Virus (CLCuV)
   - Healthy Cotton Canopy
3. **Tomato:**
   - *Alternaria solani* (Early Blight)
   - *Phytophthora infestans* (Late Blight)
   - *Tuta absoluta* (Tomato Leafminer / Pinworm)
4. **General / Fallback:**
   - `uncertain_other` (Abstain state triggered when confidence $< 0.65$ or evidence signals conflict)

---

## 4. Optical Quality Gate Specifications

Before vision inference runs, every capture must pass the quality gate:
- **Sharpness Threshold:** Laplacian variance score $\ge 50/100$. Blurry images are rejected with an explicit recapture request.
- **Focal Distance:** Leaf area must occupy $\ge 40\%$ of image frame.
- **Glare & Specular Reflection:** Specular saturation ratio $\le 25\%$.
- **Rejection Policy:** Silent classification on bad images is prohibited. Recapture instructions are provided in Marathi, Hindi, and English.

---

## 5. Model Drift Indicators & Monitoring

The system monitors three continuous drift triggers:
1. **Prediction Shift:** Divergence in class prior distributions compared to seasonal expectations (monitored via Population Stability Index, PSI $\ge 0.2$).
2. **Pathologist Disagreement Rate:** Divergence between model top hypothesis and expert validation verdicts exceeding $12\%$.
3. **Uncertainty Spike:** Significant increase in average entropy or abstain rate across a geographic block, signalling novel pathogen strains or pesticide-induced phytotoxicity.
