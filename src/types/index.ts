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
  availableMwInEueHours: number;
  npvAvgAvailableMwInEueHours: number;
  fixedCost: number;
  fixedCarryingCost: number;
  fixedOmCost: number;
  totalNpvFixedCost: number;
  totalNpvFixedCostMinusNpvEnergyMargin: number;
  totalNpvFixedCostMinusNpvEnergyMarginPerNpvAvailableMw: number;
  totalFixedCostMinusEnergyMargin: number;
  totalFixedCostMinusEnergyMarginPerAvailableMw: number;
  loleCapacity: number;
  eueCap: number;
  lolhCap: number;
  npvLoleCapacity: number;
  npvTotalCost: number;
  totalAnnualSystemCost: number;
  unitProductionCost: number;
  unitFuelCost: number;
  unitStartupCost: number;
  unitVariableOmCost: number;
  unitEmissionsCost: number;
  systemCurtailment: number;
  selectionCriteria: string;
  eueDepth: number;
  rpsGeneration: number;
  generation: number;
  eueBenefit: number;
  startAttempts: number;
  capacityFactor: number;
  hoursOnline: number;
}

// Solver Status
export type SolverStatusType = 'inactive' | 'running' | 'paused' | 'finished' | 'error';

// NPV Result Row
export interface NPVResult {
  id: string;
  expansionPlanId: string;
  study: string;
  iteration: number;
  evalYear: number;
  stage: string;
  year: number;
  candidate: string;
  loleCapacity: number;
  discLoleCapacity: number;
  margin: number;
  discMargin: number;
  totalCost: number;
  discTotalCost: number;
  prodCost: number;
  discProdCost: number;
  fuelCost: number;
  discFuelCost: number;
}

// Unit Addition Result
export type TechnologyType = 'Combined Cycle' | 'Solar PV' | 'Wind' | 'Battery' | 'Gas Turbine' | 'Nuclear';

export interface UnitAdditionResult {
  id: string;
  expansionPlanId: string;
  candidate: string;
  technology: TechnologyType;
  totalCapacity: number;
  year2026: number;
  year2027: number;
  year2028: number;
  year2029: number;
  year2030: number;
  capex: number;
  region: Region;
}

// Unit Retirement Result
export interface UnitRetirementResult {
  id: string;
  expansionPlanId: string;
  candidate: string;
  technology: string;
  totalCapacity: number;
  year2026: number;
  year2027: number;
  year2028: number;
  year2029: number;
  year2030: number;
  omCost: number;
  region: Region;
}

// Run Case - represents a running/queued solver case
export type RunCaseStatus = 'Running' | 'Paused' | 'Inactive' | 'Error' | 'Finished';

export interface RunCase {
  id: string;
  expansionPlanId: string;
  expansionPlanName: string;
  study: string;
  region: Region;
  status: RunCaseStatus;
  cycle: number;
  caseRunning: number;
  totalCapacityBuilt: string;
  totalCapacityRetired: string;
  horizon: string;
}

export const TECHNOLOGY_TYPES: TechnologyType[] = ['Combined Cycle', 'Solar PV', 'Wind', 'Battery', 'Gas Turbine', 'Nuclear'];

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
