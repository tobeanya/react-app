import apiClient from './client';
import {
  EpStudyResults,
  EpNpvResults,
  EpUnitResults,
  StudyResultsSummary,
} from './types';

export interface ResultsQueryParams {
  year?: string;
  iteration?: number;
}

export const resultsApi = {
  /**
   * Get study results for a scenario
   */
  getStudyResults: async (
    scenarioId: number,
    params?: ResultsQueryParams
  ): Promise<EpStudyResults[]> => {
    const response = await apiClient.get<EpStudyResults[]>(
      `/results/study/${scenarioId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get NPV results for a scenario
   */
  getNpvResults: async (
    scenarioId: number,
    params?: ResultsQueryParams
  ): Promise<EpNpvResults[]> => {
    const response = await apiClient.get<EpNpvResults[]>(
      `/results/npv/${scenarioId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get unit results for a scenario
   */
  getUnitResults: async (
    scenarioId: number,
    year?: string
  ): Promise<EpUnitResults[]> => {
    const response = await apiClient.get<EpUnitResults[]>(
      `/results/units/${scenarioId}`,
      { params: { year } }
    );
    return response.data;
  },

  /**
   * Get available years for a scenario
   */
  getAvailableYears: async (scenarioId: number): Promise<string[]> => {
    const response = await apiClient.get<string[]>(`/results/years/${scenarioId}`);
    return response.data;
  },

  /**
   * Get study results summary (aggregated per year)
   */
  getStudyResultsSummary: async (scenarioId: number): Promise<StudyResultsSummary[]> => {
    const response = await apiClient.get<StudyResultsSummary[]>(
      `/results/study/${scenarioId}/summary`
    );
    return response.data;
  },
};

export default resultsApi;
