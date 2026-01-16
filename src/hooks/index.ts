// Scenario hooks
export {
  useScenarios,
  useScenario,
  useScenarioDetails,
  useSolverSettings,
} from './useScenarios';

// Results hooks
export {
  useStudyResults,
  useNpvResults,
  useUnitResults,
  useAvailableYears,
  useStudyResultsSummary,
} from './useResults';

// Units hooks
export {
  useUnits,
  useUnit,
  useRetirementCandidates,
  useUnitResultsForUnit,
} from './useUnits';

// Expansion Plan Results hook (with mock data fallback)
export {
  useExpansionPlanResults,
  useResultsYears,
} from './useExpansionPlanResults';
export type {ResultsData} from './useExpansionPlanResults';

// Database Scenarios hook (with mock data fallback)
export {
  useDatabaseScenarios,
  useDatabaseScenario,
} from './useDatabaseScenarios';
