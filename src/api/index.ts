// API Client and Methods
export { default as apiClient, setApiBaseUrl } from './client';
export { default as scenariosApi } from './scenarios.api';
export { default as resultsApi } from './results.api';
export { default as unitsApi } from './units.api';
export { default as databaseConfigApi } from './databaseConfig.api';
export type {
  DatabaseConnectionRequest,
  DatabaseConnectionResponse,
  ConnectionTestResult,
  ConnectionStatus,
} from './databaseConfig.api';

// Types
export * from './types';

// Health check
import apiClient from './client';
import { HealthCheckResponse } from './types';

export const healthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
};
