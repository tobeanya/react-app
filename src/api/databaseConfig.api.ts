import apiClient from './client';

export interface DatabaseConnectionRequest {
  serverName: string;
  databaseName: string;
  authenticationType: 'Windows' | 'SqlServer';
  username?: string;
  password?: string;
  trustServerCertificate: boolean;
  connectionTimeout: number;
}

export interface DatabaseConnectionResponse {
  success: boolean;
  message?: string;
  serverName?: string;
  databaseName?: string;
  authenticationType?: string;
  username?: string;
  isConnected: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message?: string;
  sqlServerVersion?: string;
  responseTimeMs: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  serverName?: string;
  databaseName?: string;
  authenticationType?: string;
}

export const databaseConfigApi = {
  /**
   * Get current database connection settings (without password)
   */
  getCurrentSettings: async (): Promise<DatabaseConnectionResponse> => {
    const response = await apiClient.get<DatabaseConnectionResponse>('/databaseconfig/current');
    return response.data;
  },

  /**
   * Test a database connection without saving
   */
  testConnection: async (config: DatabaseConnectionRequest): Promise<ConnectionTestResult> => {
    const response = await apiClient.post<ConnectionTestResult>('/databaseconfig/test', config);
    return response.data;
  },

  /**
   * Configure and save database connection (tests first, then saves if successful)
   */
  configure: async (config: DatabaseConnectionRequest): Promise<DatabaseConnectionResponse> => {
    const response = await apiClient.post<DatabaseConnectionResponse>('/databaseconfig/configure', config);
    return response.data;
  },

  /**
   * Disconnect and clear current connection settings
   */
  disconnect: async (): Promise<void> => {
    await apiClient.post('/databaseconfig/disconnect');
  },

  /**
   * Get connection status
   */
  getStatus: async (): Promise<ConnectionStatus> => {
    const response = await apiClient.get<ConnectionStatus>('/databaseconfig/status');
    return response.data;
  },
};

export default databaseConfigApi;
