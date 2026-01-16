import apiClient from './client';
import { EpUnitMaster, EpUnitResults } from './types';

export const unitsApi = {
  /**
   * Get all candidate units for a scenario
   */
  getByScenario: async (scenarioId: number): Promise<EpUnitMaster[]> => {
    const response = await apiClient.get<EpUnitMaster[]>(`/units/scenario/${scenarioId}`);
    return response.data;
  },

  /**
   * Get a specific unit by ID
   */
  getById: async (id: number): Promise<EpUnitMaster> => {
    const response = await apiClient.get<EpUnitMaster>(`/units/${id}`);
    return response.data;
  },

  /**
   * Get retirement candidates for a scenario
   */
  getRetirementCandidates: async (scenarioId: number): Promise<EpUnitMaster[]> => {
    const response = await apiClient.get<EpUnitMaster[]>(
      `/units/scenario/${scenarioId}/retirements`
    );
    return response.data;
  },

  /**
   * Get unit results (capacity additions/removals)
   */
  getUnitResults: async (unitId: number): Promise<EpUnitResults[]> => {
    const response = await apiClient.get<EpUnitResults[]>(`/units/${unitId}/results`);
    return response.data;
  },
};

export default unitsApi;
