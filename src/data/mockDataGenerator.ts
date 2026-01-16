// Mock data generator for plan-specific results
// Generates dummy data for Solver Results, NPV Results, Unit Additions, and Unit Retirements
// Each plan gets VISUALLY DISTINCT data so users can see data change when switching plans

import {
  SolverResult,
  NPVResult,
  UnitAdditionResult,
  UnitRetirementResult,
  SolverLog,
  LogType,
  Region,
  TechnologyType,
} from '../types';

interface PlanInfo {
  id: string;
  name: string;
  region: Region;
  planningHorizonStart: number;
  planningHorizonEnd: number;
}

// Multipliers per region to make values visually distinct
const REGION_MULTIPLIERS: Record<Region, number> = {
  ERCOT: 1.0,
  SPP: 1.5,
  MISO: 2.0,
  PJM: 2.5,
  Mexico: 0.75,
};

// Candidate names by region
const CANDIDATES_BY_REGION: Record<Region, string[]> = {
  ERCOT: [
    'ERCOT Candidate_Advanced CC',
    'ERCOT Candidate_Advanced CT',
    'ERCOT Wind Farm Alpha',
    'ERCOT Solar West',
    'ERCOT Battery 4HR',
  ],
  SPP: [
    'SPP Candidate_Advanced CC',
    'SPP Candidate_Advanced CT',
    'SPP Candidate_HypoSolar',
    'SPP Candidate_Wind',
    'SPP Candidate_Battery2_4HR',
  ],
  MISO: [
    'MISO Candidate_Advanced CC',
    'MISO Candidate_Gas Turbine',
    'MISO Solar Farm',
    'MISO Wind North',
    'MISO Battery Storage',
  ],
  PJM: [
    'PJM Candidate_Combined Cycle',
    'PJM Candidate_Peaker',
    'PJM Solar East',
    'PJM Offshore Wind',
    'PJM Grid Battery',
  ],
  Mexico: [
    'Mexico Candidate_Gas CC',
    'Mexico Candidate_Solar',
    'Mexico Wind Farm',
    'Mexico Thermal',
    'Mexico Storage',
  ],
};

const RETIREMENT_CANDIDATES: Record<Region, string[]> = {
  ERCOT: ['ERCOT Coal Unit 1', 'ERCOT Old Gas Plant', 'ERCOT Legacy Nuclear'],
  SPP: ['North Omaha Coal 1', 'North Omaha Coal 2', 'SPP Legacy Gas Unit'],
  MISO: ['MISO Coal Plant A', 'MISO Old Peaker', 'MISO Aging Gas Unit'],
  PJM: ['PJM Coal Unit Alpha', 'PJM Retired Gas', 'PJM Old Nuclear'],
  Mexico: ['Mexico Thermal Old', 'Mexico Legacy Gas', 'Mexico Coal Plant'],
};

const TECHNOLOGIES: TechnologyType[] = ['Combined Cycle', 'Gas Turbine', 'Solar PV', 'Wind', 'Battery', 'Nuclear'];

// Generate random number within range
const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate random float with precision
const randomFloat = (min: number, max: number, decimals: number = 2): number => {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
};

// Generate Solver Results for a plan
export function generateSolverResults(plan: PlanInfo): SolverResult[] {
  const results: SolverResult[] = [];
  const candidates = CANDIDATES_BY_REGION[plan.region] || CANDIDATES_BY_REGION.ERCOT;
  const startYear = plan.planningHorizonStart;
  const endYear = Math.min(plan.planningHorizonEnd, startYear + 5); // Limit to 5 years for demo
  const multiplier = REGION_MULTIPLIERS[plan.region] || 1.0;

  let idCounter = 1;

  for (let year = startYear; year <= endYear; year++) {
    for (let iteration = 0; iteration <= 14; iteration++) {
      for (const candidate of candidates) {
        const isSelected = iteration > 3 && Math.random() > 0.7;
        const namePlate = Math.round(randomInRange(200, 1500) * multiplier);
        const energyMargin = randomFloat(100000, 5000000) * multiplier;
        const loleCapacity = randomFloat(5, 25) * multiplier;
        const totalCost = randomFloat(5000000000, 50000000000) * multiplier;

        results.push({
          id: `result-${plan.id}-${idCounter++}`,
          expansionPlanId: plan.id,
          study: `[${plan.region}] ${plan.name}`,
          candidate,
          iteration,
          year,
          status: isSelected ? `Selected ${randomInRange(1, 4)} Units` : 'Rejected',
          namePlate,
          energyMargin,
          npvEnergyMargin: energyMargin * 0.95,
          availableMwInEueHours: isSelected ? randomFloat(0.3, 0.8) : 0,
          npvAvgAvailableMwInEueHours: isSelected ? randomFloat(0.3, 0.8) : 0,
          fixedCost: randomFloat(0, 15000) * multiplier,
          fixedCarryingCost: randomFloat(20000, 150000) * multiplier,
          fixedOmCost: randomFloat(10000, 50000) * multiplier,
          totalNpvFixedCost: randomFloat(40000, 200000) * multiplier,
          totalNpvFixedCostMinusNpvEnergyMargin: randomFloat(-5000000, -100000) * multiplier,
          totalNpvFixedCostMinusNpvEnergyMarginPerNpvAvailableMw: randomFloat(-10000000, -1000000) * multiplier,
          totalFixedCostMinusEnergyMargin: randomFloat(-5000000, -100000) * multiplier,
          totalFixedCostMinusEnergyMarginPerAvailableMw: randomFloat(-10000000, -1000000) * multiplier,
          loleCapacity,
          eueCap: randomFloat(1000000, 5000000) * multiplier,
          lolhCap: randomFloat(4, 35) * multiplier,
          npvLoleCapacity: loleCapacity,
          npvTotalCost: totalCost,
          totalAnnualSystemCost: totalCost,
          unitProductionCost: randomFloat(50000, 400000) * multiplier,
          unitFuelCost: randomFloat(20000, 150000) * multiplier,
          unitStartupCost: randomFloat(0, 2000) * multiplier,
          unitVariableOmCost: randomFloat(5000, 30000) * multiplier,
          unitEmissionsCost: randomFloat(40000, 200000) * multiplier,
          systemCurtailment: randomFloat(30, 70),
          selectionCriteria: isSelected ? 'Highest Performing Unit - NPV - Cost' : '',
          eueDepth: randomFloat(0, 20000) * multiplier,
          rpsGeneration: randomFloat(30000000, 35000000) * multiplier,
          generation: randomFloat(500, 8000) * multiplier,
          eueBenefit: isSelected ? randomFloat(100, 400) * multiplier : 0,
          startAttempts: randomInRange(0, 700),
          capacityFactor: randomFloat(5, 80),
          hoursOnline: randomFloat(500, 8760),
        });
      }
    }
  }

  return results;
}

// Generate NPV Results for a plan
export function generateNpvResults(plan: PlanInfo): NPVResult[] {
  const results: NPVResult[] = [];
  const candidates = ['Base', ...CANDIDATES_BY_REGION[plan.region] || []];
  const startYear = plan.planningHorizonStart;
  const endYear = Math.min(plan.planningHorizonEnd, startYear + 5);
  const multiplier = REGION_MULTIPLIERS[plan.region] || 1.0;

  let idCounter = 1;

  for (let evalYear = startYear; evalYear <= endYear; evalYear += 5) {
    for (let iteration = 1; iteration <= 14; iteration++) {
      for (let year = evalYear; year <= Math.min(evalYear + 6, endYear); year++) {
        const candidate = candidates[Math.floor(Math.random() * candidates.length)];
        const stage = year - evalYear < 3 ? 'Stage 1' : 'Stage 2';
        const loleCapacity = randomFloat(5, 25) * multiplier;
        const discountFactor = Math.pow(1.05, evalYear - year);
        const totalCost = randomFloat(5000000, 50000000) * multiplier;
        const prodCost = randomFloat(3000000, 5000000) * multiplier;
        const fuelCost = randomFloat(1500000, 2000000) * multiplier;
        const margin = candidate === 'Base' ? 0 : randomFloat(100000, 250000) * multiplier;

        results.push({
          id: `npv-${plan.id}-${idCounter++}`,
          expansionPlanId: plan.id,
          study: `[${plan.region}] ${plan.name}`,
          iteration,
          evalYear,
          stage,
          year,
          candidate,
          loleCapacity,
          discLoleCapacity: loleCapacity * discountFactor,
          margin,
          discMargin: margin * discountFactor,
          totalCost,
          discTotalCost: totalCost * discountFactor,
          prodCost,
          discProdCost: prodCost * discountFactor,
          fuelCost,
          discFuelCost: fuelCost * discountFactor,
        });
      }
    }
  }

  return results;
}

// Generate Unit Addition Results for a plan
export function generateUnitAdditionResults(plan: PlanInfo): UnitAdditionResult[] {
  const results: UnitAdditionResult[] = [];
  const candidates = CANDIDATES_BY_REGION[plan.region] || CANDIDATES_BY_REGION.ERCOT;
  const startYear = plan.planningHorizonStart;
  const endYear = plan.planningHorizonEnd;
  const numYears = endYear - startYear + 1;
  const multiplier = REGION_MULTIPLIERS[plan.region] || 1.0;

  let idCounter = 1;

  for (const candidate of candidates) {
    const technology = TECHNOLOGIES[Math.floor(Math.random() * TECHNOLOGIES.length)];
    const totalCapacity = Math.round(randomInRange(20000, 200000) * multiplier);

    // Distribute capacity across all years in the planning horizon
    const yearDistribution = distributeCapacity(totalCapacity, numYears);

    // Build dynamic yearly capacity object
    const yearlyCapacity: Record<number, number> = {};
    for (let i = 0; i < numYears; i++) {
      yearlyCapacity[startYear + i] = yearDistribution[i];
    }

    results.push({
      id: `add-${plan.id}-${idCounter++}`,
      expansionPlanId: plan.id,
      candidate: `[${plan.region}] ${candidate}`,
      technology,
      totalCapacity,
      yearlyCapacity,
      capex: Math.round(totalCapacity * randomInRange(1500, 3000) * multiplier),
      region: plan.region,
    });
  }

  return results;
}

// Generate Unit Retirement Results for a plan
export function generateUnitRetirementResults(plan: PlanInfo): UnitRetirementResult[] {
  const results: UnitRetirementResult[] = [];
  const candidates = RETIREMENT_CANDIDATES[plan.region] || RETIREMENT_CANDIDATES.ERCOT;
  const startYear = plan.planningHorizonStart;
  const endYear = plan.planningHorizonEnd;
  const numYears = endYear - startYear + 1;
  const multiplier = REGION_MULTIPLIERS[plan.region] || 1.0;

  let idCounter = 1;

  // Always generate retirements to make data more visible
  for (const candidate of candidates.slice(0, 2)) { // Only first 2 retirement candidates
    const totalCapacity = Math.round(randomInRange(75000, 150000) * multiplier);
    const yearDistribution = distributeCapacity(totalCapacity, numYears);

    // Build dynamic yearly capacity object
    const yearlyCapacity: Record<number, number> = {};
    for (let i = 0; i < numYears; i++) {
      yearlyCapacity[startYear + i] = yearDistribution[i];
    }

    results.push({
      id: `ret-${plan.id}-${idCounter++}`,
      expansionPlanId: plan.id,
      candidate: `[${plan.region}] ${candidate}`,
      technology: candidate.includes('Coal') ? 'Coal' : 'Gas',
      totalCapacity,
      yearlyCapacity,
      omCost: Math.round(randomInRange(4000000, 10000000) * multiplier),
      region: plan.region,
    });
  }

  return results;
}

// Helper to distribute capacity across years
function distributeCapacity(total: number, years: number): number[] {
  const distribution: number[] = [];
  let remaining = total;

  for (let i = 0; i < years - 1; i++) {
    if (Math.random() > 0.6) { // 40% chance of capacity in any given year
      const amount = Math.floor(remaining * Math.random() * 0.5);
      distribution.push(amount);
      remaining -= amount;
    } else {
      distribution.push(0);
    }
  }
  distribution.push(remaining > 0 && Math.random() > 0.3 ? remaining : 0);

  return distribution;
}

// Generate Solver Logs for a plan
export function generateSolverLogs(plan: PlanInfo): SolverLog[] {
  const logs: SolverLog[] = [];
  const candidates = CANDIDATES_BY_REGION[plan.region] || CANDIDATES_BY_REGION.ERCOT;
  const startYear = plan.planningHorizonStart;

  // Generate a realistic sequence of solver log messages
  const baseDate = new Date();
  let logId = 1;

  const addLog = (type: LogType, message: string, minutesOffset: number) => {
    const logDate = new Date(baseDate.getTime() + minutesOffset * 60 * 1000);
    logs.push({
      id: `log-${plan.id}-${logId++}`,
      expansionPlanId: plan.id,
      type,
      time: logDate.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      message,
    });
  };

  // Initial startup messages
  addLog('Info', `Starting Expansion Planning Solver for [${plan.region}] ${plan.name}`, 0);
  addLog('Info', `Loading study configuration: ${plan.planningHorizonStart}-${plan.planningHorizonEnd}`, 1);
  addLog('Info', `Region: ${plan.region} | Candidates: ${candidates.length}`, 2);

  // Simulation messages for multiple iterations
  let minuteOffset = 5;
  for (let iteration = 0; iteration <= 3; iteration++) {
    addLog('Info', `Starting Simulations for Year ${startYear} Iteration ${iteration}`, minuteOffset);
    minuteOffset += 20;

    addLog('Info', 'Cases finished simulating. Checking on the results', minuteOffset);
    minuteOffset += 2;

    const eueCap = (2500 - iteration * 400) * (REGION_MULTIPLIERS[plan.region] || 1);
    addLog('Info', `EUE_Cap/LOLH_Cap * 0.25 is ${eueCap.toFixed(2)} MW...Adding multiple units to the study`, minuteOffset);
    minuteOffset += 1;

    const selectedCandidate = candidates[iteration % candidates.length];
    addLog('Info', `Adding the most efficient expansion planning unit (${selectedCandidate}) to study`, minuteOffset);
    minuteOffset += 1;

    addLog('Info', 'Running expansion planning studies with additional expansion units', minuteOffset);
    minuteOffset += 15;

    if (iteration === 2) {
      addLog('Warning', `[${plan.region}] High memory usage detected, optimizing resources`, minuteOffset);
      minuteOffset += 5;
    }

    addLog('Info', 'Clearing Generated Output', minuteOffset);
    minuteOffset += 2;

    if (iteration < 3) {
      addLog('Info', 'Starting set of simulations for next iteration', minuteOffset);
      minuteOffset += 3;
    }
  }

  addLog('Info', `[${plan.region}] Solver completed successfully for ${plan.name}`, minuteOffset);

  return logs;
}

// EP Results data types
export interface EPYearlyMetric {
  n: string;
  u: string;
  b: boolean;
}

export interface EPYearlyDataRow {
  t: string;
  b: number;
  s: string;
  y: number;
  [metric: string]: string | number;
}

export interface EPYearlyData {
  m: EPYearlyMetric[];
  d: EPYearlyDataRow[];
}

// Generate EP Results data for a plan
export function generateEPResultsData(plan: PlanInfo): EPYearlyData {
  const candidates = CANDIDATES_BY_REGION[plan.region] || CANDIDATES_BY_REGION.ERCOT;
  const multiplier = REGION_MULTIPLIERS[plan.region] || 1.0;
  const startYear = plan.planningHorizonStart;
  const endYear = Math.min(plan.planningHorizonEnd, startYear + 10);

  const metrics: EPYearlyMetric[] = [
    {n: 'Added Capacity', u: 'MW', b: false},
    {n: 'Energy Margin', u: '$/MW', b: false},
    {n: '% of Capacity Available in EUE Hours', u: '%', b: false},
    {n: 'Fixed Cost', u: '$/MW', b: false},
    {n: 'Fixed Carrying Cost', u: '$/MW', b: false},
    {n: 'Fixed OM Cost', u: '$/MW', b: false},
    {n: 'Profit/Energy Production', u: '$/MWh', b: false},
    {n: 'Profit/Nameplate MW', u: '$/MW', b: false},
    {n: 'LOLE', u: 'Days/Year', b: true},
    {n: 'EUE', u: 'MWh', b: true},
    {n: 'LOLH', u: 'Hours', b: true},
    {n: 'System Cost', u: '$B', b: true},
    {n: 'Production Cost', u: '$M', b: true},
    {n: 'RPS Generation', u: 'TWh', b: true},
    {n: 'Curtailment', u: 'GWh', b: true},
  ];

  const data: EPYearlyDataRow[] = [];

  for (let year = startYear; year <= endYear; year++) {
    for (let build = 1; build <= 3; build++) {
      for (const tech of candidates) {
        const row: EPYearlyDataRow = {
          t: tech,
          b: build,
          s: `[${plan.region}] ${plan.name}`,
          y: year,
        };

        // Generate metric values with region multiplier for distinction
        row['Added Capacity'] = Math.round(randomFloat(100, 500) * multiplier);
        row['Energy Margin'] = Math.round(randomFloat(50000, 200000) * multiplier);
        row['% of Capacity Available in EUE Hours'] = randomFloat(20, 80);
        row['Fixed Cost'] = Math.round(randomFloat(5000, 15000) * multiplier);
        row['Fixed Carrying Cost'] = Math.round(randomFloat(100000, 200000) * multiplier);
        row['Fixed OM Cost'] = Math.round(randomFloat(15000, 40000) * multiplier);
        row['Profit/Energy Production'] = randomFloat(5, 25) * multiplier;
        row['Profit/Nameplate MW'] = Math.round(randomFloat(50000, 150000) * multiplier);
        row['LOLE'] = randomFloat(0.05, 0.3) * multiplier;
        row['EUE'] = Math.round(randomFloat(500, 3000) * multiplier);
        row['LOLH'] = randomFloat(1, 10) * multiplier;
        row['System Cost'] = randomFloat(20, 50) * multiplier;
        row['Production Cost'] = Math.round(randomFloat(3000, 5000) * multiplier);
        row['RPS Generation'] = randomFloat(25, 40) * multiplier;
        row['Curtailment'] = Math.round(randomFloat(30, 100) * multiplier);

        data.push(row);
      }
    }
  }

  return {m: metrics, d: data};
}

// Generate all results for a plan
export function generateAllMockData(plan: PlanInfo): {
  solverResults: SolverResult[];
  npvResults: NPVResult[];
  unitAdditionResults: UnitAdditionResult[];
  unitRetirementResults: UnitRetirementResult[];
  solverLogs: SolverLog[];
  epResultsData: EPYearlyData;
} {
  return {
    solverResults: generateSolverResults(plan),
    npvResults: generateNpvResults(plan),
    unitAdditionResults: generateUnitAdditionResults(plan),
    unitRetirementResults: generateUnitRetirementResults(plan),
    solverLogs: generateSolverLogs(plan),
    epResultsData: generateEPResultsData(plan),
  };
}

// Pre-generated sample plans with IDs for initial app state
export const SAMPLE_EXPANSION_PLANS = [
  {
    id: 'sample-plan-1',
    name: 'ERCOT Base Case 2025-2035',
    region: 'ERCOT' as Region,
    planningHorizonStart: 2025,
    planningHorizonEnd: 2035,
  },
  {
    id: 'sample-plan-2',
    name: 'SPP Wind Integration Study',
    region: 'SPP' as Region,
    planningHorizonStart: 2026,
    planningHorizonEnd: 2036,
  },
  {
    id: 'sample-plan-3',
    name: 'MISO Decarbonization Path',
    region: 'MISO' as Region,
    planningHorizonStart: 2025,
    planningHorizonEnd: 2040,
  },
];

// ============================================================
// DATABASE SCENARIO MOCK DATA GENERATORS
// Used when in database storage mode to generate scenario-specific data
// ============================================================

interface ScenarioInfo {
  scenarioId: number;
  name: string;
  region: Region;
  planningHorizonStart: number;
  planningHorizonEnd: number;
}

// Cache for scenario mock data to avoid regenerating on every render
const scenarioDataCache: Record<number, {
  solverLogs: SolverLog[];
  unitAdditionResults: UnitAdditionResult[];
  unitRetirementResults: UnitRetirementResult[];
  epResultsData: EPYearlyData;
}> = {};

// Generate mock data for a database scenario
export function generateScenarioMockData(scenario: ScenarioInfo) {
  // Return cached data if available
  if (scenarioDataCache[scenario.scenarioId]) {
    return scenarioDataCache[scenario.scenarioId];
  }

  // Convert scenario to PlanInfo format for reusing generators
  const planInfo: PlanInfo = {
    id: `scenario-${scenario.scenarioId}`,
    name: scenario.name,
    region: scenario.region,
    planningHorizonStart: scenario.planningHorizonStart,
    planningHorizonEnd: scenario.planningHorizonEnd,
  };

  const data = {
    solverLogs: generateSolverLogs(planInfo),
    unitAdditionResults: generateUnitAdditionResults(planInfo),
    unitRetirementResults: generateUnitRetirementResults(planInfo),
    epResultsData: generateEPResultsData(planInfo),
  };

  // Cache the data
  scenarioDataCache[scenario.scenarioId] = data;

  return data;
}

// Get scenario info from mock scenarios or create default
export function getScenarioInfoFromId(scenarioId: number): ScenarioInfo {
  // Map of known mock scenarios
  const MOCK_SCENARIOS: Record<number, Omit<ScenarioInfo, 'scenarioId'>> = {
    1: { name: 'ERCOT Base Case 2030-2040', region: 'ERCOT', planningHorizonStart: 2030, planningHorizonEnd: 2040 },
    2: { name: 'ERCOT High Renewables Scenario', region: 'ERCOT', planningHorizonStart: 2030, planningHorizonEnd: 2040 },
    3: { name: 'SPP Mexico Integration Study', region: 'SPP', planningHorizonStart: 2028, planningHorizonEnd: 2038 },
    4: { name: 'MISO Decarbonization Path', region: 'MISO', planningHorizonStart: 2025, planningHorizonEnd: 2045 },
    5: { name: 'PJM Capacity Expansion 2035', region: 'PJM', planningHorizonStart: 2030, planningHorizonEnd: 2035 },
    6: { name: 'ERCOT Battery Storage Analysis', region: 'ERCOT', planningHorizonStart: 2030, planningHorizonEnd: 2040 },
    7: { name: 'SPP Wind Integration 2030', region: 'SPP', planningHorizonStart: 2025, planningHorizonEnd: 2030 },
  };

  const scenario = MOCK_SCENARIOS[scenarioId];
  if (scenario) {
    return { scenarioId, ...scenario };
  }

  // Default for unknown scenarios
  return {
    scenarioId,
    name: `Scenario ${scenarioId}`,
    region: 'ERCOT',
    planningHorizonStart: 2025,
    planningHorizonEnd: 2035,
  };
}
