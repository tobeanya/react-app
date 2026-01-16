import {useQuery} from '@tanstack/react-query';
import {scenariosApi} from '../api';
import {ScenarioDetails} from '../api/types';

/**
 * Hook to fetch scenario details including units, metrics, settings from API
 */
export function useScenarioDetails(scenarioId: number | null | undefined) {
  const query = useQuery({
    queryKey: ['scenario-details', scenarioId],
    queryFn: () => scenariosApi.getDetails(scenarioId!),
    enabled: !!scenarioId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    details: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch solver settings for a scenario
 */
export function useScenarioSolverSettings(scenarioId: number | null | undefined) {
  const query = useQuery({
    queryKey: ['scenario-solver-settings', scenarioId],
    queryFn: () => scenariosApi.getSolverSettings(scenarioId!),
    enabled: !!scenarioId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  return {
    settings: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
