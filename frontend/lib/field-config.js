export const FETAL_FIELDS = [
  { key: 'baseline', label: 'Baseline Heart Rate (bpm)', min: 60, max: 200, step: 0.5 },
  { key: 'variance', label: 'Baseline Variability', min: 0, max: 50, step: 0.5 },
  { key: 'acceleration', label: 'Acceleration', min: 0, max: 50, step: 0.5 },
  { key: 'deceleration', label: 'Deceleration', min: 0, max: 50, step: 0.5 },
  { key: 'fetal_movement', label: 'Fetal Movement', min: 0, max: 50, step: 0.5 },
  { key: 'uterine_contractions', label: 'Uterine Contractions', min: 0, max: 50, step: 0.5 },
  { key: 'light_sleep', label: 'Light Sleep (bpm)', min: 0, max: 200, step: 0.5 },
  { key: 'severe_decelerations', label: 'Severe Decelerations', min: 0, max: 50, step: 0.5 },
  { key: 'prolonged_deceleration', label: 'Prolonged Deceleration (bpm)', min: 0, max: 200, step: 0.5 },
  { key: 'abnormal_short_term', label: 'Abnormal Short Term Variability', min: 0, max: 200, step: 0.5 },
  { key: 'mean_value', label: 'Mean Value of Short Term Variability (bpm)', min: 0, max: 200, step: 0.5 },
];

export const FETAL_STATUS = {
  0: { label: 'Normal', color: 'bg-emerald-500/20 text-emerald-400', badgeColor: 'bg-emerald-500' },
  1: { label: 'Suspect', color: 'bg-amber-500/20 text-amber-400', badgeColor: 'bg-amber-500' },
  2: { label: 'Pathological', color: 'bg-red-500/20 text-red-400', badgeColor: 'bg-red-500' },
};

export const INFANT_FIELDS = {
  BirthAsphyxia: {
    label: 'Birth Asphyxia',
    options: ['yes', 'no'],
    info: 'Severe oxygen deprivation during birth affecting fetal/neonatal circulation'
  },
  HypDistrib: {
    label: 'Hypoplasia Distribution',
    options: ['Equal', 'Unequal'],
    info: 'Abnormal tissue development distribution pattern'
  },
  HypoxiaInO2: {
    label: 'Hypoxia in O2',
    options: ['Mild', 'Moderate', 'Severe'],
    info: 'Oxygen deficiency level in clinical condition'
  },
  CO2: {
    label: 'CO2 Level',
    options: ['Low', 'Normal', 'High'],
    info: 'Carbon dioxide level in blood'
  },
  ChestXray: {
    label: 'Chest X-ray',
    options: ['Normal', 'Grd_Glass', 'Plethoric', 'Oligaemic', 'Asy/Patch'],
    info: 'Chest X-ray findings interpretation'
  },
  Grunting: {
    label: 'Grunting',
    options: ['yes', 'no'],
    info: 'Presence of grunting sound during respiration'
  },
  LVHreport: {
    label: 'LVH Report',
    options: ['yes', 'no'],
    info: 'Left Ventricular Hypertrophy report'
  },
  LowerBodyO2: {
    label: 'Lower Body O2',
    options: ['<5', '5-12', '>12'],
    info: 'Oxygen saturation in lower body (%)'
  },
  RUQO2: {
    label: 'Right Upper Quadrant O2',
    options: ['<5', '5-12', '>12'],
    info: 'Oxygen saturation in right upper quadrant (%)'
  },
  CO2Report: {
    label: 'CO2 Report',
    options: ['<7.5', '>=7.5'],
    info: 'CO2 level report measurement'
  },
  XrayReport: {
    label: 'X-ray Report',
    options: ['Normal', 'Grd_Glass', 'Plethoric', 'Oligaemic', 'Asy/Patch'],
    info: 'X-ray examination findings'
  },
  GruntingReport: {
    label: 'Grunting Report',
    options: ['yes', 'no'],
    info: 'Clinical assessment of grunting'
  },
  Age: {
    label: 'Age',
    options: ['0-3_days', '4-10_days', '11-30_days'],
    info: 'Age group of the infant'
  },
  LVH: {
    label: 'LVH Status',
    options: ['yes', 'no'],
    info: 'Left Ventricular Hypertrophy status'
  },
  DuctFlow: {
    label: 'Duct Flow',
    options: ['Lt_to_Rt', 'Rt_to_Lt', 'Bidirectional'],
    info: 'Direction of ductus arteriosus flow'
  },
  CardiacMixing: {
    label: 'Cardiac Mixing',
    options: ['Mild', 'Moderate', 'Severe'],
    info: 'Degree of cardiac mixing'
  },
  LungParench: {
    label: 'Lung Parenchyma',
    options: ['Normal', 'Abnormal'],
    info: 'Lung parenchymal status'
  },
  LungFlow: {
    label: 'Lung Flow',
    options: ['Low', 'Normal', 'High'],
    info: 'Pulmonary blood flow level'
  },
  Sick: {
    label: 'Sick Status',
    options: ['yes', 'no'],
    info: 'General sickness status'
  },
};

export const INFANT_CONDITIONS = {
  'TGA': 'Transposition of the Great Arteries',
  'Fallot': "Tetralogy of Fallot",
  'PAIVS': 'Pulmonary Atresia with Intact Ventricular Septum',
  'PFC': 'Patent Foramen Ovale',
  'TAPVD': 'Total Anomalous Pulmonary Venous Drainage',
  'Lung': 'Lung Disease',
};

export const CRY_TYPES = {
  'discomfort': { label: 'Discomfort', color: 'bg-amber-500/20 text-amber-400' },
  'hunger': { label: 'Hunger', color: 'bg-orange-500/20 text-orange-400' },
  'pain': { label: 'Pain', color: 'bg-red-500/20 text-red-400' },
  'tired': { label: 'Tired', color: 'bg-blue-500/20 text-blue-400' },
  'normal': { label: 'Normal', color: 'bg-emerald-500/20 text-emerald-400' },
};
