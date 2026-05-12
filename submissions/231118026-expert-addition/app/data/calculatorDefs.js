export const CALCULATORS = {
  'dmft-index': {
    title: 'DMFT Index',
    subtitle: 'WHO Caries Assessment',
    source: 'WHO Oral Health Surveys, 5th Ed. (2013)',
    specialty: ['dentist'],
    fields: [
      { id: 'd', label: 'Decayed (D)', hint: 'Teeth with active untreated decay', min: 0, max: 32, default: 0 },
      { id: 'm', label: 'Missing (M)', hint: 'Teeth extracted due to caries', min: 0, max: 32, default: 0 },
      { id: 'f', label: 'Filled (F)', hint: 'Teeth with restorations from caries', min: 0, max: 32, default: 0 },
    ],
    compute: (v) => {
      const score = v.d + v.m + v.f;
      if (score === 0) return { score, label: 'Very Low', rec: 'Preventive care only. Excellent oral health.', color: '#c5e8c5' };
      if (score <= 1) return { score, label: 'Low', rec: 'Maintain current oral hygiene routine.', color: '#c5e8c5' };
      if (score <= 6) return { score, label: 'Moderate', rec: 'Increase recall frequency. Review diet.', color: '#e8bf94' };
      if (score <= 13) return { score, label: 'High', rec: 'Intensive caries management plan required.', color: '#ffb4ab' };
      return { score, label: 'Very High', rec: 'Immediate comprehensive treatment needed.', color: '#ffb4ab' };
    },
  },

  'das-r': {
    title: 'Dental Anxiety Scale (DAS-R)',
    subtitle: 'Pre-Procedure Anxiety Screening',
    source: 'Humphris et al., Oral Health & Prev Dent (2000)',
    specialty: ['dentist'],
    fields: [
      { id: 'q1', label: 'Appointment worry', hint: '1 = Not anxious · 5 = Extremely anxious', min: 1, max: 5, default: 1 },
      { id: 'q2', label: 'Waiting room anxiety', hint: '1 = Relaxed · 5 = So anxious, sweating', min: 1, max: 5, default: 1 },
      { id: 'q3', label: 'Drill anticipation', hint: '1 = Relaxed · 5 = So anxious, feel ill', min: 1, max: 5, default: 1 },
      { id: 'q4', label: 'Scaling worry', hint: '1 = Relaxed · 5 = So anxious, feel ill', min: 1, max: 5, default: 1 },
    ],
    compute: (v) => {
      const score = v.q1 + v.q2 + v.q3 + v.q4;
      if (score < 9) return { score: `${score}/20`, label: 'Low anxiety', rec: 'Proceed with standard care.', color: '#c5e8c5' };
      if (score <= 12) return { score: `${score}/20`, label: 'Moderate anxiety', rec: 'Discuss concerns before procedure.', color: '#e8bf94' };
      if (score <= 14) return { score: `${score}/20`, label: 'High anxiety', rec: 'Consider pre-treatment anxiolytic or sedation.', color: '#ffb4ab' };
      return { score: `${score}/20`, label: 'Possible dental phobia', rec: 'Refer for cognitive behavioral therapy before treatment.', color: '#ffb4ab' };
    },
  },

  'braden-scale': {
    title: 'Braden Scale',
    subtitle: 'Pressure Injury Risk Assessment',
    source: 'Braden & Bergstrom, Nurs Res (1987)',
    specialty: ['nurse'],
    fields: [
      { id: 'sensory', label: 'Sensory Perception', hint: '1=Completely limited · 4=No impairment', min: 1, max: 4, default: 4 },
      { id: 'moisture', label: 'Moisture', hint: '1=Constantly moist · 4=Rarely moist', min: 1, max: 4, default: 4 },
      { id: 'activity', label: 'Activity', hint: '1=Bedfast · 4=Walks frequently', min: 1, max: 4, default: 4 },
      { id: 'mobility', label: 'Mobility', hint: '1=Completely immobile · 4=No limitations', min: 1, max: 4, default: 4 },
      { id: 'nutrition', label: 'Nutrition', hint: '1=Very poor · 4=Excellent', min: 1, max: 4, default: 4 },
      { id: 'friction', label: 'Friction & Shear', hint: '1=Problem · 3=No apparent problem', min: 1, max: 3, default: 3 },
    ],
    compute: (v) => {
      const score = Object.values(v).reduce((a, b) => a + b, 0);
      if (score <= 9) return { score: `${score}/23`, label: 'Very High Risk', rec: 'Intensive protocol: reposition every 2h, specialty mattress, nutrition consult.', color: '#ffb4ab' };
      if (score <= 12) return { score: `${score}/23`, label: 'High Risk', rec: 'Reposition every 2h, pressure-redistribution surface.', color: '#ffb4ab' };
      if (score <= 14) return { score: `${score}/23`, label: 'Moderate Risk', rec: 'Reposition every 4h, monitor skin integrity daily.', color: '#e8bf94' };
      if (score <= 18) return { score: `${score}/23`, label: 'Mild Risk', rec: 'Standard preventive measures, skin assessment every shift.', color: '#e8bf94' };
      return { score: `${score}/23`, label: 'No Risk', rec: 'Routine skin care. Reassess if status changes.', color: '#c5e8c5' };
    },
  },

  'news2': {
    title: 'NEWS2',
    subtitle: 'National Early Warning Score 2',
    source: 'Royal College of Physicians (2017)',
    specialty: ['nurse'],
    fields: [
      { id: 'rr', label: 'Resp. Rate score', hint: '0=12-20/min · 1=9-11 · 2=21-24 · 3=≤8 or ≥25', min: 0, max: 3, default: 0 },
      { id: 'spo2', label: 'SpO₂ score', hint: '0=≥96% · 1=94-95% · 2=92-93% · 3=≤91%', min: 0, max: 3, default: 0 },
      { id: 'o2', label: 'Supplemental O₂', hint: '0=Air · 2=Supplemental oxygen needed', min: 0, max: 2, default: 0 },
      { id: 'sbp', label: 'Systolic BP score', hint: '0=111-219 · 1=101-110 · 2=91-100 · 3=≤90 or ≥220', min: 0, max: 3, default: 0 },
      { id: 'pulse', label: 'Pulse score', hint: '0=51-90 · 1=41-50 or 91-110 · 2=111-130 · 3=≤40 or ≥131', min: 0, max: 3, default: 0 },
      { id: 'avpu', label: 'Consciousness', hint: '0=Alert · 3=Confusion / Voice / Pain / Unresponsive', min: 0, max: 3, default: 0 },
      { id: 'temp', label: 'Temperature score', hint: '0=36.1-38.0°C · 1=35.1-36.0 or 38.1-39.0 · 2=≤35.0 or ≥39.1', min: 0, max: 2, default: 0 },
    ],
    compute: (v) => {
      const score = Object.values(v).reduce((a, b) => a + b, 0);
      const hasAny3 = Object.values(v).some((x) => x === 3);
      if (score >= 7) return { score, label: 'High Risk', rec: 'Continuous monitoring. Immediate senior review. Consider ICU transfer.', color: '#ffb4ab' };
      if (score >= 5 || hasAny3) return { score, label: 'Medium Risk', rec: 'Increase monitoring frequency. Urgent senior review.', color: '#e8bf94' };
      if (score >= 1) return { score, label: 'Low Risk', rec: 'Continue routine monitoring per schedule.', color: '#c5e8c5' };
      return { score, label: 'Score: 0', rec: 'Patient physiologically stable. Minimum monitoring.', color: '#c5e8c5' };
    },
  },

  'wells-dvt': {
    title: 'Wells DVT Criteria',
    subtitle: 'Deep Vein Thrombosis Pretest Probability',
    source: 'Wells et al., Lancet (1997)',
    specialty: ['cardiologist'],
    fields: [
      { id: 'cancer', label: 'Active cancer (treatment ongoing or within 6 months)', min: 0, max: 1, default: 0 },
      { id: 'paralysis', label: 'Paralysis, paresis, or leg immobilization', min: 0, max: 1, default: 0 },
      { id: 'bedridden', label: 'Bedridden >3 days or surgery within 4 weeks', min: 0, max: 1, default: 0 },
      { id: 'tenderness', label: 'Deep vein tenderness along femoral / popliteal vein', min: 0, max: 1, default: 0 },
      { id: 'leg_swelling', label: 'Entire leg swollen', min: 0, max: 1, default: 0 },
      { id: 'calf_swelling', label: 'Calf swelling >3cm vs asymptomatic side', min: 0, max: 1, default: 0 },
      { id: 'edema', label: 'Pitting edema (symptomatic leg only)', min: 0, max: 1, default: 0 },
      { id: 'veins', label: 'Collateral superficial (non-varicose) veins', min: 0, max: 1, default: 0 },
      { id: 'alt_dx', label: 'Alternative diagnosis equally or more likely (−2 pts)', min: 0, max: 1, default: 0 },
    ],
    compute: (v) => {
      const score = v.cancer + v.paralysis + v.bedridden + v.tenderness
        + v.leg_swelling + v.calf_swelling + v.edema + v.veins - (v.alt_dx * 2);
      if (score <= 0) return { score, label: 'Low probability', rec: 'DVT unlikely. Consider D-dimer test to rule out.', color: '#c5e8c5' };
      if (score <= 1) return { score, label: 'Low-Moderate', rec: 'Consider D-dimer; if positive, proceed to ultrasound.', color: '#e8bf94' };
      return { score, label: 'DVT likely', rec: 'Order proximal leg ultrasound immediately.', color: '#ffb4ab' };
    },
  },

  'meld': {
    title: 'MELD Score',
    subtitle: 'Model for End-Stage Liver Disease',
    source: 'Kamath et al., Hepatology (2001) — open-med-calc (MIT)',
    specialty: ['hepatology'],
    fields: [
      { id: 'cr', label: 'Creatinine (mg/dL)', hint: 'Capped 1.0–4.0 per UNOS guidelines', min: 0.1, max: 20, step: 0.1, default: 1 },
      { id: 'bili', label: 'Bilirubin (mg/dL)', hint: 'Total bilirubin', min: 0.1, max: 40, step: 0.1, default: 1 },
      { id: 'inr', label: 'INR', hint: 'International Normalized Ratio', min: 1, max: 10, step: 0.1, default: 1 },
    ],
    compute: (v) => {
      const cr = Math.max(1.0, Math.min(v.cr, 4.0));
      const bili = Math.max(1.0, v.bili);
      const inr = Math.max(1.0, v.inr);
      const score = Math.round(
        (0.957 * Math.log(cr) + 0.378 * Math.log(bili) + 1.120 * Math.log(inr) + 0.643) * 10
      );
      if (score < 10) return { score, label: 'Low', rec: '3-month mortality ~2%. Routine follow-up.', color: '#c5e8c5' };
      if (score < 20) return { score, label: 'Moderate', rec: '6-month mortality ~6–20%. Prioritize transplant evaluation.', color: '#e8bf94' };
      if (score < 30) return { score, label: 'High', rec: '3-month mortality ~25–76%. Active transplant listing recommended.', color: '#ffb4ab' };
      return { score, label: 'Critical', rec: 'Score ≥30: transplantation evaluation urgent. Mortality >75%.', color: '#ffb4ab' };
    },
  },

  'meld-na': {
    title: 'MELD-Na Score',
    subtitle: 'MELD with Sodium Adjustment',
    source: 'Kim et al., Hepatology (2008) — open-med-calc (MIT)',
    specialty: ['hepatology'],
    fields: [
      { id: 'cr', label: 'Creatinine (mg/dL)', hint: 'Capped 1.0–4.0', min: 0.1, max: 20, step: 0.1, default: 1 },
      { id: 'bili', label: 'Bilirubin (mg/dL)', hint: 'Total bilirubin', min: 0.1, max: 40, step: 0.1, default: 1 },
      { id: 'inr', label: 'INR', hint: 'International Normalized Ratio', min: 1, max: 10, step: 0.1, default: 1 },
      { id: 'na', label: 'Sodium (mEq/L)', hint: 'Serum sodium — capped 125–137', min: 100, max: 150, step: 1, default: 137 },
    ],
    compute: (v) => {
      const cr = Math.max(1.0, Math.min(v.cr, 4.0));
      const bili = Math.max(1.0, v.bili);
      const inr = Math.max(1.0, v.inr);
      const meld = Math.round(
        (0.957 * Math.log(cr) + 0.378 * Math.log(bili) + 1.120 * Math.log(inr) + 0.643) * 10
      );
      const na = Math.max(125, Math.min(v.na, 137));
      const score = meld > 11
        ? Math.round(meld - na - (0.025 * meld * (140 - na)) + 140)
        : meld;
      if (score < 10) return { score, label: 'Low', rec: '3-month mortality ~2%. Routine hepatology follow-up.', color: '#c5e8c5' };
      if (score < 20) return { score, label: 'Moderate', rec: '6-month mortality ~6–20%. Transplant evaluation advised.', color: '#e8bf94' };
      if (score < 30) return { score, label: 'High', rec: '3-month mortality ~25–76%. Active listing recommended.', color: '#ffb4ab' };
      return { score, label: 'Critical', rec: 'Score ≥30: urgent transplant evaluation. Hyponatremia worsens prognosis.', color: '#ffb4ab' };
    },
  },

  'caprini-vte': {
    title: 'Caprini VTE Risk',
    subtitle: 'Venous Thromboembolism Risk Assessment',
    source: 'Caprini, Semin Thromb Hemost (2005) — open-med-calc (MIT)',
    specialty: ['nurse', 'cardiologist'],
    fields: [
      { id: 'age41_60', label: 'Age 41–60 years (+1)', min: 0, max: 1, default: 0 },
      { id: 'age61_74', label: 'Age 61–74 years (+2)', min: 0, max: 1, default: 0 },
      { id: 'age75', label: 'Age ≥75 years (+3)', min: 0, max: 1, default: 0 },
      { id: 'minor_surgery', label: 'Minor surgery planned (+1)', min: 0, max: 1, default: 0 },
      { id: 'major_surgery', label: 'Major surgery >45 min (+2)', min: 0, max: 1, default: 0 },
      { id: 'arthroscopic', label: 'Arthroscopic surgery (+2)', min: 0, max: 1, default: 0 },
      { id: 'elective_arthroplasty', label: 'Elective major lower extremity arthroplasty (+3)', min: 0, max: 1, default: 0 },
      { id: 'varicose', label: 'Varicose veins (+1)', min: 0, max: 1, default: 0 },
      { id: 'swollen_legs', label: 'Current swollen legs (+1)', min: 0, max: 1, default: 0 },
      { id: 'obesity', label: 'BMI >25 (+1)', min: 0, max: 1, default: 0 },
      { id: 'bed_rest', label: 'Bed rest >72h (+2)', min: 0, max: 1, default: 0 },
      { id: 'immobilizing_cast', label: 'Immobilizing plaster cast (+2)', min: 0, max: 1, default: 0 },
      { id: 'central_venous', label: 'Central venous access (+2)', min: 0, max: 1, default: 0 },
      { id: 'history_dvt', label: 'History of DVT/PE (+3)', min: 0, max: 1, default: 0 },
      { id: 'family_dvt', label: 'Family history of DVT/PE (+3)', min: 0, max: 1, default: 0 },
      { id: 'factor_v', label: 'Factor V Leiden positive (+3)', min: 0, max: 1, default: 0 },
      { id: 'malignancy', label: 'Active malignancy (+3)', min: 0, max: 1, default: 0 },
      { id: 'stroke', label: 'Stroke (<1 month) (+5)', min: 0, max: 1, default: 0 },
      { id: 'hip_fracture', label: 'Hip/pelvis/leg fracture (+5)', min: 0, max: 1, default: 0 },
      { id: 'spinal_cord', label: 'Spinal cord injury (<1 month) (+5)', min: 0, max: 1, default: 0 },
    ],
    compute: (v) => {
      const score =
        v.age41_60 * 1 + v.age61_74 * 2 + v.age75 * 3 +
        v.minor_surgery * 1 + v.major_surgery * 2 + v.arthroscopic * 2 +
        v.elective_arthroplasty * 3 + v.varicose * 1 + v.swollen_legs * 1 +
        v.obesity * 1 + v.bed_rest * 2 + v.immobilizing_cast * 2 +
        v.central_venous * 2 + v.history_dvt * 3 + v.family_dvt * 3 +
        v.factor_v * 3 + v.malignancy * 3 + v.stroke * 5 +
        v.hip_fracture * 5 + v.spinal_cord * 5;
      if (score <= 1) return { score, label: 'Very Low Risk', rec: 'VTE risk <0.5%. Early ambulation recommended.', color: '#c5e8c5' };
      if (score === 2) return { score, label: 'Low Risk', rec: 'VTE risk ~1.5%. Consider pneumatic compression devices.', color: '#c5e8c5' };
      if (score <= 4) return { score, label: 'Moderate Risk', rec: 'VTE risk ~3%. Pharmacologic prophylaxis ± mechanical.', color: '#e8bf94' };
      return { score, label: 'High Risk', rec: 'VTE risk ~6%+. Pharmacologic prophylaxis required. Consider extended prophylaxis.', color: '#ffb4ab' };
    },
  },

  'psi-port': {
    title: 'PSI / PORT Score',
    subtitle: 'Pneumonia Severity Index',
    source: 'Fine et al., NEJM (1997) — open-med-calc (MIT)',
    specialty: ['pulmonology', 'nurse'],
    fields: [
      { id: 'age_male', label: 'Age (years, male)', hint: 'Enter age in years; 0 if female', min: 0, max: 120, default: 0 },
      { id: 'age_female', label: 'Age (years, female)', hint: 'Enter age in years; 0 if male', min: 0, max: 120, default: 0 },
      { id: 'nursing_home', label: 'Nursing home resident (+10)', min: 0, max: 1, default: 0 },
      { id: 'neoplasm', label: 'Neoplastic disease (+30)', min: 0, max: 1, default: 0 },
      { id: 'liver_disease', label: 'Liver disease (+20)', min: 0, max: 1, default: 0 },
      { id: 'chf', label: 'Congestive heart failure (+10)', min: 0, max: 1, default: 0 },
      { id: 'cva', label: 'Cerebrovascular disease (+10)', min: 0, max: 1, default: 0 },
      { id: 'renal_disease', label: 'Renal disease (+10)', min: 0, max: 1, default: 0 },
      { id: 'altered_mental', label: 'Altered mental status (+20)', min: 0, max: 1, default: 0 },
      { id: 'rr_30', label: 'Resp. rate ≥30 (+20)', min: 0, max: 1, default: 0 },
      { id: 'sbp_90', label: 'Systolic BP <90 mmHg (+20)', min: 0, max: 1, default: 0 },
      { id: 'temp_abn', label: 'Temp <35°C or ≥40°C (+15)', min: 0, max: 1, default: 0 },
      { id: 'hr_125', label: 'Heart rate ≥125 (+10)', min: 0, max: 1, default: 0 },
      { id: 'ph_735', label: 'Arterial pH <7.35 (+30)', min: 0, max: 1, default: 0 },
      { id: 'bun_30', label: 'BUN ≥30 mg/dL (+20)', min: 0, max: 1, default: 0 },
      { id: 'na_130', label: 'Sodium <130 mEq/L (+20)', min: 0, max: 1, default: 0 },
      { id: 'glucose_250', label: 'Glucose ≥250 mg/dL (+10)', min: 0, max: 1, default: 0 },
      { id: 'hct_30', label: 'Hematocrit <30% (+10)', min: 0, max: 1, default: 0 },
      { id: 'pao2_60', label: 'PaO₂ <60 mmHg or O₂ sat <90% (+10)', min: 0, max: 1, default: 0 },
      { id: 'pleural', label: 'Pleural effusion (+10)', min: 0, max: 1, default: 0 },
    ],
    compute: (v) => {
      const score = v.age_male + v.age_female - (v.age_female > 0 ? 10 : 0) +
        v.nursing_home * 10 + v.neoplasm * 30 + v.liver_disease * 20 +
        v.chf * 10 + v.cva * 10 + v.renal_disease * 10 +
        v.altered_mental * 20 + v.rr_30 * 20 + v.sbp_90 * 20 +
        v.temp_abn * 15 + v.hr_125 * 10 + v.ph_735 * 30 +
        v.bun_30 * 20 + v.na_130 * 20 + v.glucose_250 * 10 +
        v.hct_30 * 10 + v.pao2_60 * 10 + v.pleural * 10;
      if (score <= 50) return { score, label: 'Class I–II', rec: 'Mortality <1%. Outpatient treatment appropriate.', color: '#c5e8c5' };
      if (score <= 70) return { score, label: 'Class III', rec: 'Mortality ~2.8%. Consider brief inpatient observation.', color: '#c5e8c5' };
      if (score <= 90) return { score, label: 'Class IV', rec: 'Mortality ~8.2%. Inpatient admission recommended.', color: '#e8bf94' };
      if (score <= 130) return { score, label: 'Class V', rec: 'Mortality ~29.2%. Inpatient; consider ICU.', color: '#ffb4ab' };
      return { score, label: 'Class V (Severe)', rec: 'Mortality >29%. ICU admission strongly recommended.', color: '#ffb4ab' };
    },
  },

  'phq9': {
    title: 'PHQ-9',
    subtitle: 'Patient Health Questionnaire — Depression',
    source: 'Kroenke et al., J Gen Intern Med (2001)',
    specialty: ['psychiatry'],
    fields: [
      { id: 'q1', label: 'Little interest or pleasure in doing things', hint: '0=Not at all · 1=Several days · 2=More than half the days · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q2', label: 'Feeling down, depressed, or hopeless', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q3', label: 'Trouble falling or staying asleep, or sleeping too much', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q4', label: 'Feeling tired or having little energy', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q5', label: 'Poor appetite or overeating', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q6', label: 'Feeling bad about yourself — or failure', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q7', label: 'Trouble concentrating on things', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q8', label: 'Moving or speaking slowly / being fidgety', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q9', label: 'Thoughts of being better off dead or hurting yourself', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
    ],
    compute: (v) => {
      const score = Object.values(v).reduce((a, b) => a + b, 0);
      if (score <= 4) return { score: `${score}/27`, label: 'Minimal', rec: 'No or minimal depressive symptoms. Monitor at next visit.', color: '#c5e8c5' };
      if (score <= 9) return { score: `${score}/27`, label: 'Mild', rec: 'Watchful waiting, repeat PHQ-9 in 2–4 weeks.', color: '#c5e8c5' };
      if (score <= 14) return { score: `${score}/27`, label: 'Moderate', rec: 'Consider initiating treatment with antidepressant or psychotherapy.', color: '#e8bf94' };
      if (score <= 19) return { score: `${score}/27`, label: 'Moderately Severe', rec: 'Active treatment with antidepressant and/or psychotherapy warranted.', color: '#ffb4ab' };
      return { score: `${score}/27`, label: 'Severe', rec: 'Immediate treatment initiation. Consider psychiatric referral or hospitalization.', color: '#ffb4ab' };
    },
  },

  'gad7': {
    title: 'GAD-7',
    subtitle: 'Generalized Anxiety Disorder Scale',
    source: 'Spitzer et al., Arch Intern Med (2006)',
    specialty: ['psychiatry'],
    fields: [
      { id: 'q1', label: 'Feeling nervous, anxious, or on edge', hint: '0=Not at all · 1=Several days · 2=More than half the days · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q2', label: 'Not being able to stop or control worrying', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q3', label: 'Worrying too much about different things', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q4', label: 'Trouble relaxing', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q5', label: 'Being so restless that it is hard to sit still', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q6', label: 'Becoming easily annoyed or irritable', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
      { id: 'q7', label: 'Feeling afraid as if something awful might happen', hint: '0=Not at all · 3=Nearly every day', min: 0, max: 3, default: 0 },
    ],
    compute: (v) => {
      const score = Object.values(v).reduce((a, b) => a + b, 0);
      if (score <= 4) return { score: `${score}/21`, label: 'Minimal anxiety', rec: 'No intervention required. Monitor for change.', color: '#c5e8c5' };
      if (score <= 9) return { score: `${score}/21`, label: 'Mild anxiety', rec: 'Watchful waiting. Consider lifestyle interventions.', color: '#c5e8c5' };
      if (score <= 14) return { score: `${score}/21`, label: 'Moderate anxiety', rec: 'Consider CBT or pharmacotherapy. Follow-up in 2–4 weeks.', color: '#e8bf94' };
      return { score: `${score}/21`, label: 'Severe anxiety', rec: 'Active treatment strongly recommended. Assess safety and functional impairment.', color: '#ffb4ab' };
    },
  },

  'grace-score': {
    title: 'GRACE Score',
    subtitle: 'ACS In-Hospital & 6-Month Mortality',
    source: 'Fox et al., Eur Heart J (2006)',
    specialty: ['cardiologist'],
    fields: [
      { id: 'age', label: 'Age (years)', hint: 'Patient age', min: 18, max: 110, default: 60 },
      { id: 'hr', label: 'Heart Rate score', hint: '0=50-69 · 1=70-89 · 2=90-109 · 3=110-149 · 4=150-199 · 5=≥200', min: 0, max: 5, default: 0 },
      { id: 'sbp', label: 'Systolic BP score', hint: '0=≥200 · 1=160-199 · 2=140-159 · 3=120-139 · 4=100-119 · 5=80-99 · 6=<80', min: 0, max: 6, default: 0 },
      { id: 'cr', label: 'Creatinine score', hint: '0=0-0.39 · 1=0.4-0.79 · 2=0.8-1.19 · 3=1.2-1.59 · 4=1.6-1.99 · 5=2.0-3.99 · 6=≥4.0', min: 0, max: 6, default: 0 },
      { id: 'killip', label: 'Killip Class', hint: '1=No CHF · 2=Rales/JVD · 3=Pulm edema · 4=Cardiogenic shock', min: 1, max: 4, default: 1 },
      { id: 'arrest', label: 'Cardiac arrest at admission', min: 0, max: 1, default: 0 },
      { id: 'st_dev', label: 'ST-segment deviation on ECG', min: 0, max: 1, default: 0 },
      { id: 'troponin', label: 'Elevated cardiac enzymes / troponin', min: 0, max: 1, default: 0 },
    ],
    compute: (v) => {
      const ageScore = v.age < 30 ? 0 : v.age < 40 ? 8 : v.age < 50 ? 25 : v.age < 60 ? 41 : v.age < 70 ? 58 : v.age < 80 ? 75 : v.age < 90 ? 91 : 100;
      const killipScore = [0, 0, 20, 39, 59][v.killip] ?? 0;
      const score = ageScore + v.hr * 12 + v.sbp * 12 + v.cr * 7 + killipScore
        + v.arrest * 43 + v.st_dev * 28 + v.troponin * 14;
      if (score < 109) return { score, label: 'Low Risk', rec: 'In-hospital mortality <1%. Early discharge may be appropriate.', color: '#c5e8c5' };
      if (score < 140) return { score, label: 'Intermediate Risk', rec: 'In-hospital mortality 1–3%. Standard ACS pathway.', color: '#e8bf94' };
      return { score, label: 'High Risk', rec: 'In-hospital mortality >3%. Urgent invasive strategy within 24h.', color: '#ffb4ab' };
    },
  },

  'timi-risk': {
    title: 'TIMI Risk Score',
    subtitle: 'UA / NSTEMI 14-Day Cardiac Event Risk',
    source: 'Antman et al., JAMA (2000)',
    specialty: ['cardiologist'],
    fields: [
      { id: 'age65', label: 'Age ≥65 years', min: 0, max: 1, default: 0 },
      { id: 'risk3', label: '≥3 CAD risk factors (FHx, HTN, hypercholesterolemia, DM, smoking)', min: 0, max: 1, default: 0 },
      { id: 'stenosis50', label: 'Prior coronary stenosis ≥50%', min: 0, max: 1, default: 0 },
      { id: 'st_dev', label: 'ST-segment deviation on presenting ECG', min: 0, max: 1, default: 0 },
      { id: 'angina2', label: '≥2 anginal events in prior 24 hours', min: 0, max: 1, default: 0 },
      { id: 'aspirin', label: 'Aspirin use in prior 7 days', min: 0, max: 1, default: 0 },
      { id: 'troponin', label: 'Elevated serum cardiac markers', min: 0, max: 1, default: 0 },
    ],
    compute: (v) => {
      const score = v.age65 + v.risk3 + v.stenosis50 + v.st_dev + v.angina2 + v.aspirin + v.troponin;
      if (score <= 2) return { score: `${score}/7`, label: 'Low Risk', rec: '14-day event rate ~5%. Conservative strategy may be appropriate.', color: '#c5e8c5' };
      if (score <= 4) return { score: `${score}/7`, label: 'Intermediate Risk', rec: '14-day event rate ~13–20%. Early invasive strategy recommended.', color: '#e8bf94' };
      return { score: `${score}/7`, label: 'High Risk', rec: '14-day event rate ~26–41%. Urgent invasive strategy within 24h.', color: '#ffb4ab' };
    },
  },

  'heart-score': {
    title: 'HEART Score',
    subtitle: 'Major Adverse Cardiac Events Risk',
    source: 'Six et al., Eur J Emerg Med (2010)',
    specialty: ['cardiologist'],
    fields: [
      { id: 'history', label: 'History', hint: '0=Slightly suspicious · 1=Moderately suspicious · 2=Highly suspicious', min: 0, max: 2, default: 0 },
      { id: 'ecg', label: 'ECG', hint: '0=Normal · 1=Non-specific repolarization disturbance · 2=Significant ST deviation', min: 0, max: 2, default: 0 },
      { id: 'age', label: 'Age', hint: '0=<45 · 1=45-64 · 2=≥65', min: 0, max: 2, default: 0 },
      { id: 'risk', label: 'Risk Factors', hint: '0=No known risk factors · 1=1-2 risk factors · 2=≥3 risk factors or history of atherosclerotic disease', min: 0, max: 2, default: 0 },
      { id: 'troponin', label: 'Troponin', hint: '0=≤normal limit · 1=1-3× normal limit · 2=>3× normal limit', min: 0, max: 2, default: 0 },
    ],
    compute: (v) => {
      const score = v.history + v.ecg + v.age + v.risk + v.troponin;
      if (score <= 3) return { score: `${score}/10`, label: 'Low Risk', rec: 'MACE risk 1.7%. Safe for early discharge. Outpatient follow-up.', color: '#c5e8c5' };
      if (score <= 6) return { score: `${score}/10`, label: 'Moderate Risk', rec: 'MACE risk 12–17%. Admit for observation and further workup.', color: '#e8bf94' };
      return { score: `${score}/10`, label: 'High Risk', rec: 'MACE risk 50–65%. Early invasive strategy recommended.', color: '#ffb4ab' };
    },
  },

  'ckd-epi': {
    title: 'CKD-EPI GFR',
    subtitle: 'Estimated Glomerular Filtration Rate',
    source: 'Levey et al., Ann Intern Med (2009)',
    specialty: ['nephrology'],
    fields: [
      { id: 'scr', label: 'Serum Creatinine (mg/dL)', hint: 'Measured serum creatinine', min: 0.1, max: 20, default: 1 },
      { id: 'age', label: 'Age (years)', hint: 'Patient age', min: 18, max: 110, default: 50 },
      { id: 'female', label: 'Female sex', min: 0, max: 1, default: 0 },
    ],
    compute: (v) => {
      const kappa = v.female ? 0.7 : 0.9;
      const alpha = v.female ? -0.329 : -0.411;
      const sexFactor = v.female ? 1.018 : 1;
      const ratio = v.scr / kappa;
      const gfr = Math.round(
        141 * Math.pow(Math.min(ratio, 1), alpha) * Math.pow(Math.max(ratio, 1), -1.209)
        * Math.pow(0.993, v.age) * sexFactor
      );
      if (gfr >= 90) return { score: `${gfr} mL/min/1.73m²`, label: 'Normal or High', rec: 'CKD Stage G1 if structural/functional abnormalities present. Annual monitoring.', color: '#c5e8c5' };
      if (gfr >= 60) return { score: `${gfr} mL/min/1.73m²`, label: 'Mildly Decreased', rec: 'CKD Stage G2. Monitor BP, proteinuria, electrolytes every 6–12 months.', color: '#c5e8c5' };
      if (gfr >= 45) return { score: `${gfr} mL/min/1.73m²`, label: 'Mild-Moderate', rec: 'CKD Stage G3a. Nephrology referral recommended. Avoid nephrotoxins.', color: '#e8bf94' };
      if (gfr >= 30) return { score: `${gfr} mL/min/1.73m²`, label: 'Moderate-Severe', rec: 'CKD Stage G3b. Active nephrology management. Anemia + bone disease screening.', color: '#e8bf94' };
      if (gfr >= 15) return { score: `${gfr} mL/min/1.73m²`, label: 'Severely Decreased', rec: 'CKD Stage G4. RRT planning (dialysis/transplant). Monthly labs.', color: '#ffb4ab' };
      return { score: `${gfr} mL/min/1.73m²`, label: 'Kidney Failure', rec: 'CKD Stage G5. Initiate RRT if symptomatic. Urgent nephrology.', color: '#ffb4ab' };
    },
  },

  'mdrd-gfr': {
    title: 'MDRD GFR',
    subtitle: 'Modification of Diet in Renal Disease',
    source: 'Levey et al., Ann Intern Med (1999)',
    specialty: ['nephrology'],
    fields: [
      { id: 'scr', label: 'Serum Creatinine (mg/dL)', hint: 'Measured serum creatinine', min: 0.1, max: 20, default: 1 },
      { id: 'age', label: 'Age (years)', hint: 'Patient age', min: 18, max: 110, default: 50 },
      { id: 'female', label: 'Female sex', min: 0, max: 1, default: 0 },
      { id: 'black', label: 'Black / African American race', min: 0, max: 1, default: 0 },
    ],
    compute: (v) => {
      const gfr = Math.round(
        175 * Math.pow(v.scr, -1.154) * Math.pow(v.age, -0.203)
        * (v.female ? 0.742 : 1) * (v.black ? 1.212 : 1)
      );
      if (gfr >= 90) return { score: `${gfr} mL/min/1.73m²`, label: 'Normal', rec: 'Normal kidney function. Reassess if structural disease suspected.', color: '#c5e8c5' };
      if (gfr >= 60) return { score: `${gfr} mL/min/1.73m²`, label: 'Mild CKD', rec: 'Monitor creatinine and proteinuria every 6–12 months.', color: '#c5e8c5' };
      if (gfr >= 30) return { score: `${gfr} mL/min/1.73m²`, label: 'Moderate CKD', rec: 'Nephrology referral. Manage complications (anemia, acidosis, bone disease).', color: '#e8bf94' };
      if (gfr >= 15) return { score: `${gfr} mL/min/1.73m²`, label: 'Severe CKD', rec: 'Urgent nephrology. Begin RRT planning.', color: '#ffb4ab' };
      return { score: `${gfr} mL/min/1.73m²`, label: 'Kidney Failure', rec: 'Initiate RRT. Transplant evaluation if eligible.', color: '#ffb4ab' };
    },
  },

  'fena': {
    title: 'FENa',
    subtitle: 'Fractional Excretion of Sodium',
    source: 'Espinel, JAMA (1976)',
    specialty: ['nephrology'],
    fields: [
      { id: 'una', label: 'Urine Sodium (mEq/L)', hint: 'Spot urine Na', min: 1, max: 200, default: 40 },
      { id: 'pna', label: 'Plasma Sodium (mEq/L)', hint: 'Serum Na', min: 110, max: 160, default: 140 },
      { id: 'ucr', label: 'Urine Creatinine (mg/dL)', hint: 'Spot urine creatinine', min: 1, max: 500, default: 100 },
      { id: 'pcr', label: 'Plasma Creatinine (mg/dL)', hint: 'Serum creatinine', min: 0.1, max: 20, default: 1 },
    ],
    compute: (v) => {
      const fena = ((v.una * v.pcr) / (v.pna * v.ucr)) * 100;
      const display = fena.toFixed(1);
      if (fena < 1) return { score: `${display}%`, label: 'Pre-renal AKI', rec: 'FENa <1%: Suggests volume depletion or decreased renal perfusion. Fluid resuscitation.', color: '#e8bf94' };
      if (fena <= 2) return { score: `${display}%`, label: 'Indeterminate', rec: 'FENa 1–2%: Borderline. Consider FEUrea or clinical context. Contrast/hepatorenal may give low FENa.', color: '#e8bf94' };
      return { score: `${display}%`, label: 'Intrinsic AKI', rec: 'FENa >2%: Suggests ATN or intrinsic kidney disease. Urine microscopy recommended.', color: '#ffb4ab' };
    },
  },

  'koos-score': {
    title: 'KOOS Score',
    subtitle: 'Knee Injury & Osteoarthritis Outcome Score',
    source: 'Roos et al., J Orthop Sports Phys Ther (1998)',
    specialty: ['orthopedics'],
    fields: [
      { id: 'pain', label: 'Pain subscale (0–100)', hint: '0=Extreme pain · 100=No pain', min: 0, max: 100, default: 50 },
      { id: 'symptoms', label: 'Symptoms subscale (0–100)', hint: '0=Severe symptoms · 100=No symptoms', min: 0, max: 100, default: 50 },
      { id: 'adl', label: 'ADL Function subscale (0–100)', hint: '0=Extreme difficulty · 100=No difficulty', min: 0, max: 100, default: 50 },
      { id: 'sport', label: 'Sport/Recreation subscale (0–100)', hint: '0=Extreme difficulty · 100=No difficulty', min: 0, max: 100, default: 50 },
      { id: 'qol', label: 'Quality of Life subscale (0–100)', hint: '0=Extremely low QoL · 100=Excellent QoL', min: 0, max: 100, default: 50 },
    ],
    compute: (v) => {
      const avg = Math.round((v.pain + v.symptoms + v.adl + v.sport + v.qol) / 5);
      const lowest = Math.min(v.pain, v.symptoms, v.adl, v.sport, v.qol);
      if (avg >= 85) return { score: `${avg}/100`, label: 'Excellent', rec: 'Near-normal function. Maintain activity. Annual review.', color: '#c5e8c5' };
      if (avg >= 70) return { score: `${avg}/100`, label: 'Good', rec: 'Good function overall. Continue physiotherapy as planned.', color: '#c5e8c5' };
      if (avg >= 50) return { score: `${avg}/100`, label: 'Moderate', rec: lowest < 40 ? 'Focus PT on lowest subscale. Consider imaging review.' : 'Continue structured rehab program.', color: '#e8bf94' };
      return { score: `${avg}/100`, label: 'Poor', rec: 'Significant impairment. Reassess treatment plan. Surgical evaluation if conservative management failing.', color: '#ffb4ab' };
    },
  },
};
