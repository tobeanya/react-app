import {useQuery} from '@tanstack/react-query';
import {resultsApi, ResultsQueryParams} from '../api/results.api';
import {
  EpStudyResults,
  EpNpvResults,
  EpUnitResults,
  StudyResultsSummary,
} from '../api/types';

/**
 * Hook to fetch study results for a scenario
 */
export const useStudyResults = (
  scenarioId: number | null,
  params?: ResultsQueryParams
) => {
  return useQuery<EpStudyResults[], Error>({
    queryKey: ['results', 'study', scenarioId, params],
    queryFn: () => resultsApi.getStudyResults(scenarioId!, params),
    enabled: scenarioId !== null,
  });
};

/**
 * Hook to fetch NPV results for a scenario
 */
export const useNpvResults = (
  scenarioId: number | null,
  params?: ResultsQueryParams
) => {
  return useQuery<EpNpvResults[], Error>({
    queryKey: ['results', 'npv', scenarioId, params],
    queryFn: () => resultsApi.getNpvResults(scenarioId!, params),
    enabled: scenarioId !== null,
  });
};

/**
 * Hook to fetch unit results for a scenario
 */
export const useUnitResults = (
  scenarioId: number | null,
  year?: string
) => {
  return useQuery<EpUnitResults[], Error>({
    queryKey: ['results', 'units', scenarioId, year],
    queryFn: () => resultsApi.getUnitResults(scenarioId!, year),
    enabled: scenarioId !== null,
  });
};

/**
 * Hook to fetch available years for a scenario
 */
export const useAvailableYears = (scenarioId: number | null) => {
  return useQuery<string[], Error>({
    queryKey: ['results', 'years', scenarioId],
    queryFn: () => resultsApi.getAvailableYears(scenarioId!),
    enabled: scenarioId !== null,
  });
};

/**
 * Hook to fetch study results summary
 */
export const useStudyResultsSummary = (scenarioId: number | null) => {
  return useQuery<StudyResultsSummary[], Error>({
    queryKey: ['results', 'study', scenarioId, 'summary'],
    queryFn: () => resultsApi.getStudyResultsSummary(scenarioId!),
    enabled: scenarioId !== null,
  });
};
