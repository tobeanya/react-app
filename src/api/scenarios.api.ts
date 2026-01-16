import apiClient from './client';
import {
  EpScenarioMaster,
  ScenarioDetails,
  SolverSetting,
  CreateScenarioRequest,
  UpdateScenarioRequest,
} from './types';

export const scenariosApi = {
  /**
   * Get all expansion plan scenarios
   */
  getAll: async (): Promise<EpScenarioMaster[]> => {
    const response = await apiClient.get<EpScenarioMaster[]>('/scenarios');
    return response.data;
  },

  /**
   * Get a specific scenario by ID
   */
  getById: async (id: number): Promise<EpScenarioMaster> => {
    const response = await apiClient.get<EpScenarioMaster>(`/scenarios/${id}`);
    return response.data;
  },

  /**
   * Get scenario with all related data (units, metrics, settings, studies)
   */
  getDetails: async (id: number): Promise<ScenarioDetails> => {
    const response = await apiClient.get<ScenarioDetails>(`/scenarios/${id}/details`);
    return response.data;
  },

  /**
   * Get solver settings for a scenario
   */
  getSolverSettings: async (id: number): Promise<SolverSetting[]> => {
    const response = await apiClient.get<SolverSetting[]>(`/scenarios/${id}/solver-settings`);
    return response.data;
  },

  /**
   * Create a new scenario
   */
  create: async (request: CreateScenarioRequest): Promise<EpScenarioMaster> => {
    const response = await apiClient.post<EpScenarioMaster>('/scenarios', request);
    return response.data;
  },

  /**
   * Update an existing scenario
   */
  update: async (id: number, request: UpdateScenarioRequest): Promise<EpScenarioMaster> => {
    const response = await apiClient.put<EpScenarioMaster>(`/scenarios/${id}`, request);
    return response.data;
  },

  /**
   * Delete a scenario
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/scenarios/${id}`);
  },
};

export default scenariosApi;
