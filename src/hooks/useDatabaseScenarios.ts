import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {scenariosApi} from '../api';
import {EpScenarioMaster} from '../api/types';
import {MOCK_DATABASE_SCENARIOS, DatabaseScenario} from '../data/mockScenarios';

interface UseDatabaseScenariosReturn {
  scenarios: DatabaseScenario[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isUsingMockData: boolean;
  refetch: () => void;
  createScenario: (name: string) => Promise<EpScenarioMaster>;
  updateScenario: (id: number, name: string) => Promise<EpScenarioMaster>;
  deleteScenario: (id: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

/**
 * Hook to fetch database scenarios from API or fall back to mock data
 */
export function useDatabaseScenarios(): UseDatabaseScenariosReturn {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['database-scenarios'],
    queryFn: scenariosApi.getAll,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (name: string) => scenariosApi.create({name}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['database-scenarios']});
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({id, name}: {id: number; name: string}) => scenariosApi.update(id, {name}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['database-scenarios']});
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => scenariosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['database-scenarios']});
    },
  });

  // Helper functions
  const createScenario = async (name: string) => {
    return createMutation.mutateAsync(name);
  };

  const updateScenario = async (id: number, name: string) => {
    return updateMutation.mutateAsync({id, name});
  };

  const deleteScenario = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  // Base return object with mutations
  const baseReturn = {
    createScenario,
    updateScenario,
    deleteScenario,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };

  // If we have API data, transform it to DatabaseScenario format
  if (query.isSuccess && query.data && query.data.length > 0) {
    const scenarios: DatabaseScenario[] = query.data.map((s: EpScenarioMaster) => ({
      epScenarioId: s.epScenarioId ?? 0,
      epScenarioDescription: s.epScenarioDescription ?? 'Unknown Scenario',
      // API doesn't return these fields yet, but they could be added
      region: undefined,
      planningHorizonStart: undefined,
      planningHorizonEnd: undefined,
      createdDate: undefined,
      status: 'completed' as const,
    }));

    return {
      ...baseReturn,
      scenarios,
      isLoading: false,
      isError: false,
      error: null,
      isUsingMockData: false,
      refetch: query.refetch,
    };
  }

  // If loading, return mock data with loading state
  if (query.isLoading) {
    return {
      ...baseReturn,
      scenarios: MOCK_DATABASE_SCENARIOS,
      isLoading: true,
      isError: false,
      error: null,
      isUsingMockData: true,
      refetch: query.refetch,
    };
  }

  // Fall back to mock data
  return {
    ...baseReturn,
    scenarios: MOCK_DATABASE_SCENARIOS,
    isLoading: false,
    isError: query.isError,
    error: query.error || null,
    isUsingMockData: true,
    refetch: query.refetch,
  };
}

/**
 * Hook to get a specific scenario by ID
 */
export function useDatabaseScenario(scenarioId: number | null) {
  const {scenarios, isUsingMockData} = useDatabaseScenarios();

  const scenario = scenarioId
    ? scenarios.find(s => s.epScenarioId === scenarioId)
    : null;

  return {
    scenario,
    isUsingMockData,
  };
}
