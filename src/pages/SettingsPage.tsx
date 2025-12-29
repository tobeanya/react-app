import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {TextInput} from 'react-native';
import {
  ExpansionPlan,
  Region,
  SolverType,
  REGIONS,
  SOLVER_TYPES,
} from '../types';

interface Props {
  selectedPlan: ExpansionPlan | null;
  onUpdatePlan: (plan: ExpansionPlan) => void;
}

export function SettingsPage({selectedPlan, onUpdatePlan}: Props) {
  if (!selectedPlan) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No Expansion Plan Selected</Text>
        <Text style={styles.emptySubtext}>
          Select a plan from the Home tab to configure settings
        </Text>
      </View>
    );
  }

  const updateRegion = (region: Region) => {
    onUpdatePlan({...selectedPlan, region});
  };

  const updateSuffix = (suffix: string) => {
    onUpdatePlan({...selectedPlan, suffix});
  };

  const updateSolverType = (solverType: SolverType) => {
    onUpdatePlan({...selectedPlan, solverType});
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>for {selectedPlan.name}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Region</Text>
          <View style={styles.optionsRow}>
            {REGIONS.map(region => (
              <TouchableOpacity
                key={region}
                style={[
                  styles.optionButton,
                  selectedPlan.region === region && styles.optionSelected,
                ]}
                onPress={() => updateRegion(region)}>
                <Text
                  style={[
                    styles.optionText,
                    selectedPlan.region === region && styles.optionTextSelected,
                  ]}>
                  {region}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solver Type</Text>
          <View style={styles.optionsRow}>
            {SOLVER_TYPES.map(solver => (
              <TouchableOpacity
                key={solver}
                style={[
                  styles.optionButton,
                  selectedPlan.solverType === solver && styles.optionSelected,
                ]}
                onPress={() => updateSolverType(solver)}>
                <Text
                  style={[
                    styles.optionText,
                    selectedPlan.solverType === solver &&
                      styles.optionTextSelected,
                  ]}>
                  {solver}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suffix</Text>
          <TextInput
            style={styles.input}
            value={selectedPlan.suffix}
            onChangeText={updateSuffix}
            placeholder="Enter suffix (optional)"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
