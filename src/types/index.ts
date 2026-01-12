export type Region = 'ERCOT' | 'SPP' | 'MISO' | 'PJM' | 'Mexico';
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

// Unit - represents a generation unit in the system
export interface Unit {
  unitId: number;
  unitName: string;
  unitDescription: string;
  originalCapMax: number; // MW
  guiCapMax: number; // MW
  guiCapMin: number; // MW
  startDate: number;
  endDate: number;
  guiEfor: number; // Equivalent Forced Outage Rate
  unitType: string;
  year: number;
  regionId: number;
  regionDescription: string;
  unitActive: boolean;
  debugSelected: boolean;
  unitCategoryDescription: string;
  unitCategoryId: number;
  startMonth: number; // 0-11
  endMonth: number; // 0-11
  insvdt: string; // In-service date
  retirementDate: string;
  handlingCost: number; // $/kW-yr
  fixedCarryingCost: number; // $/kW-yr
  fixedCost: number; // $/kW-yr
  fixedOm: number; // $/kW-yr
  startupCost: number; // $/start
  hotStartupCost: number; // $/start
  coldStartupCost: number; // $/start
  warmStartupCost: number; // $/start
  vomPerMwh: number; // $/MWh
  vomPerHour: number; // $/hour
  fuel: number; // Fuel type ID
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

export const REGIONS: Region[] = ['ERCOT', 'SPP', 'MISO', 'PJM', 'Mexico'];
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
  {
    id: 'study-6',
    name: 'SPP_Mexico_Scenario',
    startYear: 2030,
    endYear: 2035,
    dateCreated: '2025-01-10T14:00:00Z',
    dateModified: '2026-01-12T09:30:00Z',
    regions: ['SPP', 'Mexico'],
  },
];

// Sample units for testing
export const SAMPLE_UNITS: Unit[] = [
  {
    unitId: 1,
    unitName: 'Adv CC',
    unitDescription: 'Advanced Combined Cycle Gas Turbine',
    originalCapMax: 1083,
    guiCapMax: 1083,
    guiCapMin: 325,
    startDate: 2025,
    endDate: 2065,
    guiEfor: 0.05,
    unitType: 'Combined Cycle',
    year: 2025,
    regionId: 1,
    regionDescription: 'SPP',
    unitActive: true,
    debugSelected: false,
    unitCategoryDescription: 'Natural Gas',
    unitCategoryId: 1,
    startMonth: 0,
    endMonth: 11,
    insvdt: '2025-01-01',
    retirementDate: '2065-12-31',
    handlingCost: 0,
    fixedCarryingCost: 200000,
    fixedCost: 0,
    fixedOm: 22514.96,
    startupCost: 85000,
    hotStartupCost: 45000,
    coldStartupCost: 125000,
    warmStartupCost: 85000,
    vomPerMwh: 2.68,
    vomPerHour: 0,
    fuel: 1,
  },
  {
    unitId: 2,
    unitName: 'Adv CT',
    unitDescription: 'Advanced Combustion Turbine',
    originalCapMax: 237,
    guiCapMax: 237,
    guiCapMin: 95,
    startDate: 2025,
    endDate: 2060,
    guiEfor: 0.06,
    unitType: 'Combustion Turbine',
    year: 2025,
    regionId: 1,
    regionDescription: 'SPP',
    unitActive: true,
    debugSelected: false,
    unitCategoryDescription: 'Natural Gas',
    unitCategoryId: 1,
    startMonth: 0,
    endMonth: 11,
    insvdt: '2025-01-01',
    retirementDate: '2060-12-31',
    handlingCost: 0,
    fixedCarryingCost: 150000,
    fixedCost: 0,
    fixedOm: 12410,
    startupCost: 25000,
    hotStartupCost: 15000,
    coldStartupCost: 35000,
    warmStartupCost: 25000,
    vomPerMwh: 4.5,
    vomPerHour: 0,
    fuel: 1,
  },
  {
    unitId: 3,
    unitName: 'Battery 4HR',
    unitDescription: '4-Hour Lithium-Ion Battery Storage',
    originalCapMax: 200,
    guiCapMax: 200,
    guiCapMin: 0,
    startDate: 2025,
    endDate: 2045,
    guiEfor: 0.02,
    unitType: 'Battery Storage',
    year: 2025,
    regionId: 1,
    regionDescription: 'SPP',
    unitActive: true,
    debugSelected: false,
    unitCategoryDescription: 'Energy Storage',
    unitCategoryId: 5,
    startMonth: 0,
    endMonth: 11,
    insvdt: '2025-01-01',
    retirementDate: '2045-12-31',
    handlingCost: 0,
    fixedCarryingCost: 180200,
    fixedCost: 0,
    fixedOm: 22500,
    startupCost: 100,
    hotStartupCost: 100,
    coldStartupCost: 100,
    warmStartupCost: 100,
    vomPerMwh: 0.5,
    vomPerHour: 0,
    fuel: 0,
  },
  {
    unitId: 4,
    unitName: 'Battery + Solar',
    unitDescription: 'Hybrid Battery Storage with Solar PV',
    originalCapMax: 350,
    guiCapMax: 350,
    guiCapMin: 0,
    startDate: 2025,
    endDate: 2050,
    guiEfor: 0.03,
    unitType: 'Hybrid Solar+Storage',
    year: 2025,
    regionId: 1,
    regionDescription: 'SPP',
    unitActive: true,
    debugSelected: false,
    unitCategoryDescription: 'Renewable Hybrid',
    unitCategoryId: 6,
    startMonth: 0,
    endMonth: 11,
    insvdt: '2025-01-01',
    retirementDate: '2050-12-31',
    handlingCost: 0,
    fixedCarryingCost: 245800,
    fixedCost: 0,
    fixedOm: 35200,
    startupCost: 50,
    hotStartupCost: 50,
    coldStartupCost: 50,
    warmStartupCost: 50,
    vomPerMwh: 0,
    vomPerHour: 0,
    fuel: 0,
  },
  {
    unitId: 5,
    unitName: 'Solar W',
    unitDescription: 'Utility-Scale Solar PV (West)',
    originalCapMax: 250,
    guiCapMax: 250,
    guiCapMin: 0,
    startDate: 2025,
    endDate: 2055,
    guiEfor: 0.02,
    unitType: 'Solar PV',
    year: 2025,
    regionId: 1,
    regionDescription: 'SPP',
    unitActive: true,
    debugSelected: false,
    unitCategoryDescription: 'Solar',
    unitCategoryId: 3,
    startMonth: 0,
    endMonth: 11,
    insvdt: '2025-01-01',
    retirementDate: '2055-12-31',
    handlingCost: 0,
    fixedCarryingCost: 165500,
    fixedCost: 0,
    fixedOm: 18500,
    startupCost: 0,
    hotStartupCost: 0,
    coldStartupCost: 0,
    warmStartupCost: 0,
    vomPerMwh: 0,
    vomPerHour: 0,
    fuel: 0,
  },
  {
    unitId: 6,
    unitName: 'Wind W',
    unitDescription: 'Utility-Scale Wind Farm (West)',
    originalCapMax: 300,
    guiCapMax: 300,
    guiCapMin: 0,
    startDate: 2025,
    endDate: 2050,
    guiEfor: 0.04,
    unitType: 'Wind',
    year: 2025,
    regionId: 1,
    regionDescription: 'SPP',
    unitActive: true,
    debugSelected: false,
    unitCategoryDescription: 'Wind',
    unitCategoryId: 4,
    startMonth: 0,
    endMonth: 11,
    insvdt: '2025-01-01',
    retirementDate: '2050-12-31',
    handlingCost: 0,
    fixedCarryingCost: 145200,
    fixedCost: 0,
    fixedOm: 15800,
    startupCost: 0,
    hotStartupCost: 0,
    coldStartupCost: 0,
    warmStartupCost: 0,
    vomPerMwh: 0,
    vomPerHour: 0,
    fuel: 0,
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
