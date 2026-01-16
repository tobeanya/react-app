import {useQuery} from '@tanstack/react-query';
import {resultsApi} from '../api';
import {EpStudyResults, EpNpvResults} from '../api/types';
import {EP_DATA, YearlyData} from '../data/expansionPlanResultsData';
import {EP_DATA_NPV, NpvData} from '../data/expansionPlanNpvData';

// The format expected by ExpansionPlanResultsPage
export interface ResultsMetric {
  n: string; // name
  u: string; // unit
  b: boolean; // has baseline
}

export interface ResultsDataRow {
  t: string; // technology
  b: number; // build cycle
  s: string; // status
  y: number; // year
  [metric: string]: string | number;
}

export interface ResultsData {
  m: ResultsMetric[];
  d: ResultsDataRow[];
}

// Re-export for convenience
export type {ResultsData as EPResultsData};

// Transform API study results to the format expected by the page
function transformStudyResults(results: EpStudyResults[]): ResultsData {
  if (!results || results.length === 0) {
    return {m: [], d: []};
  }

  // Define metrics with their units and baseline flags
  const metrics: ResultsMetric[] = [
    {n: 'Added Capacity', u: 'MW', b: false},
    {n: 'Reliability Metric', u: 'Days/Year', b: true},
    {n: 'System Cost', u: '$', b: true},
    {n: 'Generation', u: 'MWh', b: false},
    {n: 'Capacity Factor', u: '%', b: false},
    {n: 'Hours Online', u: 'Hours', b: false},
    {n: 'Fixed Cost', u: '$/MW', b: false},
    {n: 'Fixed Carrying Cost', u: '$/MW', b: false},
    {n: 'Fixed OM Cost', u: '$/MW', b: false},
    {n: 'Production Cost', u: '$/MWh', b: false},
    {n: 'Fuel Cost', u: '$/MWh', b: false},
    {n: 'Startup Cost', u: '$/MWh', b: false},
    {n: 'Variable OM Cost', u: '$/MWh', b: false},
    {n: 'Emission Cost', u: '$/MWh', b: false},
    {n: 'Energy Margin', u: '$/MW', b: false},
    {n: 'Market Price', u: '$/MWh', b: true},
    {n: 'System Curtailment', u: 'MWh', b: true},
    {n: 'Start Attempts', u: 'Count', b: false},
  ];

  // Transform each result row
  const data: ResultsDataRow[] = results.map(r => ({
    t: r.unitCombo || 'Unknown',
    b: r.iteration || 0,
    s: r.status || 'Unknown',
    y: r.year ? parseInt(r.year, 10) : 0,
    'Added Capacity': r.capacityAdded ?? 0,
    'Reliability Metric': r.reliabilityMetric ?? 0,
    'System Cost': r.systemCost ?? 0,
    'Generation': r.generation ?? 0,
    'Capacity Factor': r.capacityFactor ?? 0,
    'Hours Online': r.hoursOnline ?? 0,
    'Fixed Cost': r.fixedCost ?? 0,
    'Fixed Carrying Cost': r.fixedCarryingCost ?? 0,
    'Fixed OM Cost': r.fixedOmCost ?? 0,
    'Production Cost': r.productionCost ?? 0,
    'Fuel Cost': r.fuelCost ?? 0,
    'Startup Cost': r.startupCost ?? 0,
    'Variable OM Cost': r.variableOmCost ?? 0,
    'Emission Cost': r.emissionCost ?? 0,
    'Energy Margin': r.energyMargin ?? 0,
    'Market Price': r.marketPrice ?? 0,
    'System Curtailment': r.systemCurtailment ?? 0,
    'Start Attempts': r.startAttempts ?? 0,
  }));

  return {m: metrics, d: data};
}

// Transform API NPV results to the format expected by the page
function transformNpvResults(results: EpNpvResults[]): ResultsData {
  if (!results || results.length === 0) {
    return {m: [], d: []};
  }

  const metrics: ResultsMetric[] = [
    {n: 'LOLE', u: 'Days/Year', b: true},
    {n: 'Energy Margin', u: '$M', b: false},
    {n: 'Total Cost', u: '$M', b: true},
    {n: 'Production Cost', u: '$M', b: true},
    {n: 'Fuel Cost', u: '$M', b: true},
    {n: 'Startup Cost', u: '$M', b: false},
    {n: 'Variable OM Cost', u: '$M', b: false},
    {n: 'Emission Cost', u: '$M', b: false},
    {n: 'EUE Cost', u: '$M', b: true},
    {n: 'Net Purchase Cost', u: '$M', b: true},
    {n: 'System Fixed Cost', u: '$M', b: true},
    {n: 'System Fixed Carrying Cost', u: '$M', b: true},
    {n: 'System Fixed OM Cost', u: '$M', b: true},
  ];

  const data: ResultsDataRow[] = results.map(r => ({
    t: 'Scenario', // NPV results don't have unit combo
    b: r.iteration || 0,
    s: r.stage || 'Unknown',
    y: r.year ? parseInt(r.year, 10) : 0,
    'LOLE': r.reliabilityMetric ?? 0,
    'Energy Margin': r.energyMargin ?? 0,
    'Total Cost': r.systemCost ?? 0,
    'Production Cost': r.productionCost ?? 0,
    'Fuel Cost': r.fuelCost ?? 0,
    'Startup Cost': r.startupCost ?? 0,
    'Variable OM Cost': r.variableOmCost ?? 0,
    'Emission Cost': r.emissionCost ?? 0,
    'EUE Cost': r.eueCost ?? 0,
    'Net Purchase Cost': r.netPurchaseCost ?? 0,
    'System Fixed Cost': r.systemFixedCost ?? 0,
    'System Fixed Carrying Cost': r.systemFixedCarryingCost ?? 0,
    'System Fixed OM Cost': r.systemFixedOmCost ?? 0,
  }));

  return {m: metrics, d: data};
}

interface UseExpansionPlanResultsOptions {
  scenarioId?: number | null;
  calculationBasis: 'Yearly' | 'NPV';
  enabled?: boolean;
  localData?: ResultsData | null; // Plan-specific data for local storage mode
}

interface UseExpansionPlanResultsReturn {
  data: ResultsData;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isUsingMockData: boolean;
}

/**
 * Hook to fetch expansion plan results from API or fall back to mock data
 */
export function useExpansionPlanResults({
  scenarioId,
  calculationBasis,
  enabled = true,
  localData = null,
}: UseExpansionPlanResultsOptions): UseExpansionPlanResultsReturn {
  // Fetch study results from API (always call hooks to follow Rules of Hooks)
  const studyQuery = useQuery({
    queryKey: ['results', 'study', scenarioId],
    queryFn: () => resultsApi.getStudyResults(scenarioId!),
    // Disable when localData is provided or other conditions not met
    enabled: enabled && !localData && scenarioId != null && calculationBasis === 'Yearly',
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch NPV results from API
  const npvQuery = useQuery({
    queryKey: ['results', 'npv', scenarioId],
    queryFn: () => resultsApi.getNpvResults(scenarioId!),
    // Disable when localData is provided or other conditions not met
    enabled: enabled && !localData && scenarioId != null && calculationBasis === 'NPV',
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // If localData is provided (local storage mode), use it directly
  if (localData) {
    return {
      data: localData,
      isLoading: false,
      isError: false,
      error: null,
      isUsingMockData: true, // Local data is plan-specific mock data
    };
  }

  // Determine which query is active
  const activeQuery = calculationBasis === 'NPV' ? npvQuery : studyQuery;

  // If we have API data, transform and return it
  if (activeQuery.isSuccess && activeQuery.data && activeQuery.data.length > 0) {
    const transformedData = calculationBasis === 'NPV'
      ? transformNpvResults(activeQuery.data as EpNpvResults[])
      : transformStudyResults(activeQuery.data as EpStudyResults[]);

    return {
      data: transformedData,
      isLoading: false,
      isError: false,
      error: null,
      isUsingMockData: false,
    };
  }

  // If API is loading, return loading state with mock data structure
  if (activeQuery.isLoading) {
    return {
      data: calculationBasis === 'NPV' ? EP_DATA_NPV : EP_DATA,
      isLoading: true,
      isError: false,
      error: null,
      isUsingMockData: true,
    };
  }

  // Fall back to mock data (API error, no scenarioId, or no data)
  return {
    data: calculationBasis === 'NPV' ? EP_DATA_NPV : EP_DATA,
    isLoading: false,
    isError: activeQuery.isError,
    error: activeQuery.error || null,
    isUsingMockData: true,
  };
}

/**
 * Hook to get available years for a scenario
 */
export function useResultsYears(scenarioId?: number | null) {
  return useQuery({
    queryKey: ['results', 'years', scenarioId],
    queryFn: () => resultsApi.getAvailableYears(scenarioId!),
    enabled: scenarioId != null,
    retry: 1,
  });
}
