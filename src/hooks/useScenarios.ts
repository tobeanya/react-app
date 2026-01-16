import {useQuery} from '@tanstack/react-query';
import {scenariosApi} from '../api';
import {EpScenarioMaster, ScenarioDetails, SolverSetting} from '../api/types';

/**
 * Hook to fetch all scenarios
 */
export const useScenarios = () => {
  return useQuery<EpScenarioMaster[], Error>({
    queryKey: ['scenarios'],
    queryFn: scenariosApi.getAll,
  });
};

/**
 * Hook to fetch a single scenario by ID
 */
export const useScenario = (id: number | null) => {
  return useQuery<EpScenarioMaster, Error>({
    queryKey: ['scenarios', id],
    queryFn: () => scenariosApi.getById(id!),
    enabled: id !== null,
  });
};

/**
 * Hook to fetch scenario details (includes units, metrics, settings, studies)
 */
export const useScenarioDetails = (id: number | null) => {
  return useQuery<ScenarioDetails, Error>({
    queryKey: ['scenarios', id, 'details'],
    queryFn: () => scenariosApi.getDetails(id!),
    enabled: id !== null,
  });
};

/**
 * Hook to fetch solver settings for a scenario
 */
export const useSolverSettings = (id: number | null) => {
  return useQuery<SolverSetting[], Error>({
    queryKey: ['scenarios', id, 'solver-settings'],
    queryFn: () => scenariosApi.getSolverSettings(id!),
    enabled: id !== null,
  });
};
