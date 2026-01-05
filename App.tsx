import React, {useState} from 'react';
import {StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {TopTabNavigator} from './src/navigation/TopTabNavigator';
import {
  ExpansionPlan,
  GenerationCandidate,
  TransmissionCandidate,
  SolverLog,
  SolverResult,
  SolverStatusType,
  DEFAULT_SETTINGS,
  SAMPLE_SOLVER_LOGS,
} from './src/types';
import {SOLVER_RESULTS_DATA} from './src/data/solverResults';

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

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  const [expansionPlans, setExpansionPlans] = useState<ExpansionPlan[]>([]);
  const [generationCandidates, setGenerationCandidates] = useState<GenerationCandidate[]>([]);
  const [transmissionCandidates, setTransmissionCandidates] = useState<TransmissionCandidate[]>([]);
  const [solverLogs, setSolverLogs] = useState<SolverLog[]>(SAMPLE_SOLVER_LOGS);
  const [solverResults, setSolverResults] = useState<SolverResult[]>(SOLVER_RESULTS_DATA);
  const [solverStatus, setSolverStatus] = useState<SolverStatusType>('ready');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <View style={[styles.container, {paddingTop: safeAreaInsets.top}]}>
      <TopTabNavigator
        expansionPlans={expansionPlans}
        generationCandidates={generationCandidates}
        transmissionCandidates={transmissionCandidates}
        solverLogs={solverLogs}
        solverResults={solverResults}
        solverStatus={solverStatus}
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
