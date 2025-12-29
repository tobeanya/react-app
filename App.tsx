import React, {useState} from 'react';
import {StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {TopTabNavigator} from './src/navigation/TopTabNavigator';
import {ExpansionPlan, Candidate} from './src/types';

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
  const [candidates, setCandidates] = useState<Candidate[]>([]);
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
      solverType: 'Normal',
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
    setCandidates(prev => prev.filter(c => c.expansionPlanId !== id));
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
    };
    setExpansionPlans(prev => [...prev, newPlan]);

    const candidatesToCopy = candidates.filter(c => c.expansionPlanId === id);
    const newCandidates = candidatesToCopy.map(c => ({
      ...c,
      id: generateId(),
      expansionPlanId: newPlanId,
    }));
    setCandidates(prev => [...prev, ...newCandidates]);
    setSelectedPlanId(newPlanId);
  };

  const handleCreateCandidate = (candidateData: Omit<Candidate, 'id'>) => {
    const newCandidate: Candidate = {
      ...candidateData,
      id: generateId(),
    };
    setCandidates(prev => [...prev, newCandidate]);
  };

  const handleUpdateCandidate = (candidate: Candidate) => {
    setCandidates(prev =>
      prev.map(c => (c.id === candidate.id ? candidate : c)),
    );
  };

  const handleDeleteCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  return (
    <View style={[styles.container, {paddingTop: safeAreaInsets.top}]}>
      <TopTabNavigator
        expansionPlans={expansionPlans}
        candidates={candidates}
        selectedPlanId={selectedPlanId}
        isModalOpen={isModalOpen}
        onSelectPlan={setSelectedPlanId}
        onCreatePlan={handleCreatePlan}
        onUpdatePlan={handleUpdatePlan}
        onDeletePlan={handleDeletePlan}
        onCopyPlan={handleCopyPlan}
        onCreateCandidate={handleCreateCandidate}
        onUpdateCandidate={handleUpdateCandidate}
        onDeleteCandidate={handleDeleteCandidate}
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
