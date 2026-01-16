import React, {useState, useEffect, useCallback} from 'react';
import {StatusBar, StyleSheet, useColorScheme, View, Alert} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
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
} from './src/types';
import {
  generateAllMockData,
  SAMPLE_EXPANSION_PLANS,
  EPYearlyData,
} from './src/data/mockDataGenerator';

// Create React Query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
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
  solverLogs: SolverLog[];
  epResultsData: Record<string, EPYearlyData>;
  selectedPlanId: string | null;
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  const [expansionPlans, setExpansionPlans] = useState<ExpansionPlan[]>([]);
  const [generationCandidates, setGenerationCandidates] = useState<GenerationCandidate[]>([]);
  const [transmissionCandidates, setTransmissionCandidates] = useState<TransmissionCandidate[]>([]);
  const [solverLogs, setSolverLogs] = useState<SolverLog[]>([]);
  const [solverResults, setSolverResults] = useState<SolverResult[]>([]);
  const [npvResults, setNpvResults] = useState<NPVResult[]>([]);
  const [unitAdditionResults, setUnitAdditionResults] = useState<UnitAdditionResult[]>([]);
  const [unitRetirementResults, setUnitRetirementResults] = useState<UnitRetirementResult[]>([]);
  const [epResultsData, setEpResultsData] = useState<Record<string, EPYearlyData>>({});
  const [solverStatuses, setSolverStatuses] = useState<Record<string, SolverStatusType>>({});
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedDatabaseScenarioId, setSelectedDatabaseScenarioId] = useState<number | null>(null);
  const [storageMode, setStorageMode] = useState<'local' | 'database'>('local');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved data on startup, or initialize with sample plans
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
          setSolverLogs(data.solverLogs || []);
          setEpResultsData(data.epResultsData || {});
          setSelectedPlanId(data.selectedPlanId || null);
        } else {
          // Initialize with sample plans and their mock data
          const initialPlans: ExpansionPlan[] = SAMPLE_EXPANSION_PLANS.map(sample => ({
            id: sample.id,
            name: sample.name,
            dateCreated: new Date().toISOString(),
            isActive: false,
            region: sample.region,
            suffix: '',
            sourceStudyId: '',
            planningHorizonStart: sample.planningHorizonStart,
            planningHorizonEnd: sample.planningHorizonEnd,
            settings: DEFAULT_SETTINGS,
          }));

          // Generate mock results data for each sample plan
          let allSolverResults: SolverResult[] = [];
          let allNpvResults: NPVResult[] = [];
          let allUnitAdditionResults: UnitAdditionResult[] = [];
          let allUnitRetirementResults: UnitRetirementResult[] = [];
          let allSolverLogs: SolverLog[] = [];
          const allEpResultsData: Record<string, EPYearlyData> = {};

          for (const plan of initialPlans) {
            const mockData = generateAllMockData({
              id: plan.id,
              name: plan.name,
              region: plan.region,
              planningHorizonStart: plan.planningHorizonStart,
              planningHorizonEnd: plan.planningHorizonEnd,
            });
            allSolverResults = [...allSolverResults, ...mockData.solverResults];
            allNpvResults = [...allNpvResults, ...mockData.npvResults];
            allUnitAdditionResults = [...allUnitAdditionResults, ...mockData.unitAdditionResults];
            allUnitRetirementResults = [...allUnitRetirementResults, ...mockData.unitRetirementResults];
            allSolverLogs = [...allSolverLogs, ...mockData.solverLogs];
            allEpResultsData[plan.id] = mockData.epResultsData;
          }

          setExpansionPlans(initialPlans);
          setSolverResults(allSolverResults);
          setNpvResults(allNpvResults);
          setUnitAdditionResults(allUnitAdditionResults);
          setUnitRetirementResults(allUnitRetirementResults);
          setSolverLogs(allSolverLogs);
          setEpResultsData(allEpResultsData);
          setSelectedPlanId(initialPlans[0]?.id || null);
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
        solverLogs,
        epResultsData,
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
    solverLogs,
    epResultsData,
    selectedPlanId,
  ]);

  // Reset all data and regenerate sample plans
  const handleResetAllData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);

      // Generate fresh sample plans with mock data
      const initialPlans: ExpansionPlan[] = SAMPLE_EXPANSION_PLANS.map(sample => ({
        id: sample.id,
        name: sample.name,
        dateCreated: new Date().toISOString(),
        isActive: false,
        region: sample.region,
        suffix: '',
        sourceStudyId: '',
        planningHorizonStart: sample.planningHorizonStart,
        planningHorizonEnd: sample.planningHorizonEnd,
        settings: DEFAULT_SETTINGS,
      }));

      let allSolverResults: SolverResult[] = [];
      let allNpvResults: NPVResult[] = [];
      let allUnitAdditionResults: UnitAdditionResult[] = [];
      let allUnitRetirementResults: UnitRetirementResult[] = [];
      let allSolverLogs: SolverLog[] = [];
      const allEpResultsData: Record<string, EPYearlyData> = {};

      for (const plan of initialPlans) {
        const mockData = generateAllMockData({
          id: plan.id,
          name: plan.name,
          region: plan.region,
          planningHorizonStart: plan.planningHorizonStart,
          planningHorizonEnd: plan.planningHorizonEnd,
        });
        allSolverResults = [...allSolverResults, ...mockData.solverResults];
        allNpvResults = [...allNpvResults, ...mockData.npvResults];
        allUnitAdditionResults = [...allUnitAdditionResults, ...mockData.unitAdditionResults];
        allUnitRetirementResults = [...allUnitRetirementResults, ...mockData.unitRetirementResults];
        allSolverLogs = [...allSolverLogs, ...mockData.solverLogs];
        allEpResultsData[plan.id] = mockData.epResultsData;
      }

      setExpansionPlans(initialPlans);
      setGenerationCandidates([]);
      setTransmissionCandidates([]);
      setSolverResults(allSolverResults);
      setNpvResults(allNpvResults);
      setUnitAdditionResults(allUnitAdditionResults);
      setUnitRetirementResults(allUnitRetirementResults);
      setSolverLogs(allSolverLogs);
      setEpResultsData(allEpResultsData);
      setSolverStatuses({});
      setSelectedPlanId(initialPlans[0]?.id || null);

      Alert.alert('Success', 'All data has been reset with sample plans!');
    } catch (error) {
      console.error('Failed to reset data:', error);
      Alert.alert('Error', 'Failed to reset data. Please try again.');
    }
  }, []);

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

    // Generate mock results data for the new plan
    const mockData = generateAllMockData({
      id: newPlan.id,
      name: newPlan.name,
      region: newPlan.region,
      planningHorizonStart: newPlan.planningHorizonStart,
      planningHorizonEnd: newPlan.planningHorizonEnd,
    });
    setSolverResults(prev => [...prev, ...mockData.solverResults]);
    setNpvResults(prev => [...prev, ...mockData.npvResults]);
    setUnitAdditionResults(prev => [...prev, ...mockData.unitAdditionResults]);
    setUnitRetirementResults(prev => [...prev, ...mockData.unitRetirementResults]);
    setSolverLogs(prev => [...prev, ...mockData.solverLogs]);
    setEpResultsData(prev => ({...prev, [newPlan.id]: mockData.epResultsData}));
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
    // Also delete associated results data
    setSolverResults(prev => prev.filter(r => r.expansionPlanId !== id));
    setNpvResults(prev => prev.filter(r => r.expansionPlanId !== id));
    setUnitAdditionResults(prev => prev.filter(r => r.expansionPlanId !== id));
    setUnitRetirementResults(prev => prev.filter(r => r.expansionPlanId !== id));
    setSolverLogs(prev => prev.filter(l => l.expansionPlanId !== id));
    setEpResultsData(prev => {
      const newData = {...prev};
      delete newData[id];
      return newData;
    });
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

    // Copy results data with new IDs
    const solverResultsToCopy = solverResults.filter(r => r.expansionPlanId === id);
    const newSolverResults = solverResultsToCopy.map(r => ({
      ...r,
      id: `${r.id}-copy-${generateId()}`,
      expansionPlanId: newPlanId,
    }));
    setSolverResults(prev => [...prev, ...newSolverResults]);

    const npvResultsToCopy = npvResults.filter(r => r.expansionPlanId === id);
    const newNpvResults = npvResultsToCopy.map(r => ({
      ...r,
      id: `${r.id}-copy-${generateId()}`,
      expansionPlanId: newPlanId,
    }));
    setNpvResults(prev => [...prev, ...newNpvResults]);

    const unitAdditionsToCopy = unitAdditionResults.filter(r => r.expansionPlanId === id);
    const newUnitAdditions = unitAdditionsToCopy.map(r => ({
      ...r,
      id: `${r.id}-copy-${generateId()}`,
      expansionPlanId: newPlanId,
    }));
    setUnitAdditionResults(prev => [...prev, ...newUnitAdditions]);

    const unitRetirementsToCopy = unitRetirementResults.filter(r => r.expansionPlanId === id);
    const newUnitRetirements = unitRetirementsToCopy.map(r => ({
      ...r,
      id: `${r.id}-copy-${generateId()}`,
      expansionPlanId: newPlanId,
    }));
    setUnitRetirementResults(prev => [...prev, ...newUnitRetirements]);

    // Copy solver logs
    const solverLogsToCopy = solverLogs.filter(l => l.expansionPlanId === id);
    const newSolverLogs = solverLogsToCopy.map(l => ({
      ...l,
      id: `${l.id}-copy-${generateId()}`,
      expansionPlanId: newPlanId,
    }));
    setSolverLogs(prev => [...prev, ...newSolverLogs]);

    // Copy EP results data
    if (epResultsData[id]) {
      setEpResultsData(prev => ({...prev, [newPlanId]: epResultsData[id]}));
    }

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
        epResultsData={epResultsData}
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
        onResetAllData={handleResetAllData}
        onModalVisibleChange={setIsModalOpen}
        selectedDatabaseScenarioId={selectedDatabaseScenarioId}
        onSelectDatabaseScenario={setSelectedDatabaseScenarioId}
        storageMode={storageMode}
        onStorageModeChange={setStorageMode}
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
