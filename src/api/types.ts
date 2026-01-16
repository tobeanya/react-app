// API Response Types - matching backend models

export interface EpScenarioMaster {
  epScenarioId: number | null;
  epScenarioDescription: string | null;
}

export interface EpStudyMaster {
  studyId: number | null;
  status: string | null;
  year: string | null;
  marginalUnit: string | null;
  epScenarioId: number | null;
  unitType: string | null;
  unitCategoryDescription: string | null;
  endYear: string | null;
}

export interface EpUnitMaster {
  epUnitId: number | null;
  year: string | null;
  maxNumberOfBuild: number | null;
  currentNumberOfBuild: number | null;
  epUnitDescription: string | null;
  lifetime: number | null;
  epScenarioId: number | null;
  exclusiveOfUnits: string | null;
  excludeBuild: boolean | null;
  maxNumberOfBuildPerYear: number | null;
  currentNumberOfBuildPerYear: number | null;
  temporaryElimination: boolean | null;
  totalRank: number | null;
  endYear: string | null;
  isRetirementCandidate: boolean | null;
  permanentElimination: boolean | null;
  startMonth: number | null;
  capacity: number | null;
  totalFixedCosts: number | null;
}

export interface EpStudyResults {
  studyId: number | null;
  iteration: number | null;
  year: string | null;
  reliabilityMetric: number | null;
  unitCombo: string | null;
  systemCost: number | null;
  status: string | null;
  stage: string | null;
  capacityAdded: number | null;
  generation: number | null;
  startAttempts: number | null;
  capacityFactor: number | null;
  hoursOnline: number | null;
  fixedCost: number | null;
  incrementalCapitalCost: number | null;
  selectionCriteria: string | null;
  productionCost: number | null;
  systemCurtailment: number | null;
  curtailment: number | null;
  emissionCost: number | null;
  npvSystemCost: number | null;
  npvReliabilityMetric: number | null;
  fixedCarryingCost: number | null;
  fixedOmCost: number | null;
  epScenarioId: number | null;
  fuelCost: number | null;
  startupCost: number | null;
  variableOmCost: number | null;
  deltaReliabilityMetric: number | null;
  costByReliabilityMetric: number | null;
  rpsGeneration: number | null;
  eueBenefit: number | null;
  maxEueDuration: number | null;
  lolhCap: number | null;
  lolev: number | null;
  eueDepth: number | null;
  energyMargin: number | null;
  npvEnergyMargin: number | null;
  npvAvailableMwInEueHours: number | null;
  availableMwInEueHours: number | null;
  npvFixedCost: number | null;
  netCost: number | null;
  promptCostByReliabilityMetric: number | null;
  eueCap: number | null;
  eueCost: number | null;
  netPurchaseCost: number | null;
  systemFixedCost: number | null;
  systemFixedCarryingCost: number | null;
  systemFixedOmCost: number | null;
  deltaAnnualCost: number | null;
  marketPrice: number | null;
}

export interface EpNpvResults {
  studyId: number | null;
  iteration: number | null;
  year: string | null;
  reliabilityMetric: number | null;
  systemCost: number | null;
  stage: string | null;
  npvSystemCost: number | null;
  simulatingYear: number | null;
  npvReliabilityMetric: number | null;
  epScenarioId: number | null;
  productionCost: number | null;
  fuelCost: number | null;
  startupCost: number | null;
  variableOmCost: number | null;
  emissionCost: number | null;
  npvProductionCost: number | null;
  npvFuelCost: number | null;
  npvStartupCost: number | null;
  npvVariableOmCost: number | null;
  npvEmissionCost: number | null;
  energyMargin: number | null;
  npvEnergyMargin: number | null;
  npvEueCost: number | null;
  eueCost: number | null;
  npvNetPurchaseCost: number | null;
  npvSystemFixedOmCost: number | null;
  npvSystemFixedCost: number | null;
  npvSystemFixedCarryingCost: number | null;
  netPurchaseCost: number | null;
  systemFixedCost: number | null;
  systemFixedCarryingCost: number | null;
  systemFixedOmCost: number | null;
}

export interface EpUnitResults {
  epUnitId: number | null;
  year: string | null;
  capacityAdded: number | null;
  stage: string | null;
  iteration: number | null;
  epScenarioId: number | null;
  capacityRemoved: number | null;
}

export interface EpMetricMaster {
  constraintId: number | null;
  constraintVariable: string | null;
  exceedanceValue: number | null;
  stage1Value: number | null;
  priority: number | null;
  epScenarioId: number | null;
  stage2Value: number | null;
  stage3Value: number | null;
  year: string | null;
}

export interface EpEscalatingRatesMaster {
  epScenarioId: number | null;
  escalatingVariable: string | null;
  unitVarId: number | null;
  displayName: string | null;
  startYear: string | null;
  endYear: string | null;
  rate: number | null;
}

export interface SolverSetting {
  solverVarId: number | null;
  solverVarName: string | null;
  solverVarDescription: string | null;
  solverValue: string | null;
}

export interface ScenarioDetails {
  scenario: EpScenarioMaster;
  units: EpUnitMaster[];
  metrics: EpMetricMaster[];
  escalatingRates: EpEscalatingRatesMaster[];
  solverDefinitions: SolverSetting[];
  studies: EpStudyMaster[];
}

export interface StudyResultsSummary {
  year: string;
  totalCapacityAdded: number;
  avgReliabilityMetric: number;
  totalSystemCost: number;
  iterationCount: number;
}

// Health check response
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

// Request types for creating/updating scenarios
export interface CreateScenarioRequest {
  name: string;
}

export interface UpdateScenarioRequest {
  name: string;
}
