import {useQuery} from '@tanstack/react-query';
import {unitsApi} from '../api';
import {EpUnitMaster, EpUnitResults} from '../api/types';

/**
 * Hook to fetch all units for a scenario
 */
export const useUnits = (scenarioId: number | null) => {
  return useQuery<EpUnitMaster[], Error>({
    queryKey: ['units', 'scenario', scenarioId],
    queryFn: () => unitsApi.getByScenario(scenarioId!),
    enabled: scenarioId !== null,
  });
};

/**
 * Hook to fetch a single unit by ID
 */
export const useUnit = (id: number | null) => {
  return useQuery<EpUnitMaster, Error>({
    queryKey: ['units', id],
    queryFn: () => unitsApi.getById(id!),
    enabled: id !== null,
  });
};

/**
 * Hook to fetch retirement candidates for a scenario
 */
export const useRetirementCandidates = (scenarioId: number | null) => {
  return useQuery<EpUnitMaster[], Error>({
    queryKey: ['units', 'scenario', scenarioId, 'retirements'],
    queryFn: () => unitsApi.getRetirementCandidates(scenarioId!),
    enabled: scenarioId !== null,
  });
};

/**
 * Hook to fetch unit results (capacity changes over time)
 */
export const useUnitResultsForUnit = (unitId: number | null) => {
  return useQuery<EpUnitResults[], Error>({
    queryKey: ['units', unitId, 'results'],
    queryFn: () => unitsApi.getUnitResults(unitId!),
    enabled: unitId !== null,
  });
};
