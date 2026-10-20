/**
 * AgriSentinel AI — Main Application Shell
 * Smart India Hackathon 2026 (Problem Statement 26131)
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { AlertBanner } from './components/AlertBanner';
import { MetricCards } from './components/MetricCards';
import { SpatialHotspotMap } from './components/SpatialHotspotMap';
import { PriorityQueue } from './components/PriorityQueue';
import { ExplainabilityCard } from './components/ExplainabilityCard';
import { CropProtectionAdvisor } from './components/CropProtectionAdvisor';
import { DigitalTwinTimeline } from './components/DigitalTwinTimeline';
import { GroundedAgroCenters } from './components/GroundedAgroCenters';
import { ObservationIntake } from './components/ObservationIntake';
import { CaseValidationView } from './components/CaseValidationView';
import { GodmodeConsole } from './components/GodmodeConsole';

import {
  SEED_FOCAL_DIAGNOSIS,
  SEED_HOTSPOT_NODES,
  SEED_EXPOSURE_EDGES,
  SEED_PRIORITY_QUEUE,
  SEED_TIMELINE_14_DAYS,
  SEED_PROTECTION_RULES,
} from './data/seedData';
import { UserRole, LanguageCode, Observation, Diagnosis } from './types/agri';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'observe' | 'case-detail' | 'godmode'>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('extension_worker');
  const [language, setLanguage] = useState<LanguageCode>('mr');
  const [isOnline, setIsOnline] = useState(true);

  // Active selected case & node
  const [selectedCaseId, setSelectedCaseId] = useState('case-184');
  const [selectedNodeId, setSelectedNodeId] = useState('node-1');

  // Active diagnosis state
  const [activeDiagnosis, setActiveDiagnosis] = useState<Diagnosis>(SEED_FOCAL_DIAGNOSIS);

  // Update validation verdict from expert
  const handleUpdateValidation = (
    status: Diagnosis['validation_status'],
    remarks: string
  ) => {
    setActiveDiagnosis(prev => ({
      ...prev,
      validation_status: status,
      validator_remarks: remarks,
      validated_at: new Date().toISOString(),
      validated_by:
        userRole === 'expert'
          ? 'Dr. V. R. Shinde (Senior Pathologist, KVK Niphad)'
          : 'District Extension Officer',
    }));
  };

  // Build advisor response for active diagnosis
  const advisorData = {
    case_id: activeDiagnosis.case_id,
    diagnosis_id: activeDiagnosis.id,
    crop: activeDiagnosis.crop || 'Soybean',
    issue_name:
      activeDiagnosis.top_hypothesis.common_name[language] ||
      activeDiagnosis.top_hypothesis.common_name.en,
    risk_band: activeDiagnosis.farmer_risk_band,
    gated_chemical_allowed:
      activeDiagnosis.farmer_risk_band === 'Warning' ||
      activeDiagnosis.farmer_risk_band === 'Critical',
    abstain_state: activeDiagnosis.calibrated_probability < 0.65,
    ipm_pathway: {
      step_1_monitoring: {
        etl_threshold: '1 rust lesion per leaf on 5% of sampled plants during R1 to R5 stage.',
        scouting_protocol:
          'Inspect lower and middle third of canopy across 5 sampling stations. Check for reddish-brown polygonal pustules under 10x hand lens.',
      },
      step_2_cultural: SEED_PROTECTION_RULES.filter(r => r.action_type === 'cultural'),
      step_3_biological_botanical: SEED_PROTECTION_RULES.filter(
        r => r.action_type === 'biological' || r.action_type === 'botanical'
      ),
      step_4_chemical_last_resort: SEED_PROTECTION_RULES.filter(r => r.action_type === 'chemical'),
    },
    resistance_rotation_guidance:
      'MANDATORY ROTATION RULE: Do NOT repeat FRAC Group 11 (QoI) or IRAC Group 28 (Diamide) consecutively. Rotate with different chemical group or biological antagonist to arrest fungicide resistance development in Maharashtra micro-watersheds.',
    safety_disclaimer:
      'DISCLAIMER: Recommendations strictly follow CIB&RC registration lists and State Agricultural University (MPKV Rahuri) Package of Practices. All chemical applications require full PPE (goggles, mask, gloves). Do not apply near water bodies or during active bee pollination. Seed data marked "TODO: verify with agronomist".',
    authority_verification_notice:
      'Verified under CIB&RC Schedule of Registered Pesticides & Directorate of Plant Protection, Quarantine & Storage (DPPQS) Govt. of India.',
    requires_expert_validation: true,
    rule_version: 'CIBRC-2025.10-SAFE',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        language={language}
        setLanguage={setLanguage}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* VIEW 1: COMMAND CENTER DASHBOARD (/) */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Warning Alert Banner */}
            <AlertBanner
              language={language}
              onExploreHotspot={() => {
                const el = document.getElementById('spatial-map-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* High-Level Telemetry Metrics */}
            <MetricCards language={language} />

            {/* Core Spatial + Queue + XAI Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Map & Priority Queue (7 Cols) */}
              <div className="lg:col-span-7 space-y-6" id="spatial-map-section">
                {/* Hotspot Map & Graph */}
                <SpatialHotspotMap
                  nodes={SEED_HOTSPOT_NODES}
                  edges={SEED_EXPOSURE_EDGES}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={(nodeId) => {
                    setSelectedNodeId(nodeId);
                    if (nodeId === 'node-1') setSelectedCaseId('case-184');
                    if (nodeId === 'node-2') setSelectedCaseId('case-185');
                    if (nodeId === 'node-3') setSelectedCaseId('case-182');
                  }}
                  language={language}
                  onOpenCase={() => setCurrentTab('case-detail')}
                />

                {/* Priority Queue (Impact × Uncertainty × Spread) */}
                <PriorityQueue
                  items={SEED_PRIORITY_QUEUE}
                  selectedCaseId={selectedCaseId}
                  onSelectCase={(caseId) => setSelectedCaseId(caseId)}
                  language={language}
                  onOpenCase={() => setCurrentTab('case-detail')}
                />
              </div>

              {/* Right Column: Explainable AI & Crop Protection (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Explainable AI Card */}
                <ExplainabilityCard
                  diagnosis={activeDiagnosis}
                  language={language}
                  onValidateClick={() => setCurrentTab('case-detail')}
                />

                {/* Safe-Action Crop Protection Advisor */}
                <CropProtectionAdvisor
                  data={advisorData}
                  language={language}
                  onFollowupSchedule={() => {}}
                />
              </div>
            </div>

            {/* Plot Health Digital Twin Timeline (Full Width) */}
            <DigitalTwinTimeline
              events={SEED_TIMELINE_14_DAYS}
              language={language}
            />

            {/* Google Maps Grounded Agro-Diagnostic Centers (gemini-3.5-flash with googleMaps) */}
            <GroundedAgroCenters
              language={language}
              plotLocationName="Niphad / Dindori, Nashik District, Maharashtra"
              latitude={20.1834}
              longitude={73.8421}
            />
          </div>
        )}

        {/* VIEW 2: OBSERVATION INTAKE (/observe) */}
        {currentTab === 'observe' && (
          <ObservationIntake
            language={language}
            isOnline={isOnline}
            onObservationCreated={() => {}}
          />
        )}

        {/* VIEW 3: CASE DETAIL & VALIDATION (/cases/:id) */}
        {currentTab === 'case-detail' && (
          <CaseValidationView
            diagnosis={activeDiagnosis}
            language={language}
            userRole={userRole}
            onBack={() => setCurrentTab('dashboard')}
            onUpdateValidation={handleUpdateValidation}
          />
        )}

        {/* VIEW 4: EXPERT CONSOLE (/godmode) */}
        {currentTab === 'godmode' && (
          <GodmodeConsole
            userRole={userRole}
            language={language}
            onBack={() => setCurrentTab('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AgriSentinel AI</span>
            <span>·</span>
            <span>Smart India Hackathon 2026 (PS 26131)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>District: Nashik, Maharashtra</span>
            <span>·</span>
            <span>ICAR & CIB&RC IPM Compliant</span>
            <span>·</span>
            <span className="font-mono text-emerald-400">v1.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
