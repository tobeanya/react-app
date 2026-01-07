import React, {useState, useEffect, useCallback} from 'react';
import {StatusBar, StyleSheet, useColorScheme, View, Alert} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TopTabNavigator} from './src/navigation/TopTabNavigator';
import {
  ExpansionPlan,
  GenerationCandidate,
  TransmissionCandidate,
  SolverLog,
  SolverResult,
  NPVResult,
  UnitAdditionResult,
  UnitRetirementResult,
  SolverStatusType,
  DEFAULT_SETTINGS,
  SAMPLE_SOLVER_LOGS,
} from './src/types';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const STORAGE_KEY = 'expansion_planning_data';

interface StoredData {
  expansionPlans: ExpansionPlan[];
  generationCandidates: GenerationCandidate[];
  transmissionCandidates: TransmissionCandidate[];
  solverResults: SolverResult[];
  npvResults: NPVResult[];
  unitAdditionResults: UnitAdditionResult[];
  unitRetirementResults: UnitRetirementResult[];
  selectedPlanId: string | null;
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  const [expansionPlans, setExpansionPlans] = useState<ExpansionPlan[]>([]);
  const [generationCandidates, setGenerationCandidates] = useState<GenerationCandidate[]>([]);
  const [transmissionCandidates, setTransmissionCandidates] = useState<TransmissionCandidate[]>([]);
  const [solverLogs, setSolverLogs] = useState<SolverLog[]>(SAMPLE_SOLVER_LOGS);
  const [solverResults, setSolverResults] = useState<SolverResult[]>([]);
  const [npvResults, setNpvResults] = useState<NPVResult[]>([]);
  const [unitAdditionResults, setUnitAdditionResults] = useState<UnitAdditionResult[]>([]);
  const [unitRetirementResults, setUnitRetirementResults] = useState<UnitRetirementResult[]>([]);
  const [solverStatuses, setSolverStatuses] = useState<Record<string, SolverStatusType>>({});
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved data on startup
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const data: StoredData = JSON.parse(savedData);
          setExpansionPlans(data.expansionPlans || []);
          setGenerationCandidates(data.generationCandidates || []);
          setTransmissionCandidates(data.transmissionCandidates || []);
          setSolverResults(data.solverResults || []);
          setNpvResults(data.npvResults || []);
          setUnitAdditionResults(data.unitAdditionResults || []);
          setUnitRetirementResults(data.unitRetirementResults || []);
          setSelectedPlanId(data.selectedPlanId || null);
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSavedData();
  }, []);

  // Save all data handler
  const handleSaveAll = useCallback(async () => {
    try {
      const dataToSave: StoredData = {
        expansionPlans,
        generationCandidates,
        transmissionCandidates,
        solverResults,
        npvResults,
        unitAdditionResults,
        unitRetirementResults,
        selectedPlanId,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      Alert.alert('Success', 'All data saved successfully!');
    } catch (error) {
      console.error('Failed to save data:', error);
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
  }, [
    expansionPlans,
    generationCandidates,
    transmissionCandidates,
    solverResults,
    npvResults,
    unitAdditionResults,
    unitRetirementResults,
    selectedPlanId,
  ]);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const handleCreatePlan = (name: string) => {
    const newPlan: ExpansionPlan = {
      id: generateId(),
      name,
      dateCreated: new Date().toISOString(),
      isActive: false,
      region: 'ERCOT',
      suffix: '',
      sourceStudyId: '',
      planningHorizonStart: 2025,
      planningHorizonEnd: 2045,
      settings: DEFAULT_SETTINGS,
    };
    setExpansionPlans(prev => [...prev, newPlan]);
    setSelectedPlanId(newPlan.id);
  };

  const handleUpdatePlan = (plan: ExpansionPlan) => {
    setExpansionPlans(prev =>
      prev.map(p => (p.id === plan.id ? plan : p)),
    );
  };

  const handleDeletePlan = (id: string) => {
    setExpansionPlans(prev => prev.filter(p => p.id !== id));
    setGenerationCandidates(prev => prev.filter(c => c.expansionPlanId !== id));
    setTransmissionCandidates(prev => prev.filter(c => c.expansionPlanId !== id));
    if (selectedPlanId === id) {
      setSelectedPlanId(null);
    }
  };

  const handleCopyPlan = (id: string, newName: string) => {
    const planToCopy = expansionPlans.find(p => p.id === id);
    if (!planToCopy) return;

    const newPlanId = generateId();
    const newPlan: ExpansionPlan = {
      ...planToCopy,
      id: newPlanId,
      name: newName,
      dateCreated: new Date().toISOString(),
      isActive: false,
      settings: {
        ...planToCopy.settings,
        constraints: planToCopy.settings.constraints.map(c => ({
          ...c,
          id: generateId(),
        })),
        escalationInputs: planToCopy.settings.escalationInputs.map(e => ({
          ...e,
          id: generateId(),
        })),
      },
    };
    setExpansionPlans(prev => [...prev, newPlan]);

    // Copy generation candidates
    const genCandidatesToCopy = generationCandidates.filter(c => c.expansionPlanId === id);
    const newGenCandidates = genCandidatesToCopy.map(c => ({
      ...c,
      id: generateId(),
      expansionPlanId: newPlanId,
    }));
    setGenerationCandidates(prev => [...prev, ...newGenCandidates]);

    // Copy transmission candidates
    const transCandidatesToCopy = transmissionCandidates.filter(c => c.expansionPlanId === id);
    const newTransCandidates = transCandidatesToCopy.map(c => ({
      ...c,
      id: generateId(),
      expansionPlanId: newPlanId,
    }));
    setTransmissionCandidates(prev => [...prev, ...newTransCandidates]);

    setSelectedPlanId(newPlanId);
  };

  // Generation candidate handlers
  const handleCreateGenerationCandidate = (data: Omit<GenerationCandidate, 'id'>) => {
    const newCandidate: GenerationCandidate = {
      ...data,
      id: generateId(),
    };
    setGenerationCandidates(prev => [...prev, newCandidate]);
  };

  const handleUpdateGenerationCandidate = (candidate: GenerationCandidate) => {
    setGenerationCandidates(prev =>
      prev.map(c => (c.id === candidate.id ? candidate : c)),
    );
  };

  const handleDeleteGenerationCandidates = (ids: string[]) => {
    setGenerationCandidates(prev => prev.filter(c => !ids.includes(c.id)));
  };

  // Transmission candidate handlers
  const handleCreateTransmissionCandidate = (data: Omit<TransmissionCandidate, 'id'>) => {
    const newCandidate: TransmissionCandidate = {
      ...data,
      id: generateId(),
    };
    setTransmissionCandidates(prev => [...prev, newCandidate]);
  };

  const handleUpdateTransmissionCandidate = (candidate: TransmissionCandidate) => {
    setTransmissionCandidates(prev =>
      prev.map(c => (c.id === candidate.id ? candidate : c)),
    );
  };

  const handleDeleteTransmissionCandidates = (ids: string[]) => {
    setTransmissionCandidates(prev => prev.filter(c => !ids.includes(c.id)));
  };

  // Solver control handlers - now per-plan
  const handleStartSolver = (planId: string) => {
    setSolverStatuses(prev => ({...prev, [planId]: 'running'}));
  };

  const handleStopSolver = (planId: string) => {
    setSolverStatuses(prev => ({...prev, [planId]: 'inactive'}));
  };

  const handlePauseSolver = (planId: string) => {
    setSolverStatuses(prev => ({...prev, [planId]: 'paused'}));
  };

  return (
    <View style={[styles.container, {paddingTop: safeAreaInsets.top}]}>
      <TopTabNavigator
        expansionPlans={expansionPlans}
        generationCandidates={generationCandidates}
        transmissionCandidates={transmissionCandidates}
        solverLogs={solverLogs}
        solverResults={solverResults}
        npvResults={npvResults}
        unitAdditionResults={unitAdditionResults}
        unitRetirementResults={unitRetirementResults}
        solverStatuses={solverStatuses}
        selectedPlanId={selectedPlanId}
        isModalOpen={isModalOpen}
        onSelectPlan={setSelectedPlanId}
        onCreatePlan={handleCreatePlan}
        onUpdatePlan={handleUpdatePlan}
        onDeletePlan={handleDeletePlan}
        onCopyPlan={handleCopyPlan}
        onCreateGenerationCandidate={handleCreateGenerationCandidate}
        onUpdateGenerationCandidate={handleUpdateGenerationCandidate}
        onDeleteGenerationCandidates={handleDeleteGenerationCandidates}
        onCreateTransmissionCandidate={handleCreateTransmissionCandidate}
        onUpdateTransmissionCandidate={handleUpdateTransmissionCandidate}
        onDeleteTransmissionCandidates={handleDeleteTransmissionCandidates}
        onStartSolver={handleStartSolver}
        onStopSolver={handleStopSolver}
        onPauseSolver={handlePauseSolver}
        onSaveAll={handleSaveAll}
        onModalVisibleChange={setIsModalOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
