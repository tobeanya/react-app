import {useState, useCallback, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  databaseConfigApi,
  DatabaseConnectionRequest,
  ConnectionTestResult,
  DatabaseConnectionResponse,
} from '../api';

const DB_CONFIG_UI_KEY = 'database_connection_ui_state';

export interface DatabaseConnectionFormState {
  serverName: string;
  databaseName: string;
  authenticationType: 'Windows' | 'SqlServer';
  username: string;
  trustServerCertificate: boolean;
  connectionTimeout: number;
}

const DEFAULT_FORM_STATE: DatabaseConnectionFormState = {
  serverName: '',
  databaseName: '',
  authenticationType: 'Windows',
  username: '',
  trustServerCertificate: true,
  connectionTimeout: 30,
};

export function useDatabaseConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSettings, setCurrentSettings] =
    useState<DatabaseConnectionResponse | null>(null);

  // UI form state
  const [formState, setFormState] =
    useState<DatabaseConnectionFormState>(DEFAULT_FORM_STATE);
  const [password, setPassword] = useState(''); // Never persist password

  // Load saved UI state on mount
  useEffect(() => {
    const loadUIState = async () => {
      try {
        const saved = await AsyncStorage.getItem(DB_CONFIG_UI_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as DatabaseConnectionFormState;
          setFormState(parsed);
        }
      } catch (e) {
        console.error('Failed to load DB config UI state:', e);
      }
    };
    loadUIState();
  }, []);

  // Fetch current connection status from backend
  const fetchCurrentSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const settings = await databaseConfigApi.getCurrentSettings();
      setCurrentSettings(settings);
      setIsConnected(settings.isConnected);
      if (settings.isConnected && settings.serverName) {
        setFormState(prev => ({
          ...prev,
          serverName: settings.serverName || '',
          databaseName: settings.databaseName || '',
          authenticationType:
            (settings.authenticationType as 'Windows' | 'SqlServer') || 'Windows',
          username: settings.username || '',
        }));
      }
    } catch (e: any) {
      // If API is not available, just log and continue
      console.log('Could not fetch database settings:', e.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test connection without saving
  const testConnection = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const config: DatabaseConnectionRequest = {
        serverName: formState.serverName,
        databaseName: formState.databaseName,
        authenticationType: formState.authenticationType,
        username:
          formState.authenticationType === 'SqlServer'
            ? formState.username
            : undefined,
        password:
          formState.authenticationType === 'SqlServer' ? password : undefined,
        trustServerCertificate: formState.trustServerCertificate,
        connectionTimeout: formState.connectionTimeout,
      };

      const result = await databaseConfigApi.testConnection(config);
      setTestResult(result);
      return result;
    } catch (e: any) {
      const errorMsg =
        e.response?.data?.message || e.message || 'Connection test failed';
      setError(errorMsg);
      setTestResult({success: false, message: errorMsg, responseTimeMs: 0});
      return null;
    } finally {
      setIsTesting(false);
    }
  }, [formState, password]);

  // Save connection settings
  const saveConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const config: DatabaseConnectionRequest = {
        serverName: formState.serverName,
        databaseName: formState.databaseName,
        authenticationType: formState.authenticationType,
        username:
          formState.authenticationType === 'SqlServer'
            ? formState.username
            : undefined,
        password:
          formState.authenticationType === 'SqlServer' ? password : undefined,
        trustServerCertificate: formState.trustServerCertificate,
        connectionTimeout: formState.connectionTimeout,
      };

      const result = await databaseConfigApi.configure(config);

      if (result.success) {
        setIsConnected(true);
        setCurrentSettings(result);

        // Save non-sensitive UI state to AsyncStorage
        await AsyncStorage.setItem(DB_CONFIG_UI_KEY, JSON.stringify(formState));

        return result;
      } else {
        setError(result.message || 'Failed to configure connection');
        return null;
      }
    } catch (e: any) {
      const errorMsg =
        e.response?.data?.message || e.message || 'Failed to save connection';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [formState, password]);

  // Disconnect
  const disconnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await databaseConfigApi.disconnect();
      setIsConnected(false);
      setCurrentSettings(null);
      setTestResult(null);
    } catch (e: any) {
      setError(e.message || 'Failed to disconnect');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a single form field
  const updateFormField = useCallback(
    <K extends keyof DatabaseConnectionFormState>(
      field: K,
      value: DatabaseConnectionFormState[K],
    ) => {
      setFormState(prev => ({...prev, [field]: value}));
      // Clear test result when form changes
      setTestResult(null);
      setError(null);
    },
    [],
  );

  return {
    // Connection state
    isConnected,
    isLoading,
    isTesting,
    testResult,
    error,
    currentSettings,

    // Form state
    formState,
    setFormState,
    updateFormField,
    password,
    setPassword,

    // Actions
    fetchCurrentSettings,
    testConnection,
    saveConnection,
    disconnect,

    // Utilities
    clearTestResult: () => setTestResult(null),
    clearError: () => setError(null),
  };
}

export default useDatabaseConnection;
