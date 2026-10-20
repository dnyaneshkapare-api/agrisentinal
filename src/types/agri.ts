/**
 * AgriSentinel AI — Domain Models & Type Contracts
 * Smart India Hackathon 2026 (Problem Statement 26131)
 * Maharashtra / Indian Field Conditions
 */

export type UserRole =
  | 'farmer'
  | 'extension_worker'
  | 'expert'
  | 'district_admin'
  | 'system_admin';

export type LanguageCode = 'en' | 'mr' | 'hi';

export type RiskBand = 'Monitor' | 'Watch' | 'Warning' | 'Critical';

export type IssueCategory =
  | 'disease'
  | 'pest'
  | 'nutrient_stress'
  | 'abiotic_stress'
  | 'chemical_injury'
  | 'healthy'
  | 'uncertain_other';

export type GrowthStage =
  | 'Emergence / Seedling'
  | 'Vegetative'
  | 'Branching'
  | 'Flowering'
  | 'Pod / Fruit Formation'
  | 'Maturity / Harvest';

export interface ImageQualityReport {
  passes_gate: boolean;
  blur_score: number; // 0-100 (higher is sharper)
  glare_score: number; // 0-100 (lower is better)
  distance_score: number; // 0-100 (optimal framing 60-90)
  occlusion_score: number; // 0-100 (lower is better)
  framing_score: number; // 0-100
  rejection_reasons: string[];
  corrective_actions: {
    en: string;
    mr: string;
    hi: string;
  }[];
}

export interface Hypothesis {
  issue_id: string;
  common_name: {
    en: string;
    mr: string;
    hi: string;
  };
  scientific_name: string;
  category: IssueCategory;
  confidence: number; // Calibrated 0.0 - 1.0
  severity_band: RiskBand;
  is_quarantine?: boolean;
}

export interface SaliencyRegion {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number;
  height: number;
  label: string;
  intensity: number; // 0.0 - 1.0
}

export interface Farmer {
  id: string;
  name: string;
  phone_masked: string;
  village: string;
  taluka: string;
  district: string;
  state: 'Maharashtra';
  consent_status: 'consented' | 'pending';
  preferred_language: LanguageCode;
}

export interface Plot {
  id: string;
  farmer_id: string;
  plot_name: string;
  crop: 'Soybean' | 'Cotton' | 'Tomato' | 'Grape' | 'Sugarcane';
  variety: string;
  sowing_date: string;
  growth_stage: GrowthStage;
  area_acres: number;
  coordinates: {
    lat: number;
    lng: number;
    accuracy_m: number;
  };
  soil_type: string;
  irrigation_type: string;
  active_risk_band: RiskBand;
  last_inspected: string;
}

export interface Observation {
  id: string;
  client_observation_id: string; // locally generated UUID
  plot_id: string;
  plot_name: string;
  farmer_name: string;
  crop: string;
  variety: string;
  growth_stage: GrowthStage;
  captured_at: string;
  image_url: string;
  thumbnail_data_uri?: string;
  quality_report: ImageQualityReport;
  symptoms: {
    leaf_spots: boolean;
    wilting: boolean;
    underside_spores: boolean;
    powder_or_rust: boolean;
    chewed_foliage: boolean;
    larvae_present: boolean;
    chlorosis_yellowing: boolean;
    notes: string;
  };
  voice_transcript?: {
    original: string;
    language: LanguageCode;
    summary: string;
  };
  sync_status: 'synced' | 'pending_sync' | 'retry_failed';
  idempotency_key: string;
}

export interface EvidenceFusionLedger {
  weather_anomaly: {
    status: 'normal' | 'anomaly_detected';
    rh_avg: number;
    temperature_c: number;
    recent_rain_mm: number;
    anomaly_summary: string;
  };
  crop_stage_vulnerability: {
    vulnerability_index: number; // 0.0 - 1.0
    stage: GrowthStage;
    description: string;
  };
  spatial_clustering: {
    nearby_validated_cases_count: number;
    cluster_radius_km: number;
    closest_case_distance_km: number;
    dominant_cluster_issue: string;
  };
  plot_history: {
    past_recurrence_flag: boolean;
    last_season_issue?: string;
    soil_pathogen_risk: 'low' | 'moderate' | 'high';
  };
  evidence_score: number; // fused score 0-100
  converging_signals_count: number;
}

export interface Diagnosis {
  id: string;
  observation_id: string;
  case_id: string;
  model_version: string;
  crop?: string;
  growth_stage?: string;
  top_hypothesis: Hypothesis;
  alternative_hypotheses: Hypothesis[];
  raw_probability: number;
  calibrated_probability: number;
  farmer_risk_band: RiskBand;
  quality_gate_passed: boolean;
  abstain_reason?: string;
  uncertainty_score: number; // 0.0 - 1.0
  evidence_fusion: EvidenceFusionLedger;
  saliency_regions: SaliencyRegion[];
  validation_status: 'unvalidated' | 'expert_confirmed' | 'expert_rejected' | 'escalated_to_pathologist';
  validated_by?: string;
  validated_at?: string;
  validator_remarks?: string;
}

export interface SpatialHotspotNode {
  id: string;
  plot_id: string;
  village: string;
  taluka: string;
  farmer_name: string;
  crop: string;
  coordinates: { lat: number; lng: number };
  active_issue: string;
  risk_band: RiskBand;
  raw_probability: number;
  validation_status: Diagnosis['validation_status'];
  cluster_id?: string;
  priority_score: number; // Expected Impact × Uncertainty × Spread Potential
}

export interface OutbreakExposureEdge {
  id: string;
  source_plot_id: string;
  target_plot_id: string;
  distance_km: number;
  exposure_vector: 'wind_corridor' | 'irrigation_drainage' | 'shared_harvester' | 'proximity';
  exposure_weight: number; // 0.0 - 1.0
}

export interface PriorityQueueItem {
  case_id: string;
  plot_id: string;
  plot_name?: string;
  village: string;
  farmer_name: string;
  crop: string;
  suspected_issue: string;
  raw_probability: number;
  risk_band: RiskBand;
  expected_impact: number; // 1 - 10
  uncertainty: number; // 0.0 - 1.0
  spread_potential: number; // 1 - 10
  priority_score: number; // calculated metric
  submitted_at: string;
  validation_status: Diagnosis['validation_status'];
  requires_expert_visit: boolean;
}

export interface DigitalTwinTimelineEvent {
  day_offset: number; // e.g. Day -14 to Day 0
  date: string;
  title: string;
  category: 'baseline' | 'weather' | 'observation' | 'hotspot' | 'validation' | 'intervention' | 'followup';
  description: string;
  severity: RiskBand;
  actor: string;
  metrics?: { label: string; value: string }[];
}

export interface ProtectionProduct {
  product_id: string;
  product_name: string;
  active_ingredient: string;
  product_class: 'botanical' | 'biological' | 'fungicide' | 'insecticide';
  irac_frac_group: string; // e.g., "FRAC Group 11 (QoI)" or "IRAC Group 28 (Diamide)"
  formulation: string; // e.g., "25% WG", "18.5% SC"
  hazard_class: 'Green (Cautionary)' | 'Blue (Moderately Toxic)' | 'Yellow (Highly Toxic)';
  registered_crops: string[];
  banned_flag: boolean;
  authority_source: string; // e.g., "CIB&RC Registered Products List 2025-26"
  source_url: string;
  version: string;
  last_verified_at: string;
  verification_status: 'TODO: verify with agronomist' | 'verified_by_agronomist';
}

export interface ProtectionRule {
  rule_id: string;
  issue_id: string;
  issue_name: string;
  crop: string;
  stage_range: string;
  severity_range: RiskBand[];
  action_type: 'cultural' | 'biological' | 'botanical' | 'chemical';
  product_id?: string;
  product?: ProtectionProduct;
  action_title: {
    en: string;
    mr: string;
    hi: string;
  };
  dose_text: string;
  water_volume_text: string;
  interval_days: number;
  phi_days: number; // Pre-Harvest Interval
  rei_hours: number; // Re-Entry Interval
  ppe_text: string;
  max_applications_per_season: number;
  resistance_rotation_hint: string;
  toxicity_warning: string;
  valid_regions: string[];
  authority_source: string;
  version: string;
  requires_validation_bool: boolean;
  verification_status: 'TODO: verify with agronomist' | 'verified_by_agronomist';
}

export interface CropProtectionResponse {
  case_id: string;
  diagnosis_id: string;
  crop: string;
  issue_name: string;
  risk_band: RiskBand;
  gated_chemical_allowed: boolean;
  abstain_state: boolean;
  abstain_reason?: string;
  ipm_pathway: {
    step_1_monitoring: {
      etl_threshold: string;
      scouting_protocol: string;
    };
    step_2_cultural: ProtectionRule[];
    step_3_biological_botanical: ProtectionRule[];
    step_4_chemical_last_resort: ProtectionRule[];
  };
  resistance_rotation_guidance: string;
  safety_disclaimer: string;
  authority_verification_notice: string;
  requires_expert_validation: boolean;
  rule_version: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_role: UserRole;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string;
  previous_hash: string;
  entry_hash: string;
}
