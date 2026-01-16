import React, {useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {colors} from '../styles/colors';
import {useDatabaseConnection} from '../hooks/useDatabaseConnection';

interface Props {
  onConnectionChange?: (isConnected: boolean) => void;
}

export function DatabaseConnectionSection({onConnectionChange}: Props) {
  const {
    isConnected,
    isLoading,
    isTesting,
    testResult,
    error,
    formState,
    updateFormField,
    password,
    setPassword,
    fetchCurrentSettings,
    testConnection,
    saveConnection,
    disconnect,
    clearTestResult,
    clearError,
  } = useDatabaseConnection();

  // Fetch current settings on mount
  useEffect(() => {
    fetchCurrentSettings();
  }, [fetchCurrentSettings]);

  // Notify parent of connection changes
  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  const handleTestConnection = async () => {
    clearError();
    await testConnection();
  };

  const handleSaveConnection = async () => {
    clearError();
    const result = await saveConnection();
    if (result?.success) {
      clearTestResult();
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const isSqlServerAuth = formState.authenticationType === 'SqlServer';
  const canTest =
    formState.serverName.trim() !== '' &&
    formState.databaseName.trim() !== '' &&
    (!isSqlServerAuth ||
      (formState.username.trim() !== '' && password.trim() !== ''));

  return (
    <View style={styles.container}>
      {/* Connection Status */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusDot,
            isConnected ? styles.statusDotConnected : styles.statusDotDisconnected,
          ]}
        />
        <Text style={styles.statusText}>
          {isConnected ? 'Connected' : 'Not Connected'}
        </Text>
        {isConnected && formState.serverName && (
          <Text style={styles.serverInfo}>
            {formState.serverName}/{formState.databaseName}
          </Text>
        )}
      </View>

      {/* Server Name */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>SERVER NAME</Text>
        <TextInput
          style={styles.input}
          value={formState.serverName}
          onChangeText={text => updateFormField('serverName', text)}
          placeholder="e.g., localhost\SQLEXPRESS"
          placeholderTextColor={colors.textQuaternary}
        />
      </View>

      {/* Database Name */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>DATABASE NAME</Text>
        <TextInput
          style={styles.input}
          value={formState.databaseName}
          onChangeText={text => updateFormField('databaseName', text)}
          placeholder="e.g., ExpansionPlanDb"
          placeholderTextColor={colors.textQuaternary}
        />
      </View>

      {/* Authentication Type */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>AUTHENTICATION</Text>
        <View style={styles.authToggle}>
          <TouchableOpacity
            style={[
              styles.authButton,
              !isSqlServerAuth && styles.authButtonActive,
            ]}
            onPress={() => updateFormField('authenticationType', 'Windows')}>
            <Text
              style={[
                styles.authButtonText,
                !isSqlServerAuth && styles.authButtonTextActive,
              ]}>
              Windows
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.authButton,
              isSqlServerAuth && styles.authButtonActive,
            ]}
            onPress={() => updateFormField('authenticationType', 'SqlServer')}>
            <Text
              style={[
                styles.authButtonText,
                isSqlServerAuth && styles.authButtonTextActive,
              ]}>
              SQL Server
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Username & Password (only for SQL Server auth) */}
      {isSqlServerAuth && (
        <>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>USERNAME</Text>
            <TextInput
              style={styles.input}
              value={formState.username}
              onChangeText={text => updateFormField('username', text)}
              placeholder="SQL Server login"
              placeholderTextColor={colors.textQuaternary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textQuaternary}
              secureTextEntry
            />
          </View>
        </>
      )}

      {/* Advanced Settings */}
      <View style={styles.advancedSection}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() =>
            updateFormField(
              'trustServerCertificate',
              !formState.trustServerCertificate,
            )
          }>
          <View
            style={[
              styles.checkbox,
              formState.trustServerCertificate && styles.checkboxChecked,
            ]}>
            {formState.trustServerCertificate && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
          <Text style={styles.checkboxLabel}>Trust Server Certificate</Text>
        </TouchableOpacity>

        <View style={styles.timeoutRow}>
          <Text style={styles.timeoutLabel}>Connection Timeout:</Text>
          <TextInput
            style={styles.timeoutInput}
            value={String(formState.connectionTimeout)}
            onChangeText={text => {
              const num = parseInt(text, 10);
              if (!isNaN(num) && num > 0) {
                updateFormField('connectionTimeout', num);
              } else if (text === '') {
                updateFormField('connectionTimeout', 30);
              }
            }}
            keyboardType="numeric"
          />
          <Text style={styles.timeoutUnit}>seconds</Text>
        </View>
      </View>

      {/* Test Result / Error */}
      {(testResult || error) && (
        <View
          style={[
            styles.resultBox,
            testResult?.success ? styles.resultBoxSuccess : styles.resultBoxError,
          ]}>
          <Text
            style={[
              styles.resultText,
              testResult?.success
                ? styles.resultTextSuccess
                : styles.resultTextError,
            ]}>
            {testResult?.message || error}
          </Text>
          {testResult?.success && testResult.sqlServerVersion && (
            <Text style={styles.resultDetails}>
              SQL Server {testResult.sqlServerVersion} • {testResult.responseTimeMs}ms
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary, !canTest && styles.buttonDisabled]}
          onPress={handleTestConnection}
          disabled={!canTest || isTesting}>
          {isTesting ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Test Connection</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, !canTest && styles.buttonDisabled]}
          onPress={handleSaveConnection}
          disabled={!canTest || isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Save & Connect</Text>
          )}
        </TouchableOpacity>

        {isConnected && (
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleDisconnect}
            disabled={isLoading}>
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusDotConnected: {
    backgroundColor: colors.green,
  },
  statusDotDisconnected: {
    backgroundColor: colors.red,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  serverInfo: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 12,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    color: colors.text,
  },
  authToggle: {
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  authButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  authButtonActive: {
    backgroundColor: colors.primary,
  },
  authButtonText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  authButtonTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  advancedSection: {
    marginTop: 8,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  timeoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeoutLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  timeoutInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 6,
    width: 60,
    fontSize: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    color: colors.text,
    textAlign: 'center',
  },
  timeoutUnit: {
    fontSize: 14,
    color: colors.textTertiary,
    marginLeft: 8,
  },
  resultBox: {
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  resultBoxSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  resultBoxError: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  resultText: {
    fontSize: 14,
  },
  resultTextSuccess: {
    color: colors.green,
  },
  resultTextError: {
    color: colors.red,
  },
  resultDetails: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDanger: {
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.5)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});

export default DatabaseConnectionSection;
