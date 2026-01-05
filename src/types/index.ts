export type Region = 'ERCOT' | 'SPP' | 'MISO' | 'PJM';
export type SolverType = 'Simple' | 'Normal';
export type SolutionCriterion = 'Total System Cost Savings' | 'Highest Unit Energy Margin';
export type WeatherYearSelection = 'All' | 'Median' | 'Peak';
export type LoadUncertainty = 'All' | 'Low' | 'Medium' | 'High';
export type UnitType = 'Solar' | 'Wind' | 'Gas' | 'Nuclear';
export type ConstraintVariableType = 'LOLE Capacity' | 'EUE Capacity' | 'EUE Depth' | 'Max EUE Duration' | 'LOLH Capacity' | 'LOLEV' | 'Emissions' | 'RPS';
export type EscalationVariableType = 'Fixed Carrying Cost' | 'Fixed OM' | 'Fixed Cost' | 'Fixed Handling Cost' | 'VOM per Hour' | 'VOM per MWh' | 'Startup Cost' | 'Hot Startup Cost';

export interface Study {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  dateCreated: string;
  dateModified: string;
  regions: Region[];
}

export interface Constraint {
  id: string;
  variable: string;
  year: number;
  limit: string;
  exceedanceThreshold: string;
  priority: number;
}

export interface EscalationInput {
  id: string;
  variable: string;
  rate: number;
}

export interface ExpansionPlanSettings {
  // General
  unitNameAccountCenter: string;
  simulationYearStepSize: number;
  baseYear: number;
  automatedResubmissionTime: number;
  economicDiscountRate: number;
  reliabilityDiscountRate: number;
  // Solver Configuration
  solverType: SolverType;
  solutionCriterion: SolutionCriterion;
  iterationsPromptYear: number;
  iterationsFutureYear: number;
  weatherYearSelection: WeatherYearSelection;
  loadUncertainty: LoadUncertainty;
  includeOutages: boolean;
  autoExportResults: boolean;
  // Constraints and Escalation
  constraints: Constraint[];
  escalationInputs: EscalationInput[];
}

export interface ExpansionPlan {
  id: string;
  name: string;
  dateCreated: string;
  isActive: boolean;
  region: Region;
  suffix: string;
  sourceStudyId: string;
  planningHorizonStart: number;
  planningHorizonEnd: number;
  settings: ExpansionPlanSettings;
}

export type Month = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';

// Generation Candidate - made up of one or more units
export interface GenerationCandidate {
  id: string;
  expansionPlanId: string;
  units: string[]; // Array of unit names (displayed as colon-separated)
  capacity: number; // MW
  fixedCost: number; // $/kW-yr
  startMonth: Month;
  startYear: number;
  endYear: number;
  maxAdditionsPerYear: number | null; // null = unlimited ("-")
  maxAdditionsOverall: number | null; // null = unlimited ("-")
  isRetirement: boolean;
  lifetime: number; // years
}

// Transmission Candidate - tie between 2 regions in the study
export interface TransmissionCandidate {
  id: string;
  expansionPlanId: string;
  regionA: Region;
  regionB: Region;
  capacityLimitIn: number; // MW
  capacityLimitOut: number; // MW
  cost: number; // $/MW-Yr
  inflation: number; // %
  startYear: number;
  endYear: number;
  maxAdditionsPerYear: number | null;
  maxAdditionsOverall: number | null;
}

// Solver Log Entry
export type LogType = 'Info' | 'Warning' | 'Error';

export interface SolverLog {
  id: string;
  type: LogType;
  time: string;
  message: string;
}

// Solver Result Row
export interface SolverResult {
  id: string;
  expansionPlanId: string;
  study: string;
  candidate: string;
  iteration: number;
  year: number;
  status: string;
  namePlate: number;
  energyMargin: number;
  npvEnergyMargin: number;
  availableMW: number;
  npvAvgAvailableMW: number;
  fixedCost: number;
  fixedCarryingCost: number;
  fixedOMCost: number;
  totalNPVFixedCost: number;
  totalNPVFixedCostMinusMargin: number;
  npvFixedCostMarginRatio: number;
  totalFixedCostMinusMargin: number;
  fixedCostMarginRatio: number;
  loleCapacity: number;
  eueCap: number;
  lolhCap: number;
  npvLOLECapacity: number;
  npvTotalCost: number;
  totalAnnualSystemCost: number;
  unitProductionCost: number;
  unitFuelCost: number;
  unitStartupCost: number;
  unitVariableOMCost: number;
  unitEmissionsCost: number;
  systemCurtailment: number;
  selectionCriteria: number;
  eueDepth: number;
  rpsGeneration: number;
  generation: number;
  eueBenefit: number;
  startAttempts: number;
  capacityFactor: number;
  hoursOnline: number;
}

// Solver Status
export type SolverStatusType = 'ready' | 'running' | 'paused' | 'completed' | 'error';

export const REGIONS: Region[] = ['ERCOT', 'SPP', 'MISO', 'PJM'];
export const MONTHS: Month[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const SOLVER_TYPES: SolverType[] = ['Simple', 'Normal'];
export const SOLUTION_CRITERIA: SolutionCriterion[] = ['Total System Cost Savings', 'Highest Unit Energy Margin'];
export const WEATHER_YEAR_SELECTIONS: WeatherYearSelection[] = ['All', 'Median', 'Peak'];
export const LOAD_UNCERTAINTIES: LoadUncertainty[] = ['All', 'Low', 'Medium', 'High'];
export const UNIT_TYPES: UnitType[] = ['Solar', 'Wind', 'Gas', 'Nuclear'];
export const CONSTRAINT_VARIABLE_TYPES: ConstraintVariableType[] = [
  'LOLE Capacity',
  'EUE Capacity',
  'EUE Depth',
  'Max EUE Duration',
  'LOLH Capacity',
  'LOLEV',
  'Emissions',
  'RPS',
];

export const ESCALATION_VARIABLE_TYPES: EscalationVariableType[] = [
  'Fixed Carrying Cost',
  'Fixed OM',
  'Fixed Cost',
  'Fixed Handling Cost',
  'VOM per Hour',
  'VOM per MWh',
  'Startup Cost',
  'Hot Startup Cost',
];

export const DEFAULT_SETTINGS: ExpansionPlanSettings = {
  unitNameAccountCenter: '',
  simulationYearStepSize: 5,
  baseYear: 2025,
  automatedResubmissionTime: 30,
  economicDiscountRate: 5,
  reliabilityDiscountRate: 5,
  solverType: 'Simple',
  solutionCriterion: 'Total System Cost Savings',
  iterationsPromptYear: 1,
  iterationsFutureYear: 5,
  weatherYearSelection: 'All',
  loadUncertainty: 'All',
  includeOutages: true,
  autoExportResults: true,
  constraints: [],
  escalationInputs: [],
};

// Sample studies for testing
export const SAMPLE_STUDIES: Study[] = [
  {
    id: 'study-1',
    name: 'InterregionalLoad_BaseEmissionLimit_2025',
    startYear: 2025,
    endYear: 2045,
    dateCreated: '2024-06-15T10:30:00Z',
    dateModified: '2024-12-20T14:45:00Z',
    regions: ['ERCOT', 'SPP'],
  },
  {
    id: 'study-2',
    name: 'ERCOT_HighRenewable_Scenario_2030',
    startYear: 2030,
    endYear: 2050,
    dateCreated: '2024-08-01T09:00:00Z',
    dateModified: '2024-12-18T11:20:00Z',
    regions: ['ERCOT'],
  },
  {
    id: 'study-3',
    name: 'PJM_MISO_Interconnection_Study',
    startYear: 2025,
    endYear: 2040,
    dateCreated: '2024-03-10T08:15:00Z',
    dateModified: '2024-11-30T16:00:00Z',
    regions: ['PJM', 'MISO'],
  },
  {
    id: 'study-4',
    name: 'SPP_WindExpansion_Analysis',
    startYear: 2026,
    endYear: 2046,
    dateCreated: '2024-09-22T13:45:00Z',
    dateModified: '2024-12-15T10:30:00Z',
    regions: ['SPP'],
  },
  {
    id: 'study-5',
    name: 'MultiRegion_NetZero_Pathway',
    startYear: 2025,
    endYear: 2050,
    dateCreated: '2024-01-05T07:00:00Z',
    dateModified: '2024-12-28T09:15:00Z',
    regions: ['ERCOT', 'SPP', 'MISO', 'PJM'],
  },
];

// Sample solver logs for testing
export const SAMPLE_SOLVER_LOGS: SolverLog[] = [
  { id: 'log-1', type: 'Info', time: '12/16/2025 1:05 PM', message: 'Starting Expansion Planning Solver' },
  { id: 'log-2', type: 'Info', time: '12/16/2025 1:05 PM', message: 'Starting Simulations for Year 2026 Iteration 0' },
  { id: 'log-3', type: 'Info', time: '12/16/2025 1:25 PM', message: 'Cases finished simulating. Checking on the results' },
  { id: 'log-4', type: 'Info', time: '12/16/2025 3:15 PM', message: 'EUE_Cap/LOLH_Cap * 0.25 is 2192.86 MW...Adding multiple units to the study' },
  { id: 'log-5', type: 'Info', time: '12/16/2025 3:15 PM', message: 'Adding the most efficient expansion planning unit (SPP Candidate_Advanced CT) to study' },
  { id: 'log-6', type: 'Info', time: '12/16/2025 3:15 PM', message: 'Running expansion planning studies with additional expansion units' },
  { id: 'log-7', type: 'Info', time: '12/16/2025 3:33 PM', message: 'Clearing Generated Output' },
  { id: 'log-8', type: 'Info', time: '12/16/2025 3:33 PM', message: 'Starting set of simulations for next year' },
  { id: 'log-9', type: 'Info', time: '12/16/2025 3:33 PM', message: 'Starting Simulations for Year 2026 Iteration 1' },
  { id: 'log-10', type: 'Info', time: '12/16/2025 3:40 PM', message: 'Cases finished simulating. Checking on the results' },
  { id: 'log-11', type: 'Info', time: '12/16/2025 3:41 PM', message: 'EUE_Cap/LOLH_Cap * 0.25 is 1705.207 MW...Adding multiple units to the study' },
  { id: 'log-12', type: 'Info', time: '12/16/2025 3:41 PM', message: 'Adding the most efficient expansion planning unit (SPP Candidate_Advanced CT) to study' },
  { id: 'log-13', type: 'Info', time: '12/16/2025 3:41 PM', message: 'Running expansion planning studies with additional expansion units' },
  { id: 'log-14', type: 'Info', time: '12/16/2025 3:45 PM', message: 'Clearing Generated Output' },
  { id: 'log-15', type: 'Info', time: '12/16/2025 4:07 PM', message: 'Starting Simulations for Year 2026 Iteration 2' },
  { id: 'log-16', type: 'Warning', time: '12/16/2025 4:30 PM', message: 'High memory usage detected, optimizing resources' },
  { id: 'log-17', type: 'Info', time: '12/16/2025 5:44 PM', message: 'Cases finished simulating. Checking on the results' },
  { id: 'log-18', type: 'Info', time: '12/16/2025 5:44 PM', message: 'Solver completed successfully' },
];

// Sample solver results for testing (from CSV)
export const SAMPLE_SOLVER_RESULTS: SolverResult[] = [
  { id: 'res-1', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'North Omaha 1;North Omaha 2', iteration: 0, year: 2026, status: 'Rejected', namePlate: 182.3, energyMargin: 47028.79, npvEnergyMargin: 47028.79, availableMW: 0, npvAvgAvailableMW: 0, fixedCost: 0, fixedCarryingCost: 15000, fixedOMCost: 25000, totalNPVFixedCost: 40000, totalNPVFixedCostMinusMargin: -7028.79, npvFixedCostMarginRatio: -7028785, totalFixedCostMinusMargin: -7028.785, fixedCostMarginRatio: -7028785, loleCapacity: 24, eueCap: 4894463, lolhCap: 4, npvLOLECapacity: 24, npvTotalCost: 49099450000, totalAnnualSystemCost: 49099450000, unitProductionCost: 78129.96, unitFuelCost: 23885.25, unitStartupCost: 1824, unitVariableOMCost: 5992.708, unitEmissionsCost: 46428.02, systemCurtailment: 38.61084, selectionCriteria: 0, eueDepth: 13434.14, rpsGeneration: 31667650, generation: 813.0822, eueBenefit: 0, startAttempts: 25, capacityFactor: 9.24087, hoursOnline: 684 },
  { id: 'res-2', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CC', iteration: 0, year: 2026, status: 'Rejected', namePlate: 1083, energyMargin: 1359819, npvEnergyMargin: 1359819, availableMW: 0, npvAvgAvailableMW: 0, fixedCost: 0, fixedCarryingCost: 35692.37, fixedOMCost: 18762.46, totalNPVFixedCost: 54454.83, totalNPVFixedCostMinusMargin: -1305364.17, npvFixedCostMarginRatio: -1305364000, totalFixedCostMinusMargin: -1305364, fixedCostMarginRatio: -1305364000, loleCapacity: 24, eueCap: 4894463, lolhCap: 4, npvLOLECapacity: 24, npvTotalCost: 49099450000, totalAnnualSystemCost: 49099450000, unitProductionCost: 315253.3, unitFuelCost: 102045.3, unitStartupCost: 0, unitVariableOMCost: 12649.64, unitEmissionsCost: 200557.1, systemCurtailment: 38.61084, selectionCriteria: 0, eueDepth: 13434.14, rpsGeneration: 31667650, generation: 4720, eueBenefit: 0, startAttempts: 168, capacityFactor: 79.62213, hoursOnline: 4720 },
  { id: 'res-3', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CC Edited', iteration: 0, year: 2026, status: 'Rejected', namePlate: 1083, energyMargin: 3895105, npvEnergyMargin: 3895105, availableMW: 0.43548, npvAvgAvailableMW: 0.43548, fixedCost: 10000, fixedCarryingCost: 40000, fixedOMCost: 22514.96, totalNPVFixedCost: 72514.95, totalNPVFixedCostMinusMargin: -3822590.05, npvFixedCostMarginRatio: -8777877, totalFixedCostMinusMargin: -3822590, fixedCostMarginRatio: -8777877, loleCapacity: 24, eueCap: 4894463, lolhCap: 4, npvLOLECapacity: 24, npvTotalCost: 49099450000, totalAnnualSystemCost: 49099450000, unitProductionCost: 373661.8, unitFuelCost: 120703.3, unitStartupCost: 0, unitVariableOMCost: 15008.05, unitEmissionsCost: 237949.2, systemCurtailment: 38.61084, selectionCriteria: 0, eueDepth: 13434.14, rpsGeneration: 31667650, generation: 5600, eueBenefit: 243, startAttempts: 193, capacityFactor: 63.92694, hoursOnline: 5600 },
  { id: 'res-4', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CT', iteration: 0, year: 2026, status: 'Selected 4 Units', namePlate: 1000, energyMargin: 5117889, npvEnergyMargin: 5117889, availableMW: 0.69534, npvAvgAvailableMW: 0.69534, fixedCost: 0, fixedCarryingCost: 27469.52, fixedOMCost: 12419.16, totalNPVFixedCost: 39888.68, totalNPVFixedCostMinusMargin: -5078000.32, npvFixedCostMarginRatio: -7302903, totalFixedCostMinusMargin: -5078001, fixedCostMarginRatio: -7302903, loleCapacity: 24, eueCap: 4894463, lolhCap: 4, npvLOLECapacity: 24, npvTotalCost: 49099450000, totalAnnualSystemCost: 49099450000, unitProductionCost: 176256, unitFuelCost: 74549.55, unitStartupCost: 0, unitVariableOMCost: 13311, unitEmissionsCost: 88395.48, systemCurtailment: 38.61084, selectionCriteria: 0, eueDepth: 13434.14, rpsGeneration: 31667650, generation: 3223, eueBenefit: 388, startAttempts: 634, capacityFactor: 36.79224, hoursOnline: 3223 },
  { id: 'res-5', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Battery2_2HR_StandAlone', iteration: 0, year: 2026, status: 'Rejected', namePlate: 4000, energyMargin: 639717.1, npvEnergyMargin: 639717.1, availableMW: 0, npvAvgAvailableMW: 0, fixedCost: 0, fixedCarryingCost: 27155.22, fixedOMCost: 29488.98, totalNPVFixedCost: 56644.2, totalNPVFixedCostMinusMargin: -583072.9, npvFixedCostMarginRatio: -583072800, totalFixedCostMinusMargin: -583072.9, fixedCostMarginRatio: -583072800, loleCapacity: 24, eueCap: 4894463, lolhCap: 4, npvLOLECapacity: 24, npvTotalCost: 49099450000, totalAnnualSystemCost: 49099450000, unitProductionCost: 0, unitFuelCost: 0, unitStartupCost: 0, unitVariableOMCost: 0, unitEmissionsCost: 0, systemCurtailment: 38.61084, selectionCriteria: 0, eueDepth: 13434.14, rpsGeneration: 31667650, generation: 878.5001, eueBenefit: 0, startAttempts: 551, capacityFactor: 6.04029, hoursOnline: 878 },
  { id: 'res-6', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Battery2_4HR;SPP Candidate_HypoSolar', iteration: 0, year: 2026, status: 'Rejected', namePlate: 5000, energyMargin: 1300643, npvEnergyMargin: 1300643, availableMW: 0.06145, npvAvgAvailableMW: 0.06145, fixedCost: 0, fixedCarryingCost: 64559.45, fixedOMCost: 49586.68, totalNPVFixedCost: 114146.1, totalNPVFixedCostMinusMargin: -1186496.9, npvFixedCostMarginRatio: -19308330, totalFixedCostMinusMargin: -1186497, fixedCostMarginRatio: -19308330, loleCapacity: 24, eueCap: 4894463, lolhCap: 4, npvLOLECapacity: 24, npvTotalCost: 49099450000, totalAnnualSystemCost: 49099450000, unitProductionCost: 0, unitFuelCost: 0, unitStartupCost: 0, unitVariableOMCost: 0, unitEmissionsCost: 0, systemCurtailment: 38.61084, selectionCriteria: 0, eueDepth: 13434.14, rpsGeneration: 31667650, generation: 1739.55, eueBenefit: 130.06, startAttempts: 633, capacityFactor: 19.97058, hoursOnline: 8760 },
  { id: 'res-7', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Battery2_8HR_StandAlone', iteration: 0, year: 2026, status: 'Rejected', namePlate: 4000, energyMargin: 1336108, npvEnergyMargin: 1336108, availableMW: 0, npvAvgAvailableMW: 0, fixedCost: 0, fixedCarryingCost: 124510.6, fixedOMCost: 94649.78, totalNPVFixedCost: 219160.4, totalNPVFixedCostMinusMargin: -1116947.6, npvFixedCostMarginRatio: -1116948000, totalFixedCostMinusMargin: -1116948, fixedCostMarginRatio: -1116948000, loleCapacity: 24, eueCap: 4894463, lolhCap: 4, npvLOLECapacity: 24, npvTotalCost: 49099450000, totalAnnualSystemCost: 49099450000, unitProductionCost: 0, unitFuelCost: 0, unitStartupCost: 0, unitVariableOMCost: 0, unitEmissionsCost: 0, systemCurtailment: 38.61084, selectionCriteria: 0, eueDepth: 13434.14, rpsGeneration: 31667650, generation: 2155.2, eueBenefit: 0, startAttempts: 680, capacityFactor: 14.81848, hoursOnline: 2155 },
  { id: 'res-8', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_HypoSolar', iteration: 0, year: 2026, status: 'Rejected', namePlate: 1000, energyMargin: 1546586, npvEnergyMargin: 1546586, availableMW: 0.20835, npvAvgAvailableMW: 0.20835, fixedCost: 0, fixedCarryingCost: 27297.92, fixedOMCost: 23212.28, totalNPVFixedCost: 50510.2, totalNPVFixedCostMinusMargin: -1496075.8, npvFixedCostMarginRatio: -7180587, totalFixedCostMinusMargin: -1496075, fixedCostMarginRatio: -7180587, loleCapacity: 24, eueCap: 4894463, lolhCap: 4, npvLOLECapacity: 24, npvTotalCost: 49099450000, totalAnnualSystemCost: 49099450000, unitProductionCost: 0, unitFuelCost: 0, unitStartupCost: 0, unitVariableOMCost: 0, unitEmissionsCost: 0, systemCurtailment: 38.61084, selectionCriteria: 0, eueDepth: 13434.14, rpsGeneration: 31667650, generation: 2756.146, eueBenefit: 116.26, startAttempts: 0, capacityFactor: 31.46285, hoursOnline: 8760 },
  { id: 'res-9', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Wind', iteration: 0, year: 2026, status: 'Rejected', namePlate: 1000, energyMargin: 2440841, npvEnergyMargin: 2440841, availableMW: 0.30402, npvAvgAvailableMW: 0.30402, fixedCost: 0, fixedCarryingCost: 69918.15, fixedOMCost: 66796.6, totalNPVFixedCost: 136714.8, totalNPVFixedCostMinusMargin: -2304126.2, npvFixedCostMarginRatio: -7578864, totalFixedCostMinusMargin: -2304126, fixedCostMarginRatio: -7578864, loleCapacity: 24, eueCap: 4894463, lolhCap: 4, npvLOLECapacity: 24, npvTotalCost: 49099450000, totalAnnualSystemCost: 49099450000, unitProductionCost: 0, unitFuelCost: 0, unitStartupCost: 0, unitVariableOMCost: 0, unitEmissionsCost: 0, systemCurtailment: 38.61084, selectionCriteria: 0, eueDepth: 13434.14, rpsGeneration: 31667650, generation: 3131.729, eueBenefit: 169.64, startAttempts: 0, capacityFactor: 35.75033, hoursOnline: 8760 },
  { id: 'res-10', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'North Omaha 1;North Omaha 2', iteration: 1, year: 2026, status: 'Rejected', namePlate: 182.3, energyMargin: 60356.02, npvEnergyMargin: 60356.02, availableMW: 0, npvAvgAvailableMW: 0, fixedCost: 0, fixedCarryingCost: 15000, fixedOMCost: 25000, totalNPVFixedCost: 40000, totalNPVFixedCostMinusMargin: -20356.02, npvFixedCostMarginRatio: -20356010, totalFixedCostMinusMargin: -20356.02, fixedCostMarginRatio: -20356010, loleCapacity: 24, eueCap: 3430877, lolhCap: 14, npvLOLECapacity: 24, npvTotalCost: 35598590000, totalAnnualSystemCost: 35598590000, unitProductionCost: 40898.44, unitFuelCost: 12438.8, unitStartupCost: 1140, unitVariableOMCost: 3123.167, unitEmissionsCost: 24196.47, systemCurtailment: 53.24463, selectionCriteria: 0, eueDepth: 18858.63, rpsGeneration: 31753410, generation: 442.6312, eueBenefit: 0, startAttempts: 16, capacityFactor: 4.99429, hoursOnline: 370 },
  { id: 'res-11', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CC', iteration: 1, year: 2026, status: 'Rejected', namePlate: 1083, energyMargin: 602672.1, npvEnergyMargin: 602672.1, availableMW: 0, npvAvgAvailableMW: 0, fixedCost: 0, fixedCarryingCost: 35692.37, fixedOMCost: 18762.46, totalNPVFixedCost: 54454.83, totalNPVFixedCostMinusMargin: -548217.27, npvFixedCostMarginRatio: -548217300, totalFixedCostMinusMargin: -548217.3, fixedCostMarginRatio: -548217300, loleCapacity: 24, eueCap: 3430877, lolhCap: 14, npvLOLECapacity: 24, npvTotalCost: 35598590000, totalAnnualSystemCost: 35598590000, unitProductionCost: 205818.3, unitFuelCost: 66871.77, unitStartupCost: 0, unitVariableOMCost: 8243.696, unitEmissionsCost: 130702.2, systemCurtailment: 53.24463, selectionCriteria: 0, eueDepth: 18858.63, rpsGeneration: 31753410, generation: 3076, eueBenefit: 0, startAttempts: 192, capacityFactor: 51.88934, hoursOnline: 3076 },
  { id: 'res-12', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CT', iteration: 1, year: 2026, status: 'Selected 3 Units', namePlate: 1000, energyMargin: 3928178, npvEnergyMargin: 3928178, availableMW: 0.6998, npvAvgAvailableMW: 0.6998, fixedCost: 0, fixedCarryingCost: 27469.52, fixedOMCost: 12419.16, totalNPVFixedCost: 39888.68, totalNPVFixedCostMinusMargin: -3888289.32, npvFixedCostMarginRatio: -5556286, totalFixedCostMinusMargin: -3888289, fixedCostMarginRatio: -5556286, loleCapacity: 24, eueCap: 3430877, lolhCap: 14, npvLOLECapacity: 24, npvTotalCost: 35598590000, totalAnnualSystemCost: 35598590000, unitProductionCost: 299610.6, unitFuelCost: 126807.6, unitStartupCost: 0, unitVariableOMCost: 22615.89, unitEmissionsCost: 150187.6, systemCurtailment: 53.24463, selectionCriteria: 0, eueDepth: 18858.63, rpsGeneration: 31753410, generation: 5476, eueBenefit: 352, startAttempts: 434, capacityFactor: 62.51141, hoursOnline: 5476 },
  { id: 'res-13', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Battery2_2HR_StandAlone', iteration: 1, year: 2026, status: 'Rejected', namePlate: 4000, energyMargin: 277052.1, npvEnergyMargin: 277052.1, availableMW: 0, npvAvgAvailableMW: 0, fixedCost: 0, fixedCarryingCost: 27155.22, fixedOMCost: 29488.98, totalNPVFixedCost: 56644.2, totalNPVFixedCostMinusMargin: -220407.9, npvFixedCostMarginRatio: -220407900, totalFixedCostMinusMargin: -220407.9, fixedCostMarginRatio: -220407900, loleCapacity: 24, eueCap: 3430877, lolhCap: 14, npvLOLECapacity: 24, npvTotalCost: 35598590000, totalAnnualSystemCost: 35598590000, unitProductionCost: 0, unitFuelCost: 0, unitStartupCost: 0, unitVariableOMCost: 0, unitEmissionsCost: 0, systemCurtailment: 53.24463, selectionCriteria: 0, eueDepth: 18858.63, rpsGeneration: 31753410, generation: 855.6, eueBenefit: 0, startAttempts: 546, capacityFactor: 5.88284, hoursOnline: 855 },
  { id: 'res-14', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CT', iteration: 2, year: 2026, status: 'Selected 2 Units', namePlate: 1000, energyMargin: 3618786, npvEnergyMargin: 3618786, availableMW: 0.76522, npvAvgAvailableMW: 0.76522, fixedCost: 0, fixedCarryingCost: 27469.52, fixedOMCost: 12419.16, totalNPVFixedCost: 39888.68, totalNPVFixedCostMinusMargin: -3578897.32, npvFixedCostMarginRatio: -4676952, totalFixedCostMinusMargin: -3578897, fixedCostMarginRatio: -4676952, loleCapacity: 24, eueCap: 2457971, lolhCap: 22, npvLOLECapacity: 24, npvTotalCost: 26719880000, totalAnnualSystemCost: 26719880000, unitProductionCost: 340657.6, unitFuelCost: 144187, unitStartupCost: 0, unitVariableOMCost: 25713.33, unitEmissionsCost: 170757.6, systemCurtailment: 60.77734, selectionCriteria: 0, eueDepth: 0, rpsGeneration: 31607140, generation: 6226, eueBenefit: 352, startAttempts: 343, capacityFactor: 71.07306, hoursOnline: 6226 },
  { id: 'res-15', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CT', iteration: 3, year: 2026, status: 'Selected 2 Units', namePlate: 1000, energyMargin: 3037570, npvEnergyMargin: 3037570, availableMW: 0.74242, npvAvgAvailableMW: 0.74242, fixedCost: 0, fixedCarryingCost: 27469.52, fixedOMCost: 12419.16, totalNPVFixedCost: 39888.68, totalNPVFixedCostMinusMargin: -2997681.32, npvFixedCostMarginRatio: -4037716, totalFixedCostMinusMargin: -2997681, fixedCostMarginRatio: -4037716, loleCapacity: 23, eueCap: 1774625, lolhCap: 30, npvLOLECapacity: 23, npvTotalCost: 20536410000, totalAnnualSystemCost: 20536410000, unitProductionCost: 346138.2, unitFuelCost: 146638.3, unitStartupCost: 0, unitVariableOMCost: 26109.8, unitEmissionsCost: 173390.5, systemCurtailment: 50.41455, selectionCriteria: 0, eueDepth: 0, rpsGeneration: 31667640, generation: 6322, eueBenefit: 294, startAttempts: 312, capacityFactor: 72.16895, hoursOnline: 6322 },
  { id: 'res-16', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CT', iteration: 4, year: 2026, status: 'Selected 2 Units', namePlate: 1000, energyMargin: 2407746, npvEnergyMargin: 2407746, availableMW: 0.73041, npvAvgAvailableMW: 0.73041, fixedCost: 0, fixedCarryingCost: 27469.52, fixedOMCost: 12419.16, totalNPVFixedCost: 39888.68, totalNPVFixedCostMinusMargin: -2367857.32, npvFixedCostMarginRatio: -3241819, totalFixedCostMinusMargin: -2367857, fixedCostMarginRatio: -3241819, loleCapacity: 21, eueCap: 1357891, lolhCap: 31, npvLOLECapacity: 21, npvTotalCost: 16789460000, totalAnnualSystemCost: 16789460000, unitProductionCost: 348354.9, unitFuelCost: 147529.5, unitStartupCost: 0, unitVariableOMCost: 26283.26, unitEmissionsCost: 174542.4, systemCurtailment: 57.51367, selectionCriteria: 0, eueDepth: 0, rpsGeneration: 31973870, generation: 6364, eueBenefit: 233, startAttempts: 291, capacityFactor: 72.6484, hoursOnline: 6364 },
  { id: 'res-17', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CT', iteration: 5, year: 2026, status: 'Selected 2 Units', namePlate: 1000, energyMargin: 2074609, npvEnergyMargin: 2074609, availableMW: 0.7393, npvAvgAvailableMW: 0.7393, fixedCost: 0, fixedCarryingCost: 27469.52, fixedOMCost: 12419.16, totalNPVFixedCost: 39888.68, totalNPVFixedCostMinusMargin: -2034720.32, npvFixedCostMarginRatio: -2752225, totalFixedCostMinusMargin: -2034720, fixedCostMarginRatio: -2752225, loleCapacity: 21, eueCap: 987094.6, lolhCap: 28, npvLOLECapacity: 21, npvTotalCost: 13458740000, totalAnnualSystemCost: 13458740000, unitProductionCost: 359240.8, unitFuelCost: 152040.9, unitStartupCost: 0, unitVariableOMCost: 27117.49, unitEmissionsCost: 180082.5, systemCurtailment: 54.89355, selectionCriteria: 0, eueDepth: 0, rpsGeneration: 31607140, generation: 6566, eueBenefit: 190, startAttempts: 253, capacityFactor: 74.95434, hoursOnline: 6566 },
  { id: 'res-18', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CT', iteration: 6, year: 2026, status: 'Selected 2 Units', namePlate: 1000, energyMargin: 1634282, npvEnergyMargin: 1634282, availableMW: 0.74619, npvAvgAvailableMW: 0.74619, fixedCost: 0, fixedCarryingCost: 27469.52, fixedOMCost: 12419.16, totalNPVFixedCost: 39888.68, totalNPVFixedCostMinusMargin: -1594393.32, npvFixedCostMarginRatio: -2136712, totalFixedCostMinusMargin: -1594393, fixedCostMarginRatio: -2136712, loleCapacity: 17, eueCap: 747007.8, lolhCap: 21, npvLOLECapacity: 17, npvTotalCost: 11339710000, totalAnnualSystemCost: 11339710000, unitProductionCost: 359468, unitFuelCost: 152110.4, unitStartupCost: 0, unitVariableOMCost: 27138.14, unitEmissionsCost: 180219.6, systemCurtailment: 55.30371, selectionCriteria: 0, eueDepth: 0, rpsGeneration: 31607140, generation: 6571, eueBenefit: 147, startAttempts: 247, capacityFactor: 75.01141, hoursOnline: 6571 },
  { id: 'res-19', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CT', iteration: 7, year: 2026, status: 'Selected 1 Units', namePlate: 1000, energyMargin: 1483141, npvEnergyMargin: 1483141, availableMW: 0.88312, npvAvgAvailableMW: 0.88312, fixedCost: 0, fixedCarryingCost: 27469.52, fixedOMCost: 12419.16, totalNPVFixedCost: 39888.68, totalNPVFixedCostMinusMargin: -1443252.32, npvFixedCostMarginRatio: -1634265, totalFixedCostMinusMargin: -1443252, fixedCostMarginRatio: -1634265, loleCapacity: 13, eueCap: 528678.9, lolhCap: 16, npvLOLECapacity: 13, npvTotalCost: 9436462000, totalAnnualSystemCost: 9436462000, unitProductionCost: 361626.4, unitFuelCost: 153038, unitStartupCost: 0, unitVariableOMCost: 27299.21, unitEmissionsCost: 181289.2, systemCurtailment: 54.90869, selectionCriteria: 0, eueDepth: 0, rpsGeneration: 31607140, generation: 6610, eueBenefit: 136, startAttempts: 245, capacityFactor: 75.45662, hoursOnline: 6610 },
  { id: 'res-20', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CT', iteration: 8, year: 2026, status: 'Selected 1 Units', namePlate: 1000, energyMargin: 1357450, npvEnergyMargin: 1357450, availableMW: 0.84028, npvAvgAvailableMW: 0.84028, fixedCost: 0, fixedCarryingCost: 27469.52, fixedOMCost: 12419.16, totalNPVFixedCost: 39888.68, totalNPVFixedCostMinusMargin: -1317561.32, npvFixedCostMarginRatio: -1568002, totalFixedCostMinusMargin: -1317561, fixedCostMarginRatio: -1568002, loleCapacity: 13, eueCap: 406738.4, lolhCap: 18, npvLOLECapacity: 13, npvTotalCost: 8369981000, totalAnnualSystemCost: 8369981000, unitProductionCost: 361071, unitFuelCost: 152829.8, unitStartupCost: 0, unitVariableOMCost: 27253.78, unitEmissionsCost: 180987.6, systemCurtailment: 53.6875, selectionCriteria: 0, eueDepth: 0, rpsGeneration: 31607140, generation: 6599, eueBenefit: 121, startAttempts: 238, capacityFactor: 75.33105, hoursOnline: 6599 },
  { id: 'res-21', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CT', iteration: 9, year: 2026, status: 'Selected 1 Units', namePlate: 1000, energyMargin: 1203600, npvEnergyMargin: 1203600, availableMW: 0.97273, npvAvgAvailableMW: 0.97273, fixedCost: 0, fixedCarryingCost: 27469.52, fixedOMCost: 12419.16, totalNPVFixedCost: 39888.68, totalNPVFixedCostMinusMargin: -1163711.32, npvFixedCostMarginRatio: -1196335, totalFixedCostMinusMargin: -1163711, fixedCostMarginRatio: -1196335, loleCapacity: 10, eueCap: 352182.4, lolhCap: 17, npvLOLECapacity: 10, npvTotalCost: 7918219000, totalAnnualSystemCost: 7918219000, unitProductionCost: 361676.9, unitFuelCost: 153056.9, unitStartupCost: 0, unitVariableOMCost: 27303.34, unitEmissionsCost: 181316.7, systemCurtailment: 58.7002, selectionCriteria: 0, eueDepth: 0, rpsGeneration: 31607140, generation: 6611, eueBenefit: 107, startAttempts: 236, capacityFactor: 75.46803, hoursOnline: 6611 },
  { id: 'res-22', expansionPlanId: '', study: 'Dec16_EP_Base', candidate: 'SPP Candidate_Advanced CT', iteration: 10, year: 2026, status: 'Selected 1 Units', namePlate: 1000, energyMargin: 964438.6, npvEnergyMargin: 964438.6, availableMW: 0.73913, npvAvgAvailableMW: 0.73913, fixedCost: 0, fixedCarryingCost: 27469.52, fixedOMCost: 12419.16, totalNPVFixedCost: 39888.68, totalNPVFixedCostMinusMargin: -924549.92, npvFixedCostMarginRatio: -1250862, totalFixedCostMinusMargin: -924549.9, fixedCostMarginRatio: -1250862, loleCapacity: 11, eueCap: 294185, lolhCap: 15, npvLOLECapacity: 11, npvTotalCost: 7434477000, totalAnnualSystemCost: 7434477000, unitProductionCost: 361318.6, unitFuelCost: 152982.9, unitStartupCost: 0, unitVariableOMCost: 27266.17, unitEmissionsCost: 181069.9, systemCurtailment: 51.20703, selectionCriteria: 0, eueDepth: 0, rpsGeneration: 31607140, generation: 6602, eueBenefit: 85, startAttempts: 238, capacityFactor: 75.3653, hoursOnline: 6602 },
];
