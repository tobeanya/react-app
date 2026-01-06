import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {HomePage} from '../pages/HomePage';
import {SettingsPage} from '../pages/SettingsPage';
import {CandidatesPage} from '../pages/CandidatesPage';
import {RunPage} from '../pages/RunPage';
import {SolverStatusPage} from '../pages/SolverStatusPage';
import {SolverResultsPage} from '../pages/SolverResultsPage';
import {NPVResultsPage} from '../pages/NPVResultsPage';
import {UnitAdditionResultsPage} from '../pages/UnitAdditionResultsPage';
import {UnitRetirementResultsPage} from '../pages/UnitRetirementResultsPage';
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
  SAMPLE_STUDIES,
} from '../types';

type TabName = 'Home' | 'Settings' | 'Candidates' | 'Run' | 'Status' | 'Results' | 'NPV Results' | 'Additions' | 'Retirements';

interface Props {
  expansionPlans: ExpansionPlan[];
  generationCandidates: GenerationCandidate[];
  transmissionCandidates: TransmissionCandidate[];
  solverLogs: SolverLog[];
  solverResults: SolverResult[];
  npvResults: NPVResult[];
  unitAdditionResults: UnitAdditionResult[];
  unitRetirementResults: UnitRetirementResult[];
  solverStatus: SolverStatusType;
  selectedPlanId: string | null;
  isModalOpen: boolean;
  onSelectPlan: (id: string) => void;
  onCreatePlan: (name: string) => void;
  onUpdatePlan: (plan: ExpansionPlan) => void;
  onDeletePlan: (id: string) => void;
  onCopyPlan: (id: string, newName: string) => void;
  onCreateGenerationCandidate: (candidate: Omit<GenerationCandidate, 'id'>) => void;
  onUpdateGenerationCandidate: (candidate: GenerationCandidate) => void;
  onDeleteGenerationCandidates: (ids: string[]) => void;
  onCreateTransmissionCandidate: (candidate: Omit<TransmissionCandidate, 'id'>) => void;
  onUpdateTransmissionCandidate: (candidate: TransmissionCandidate) => void;
  onDeleteTransmissionCandidates: (ids: string[]) => void;
  onStartSolver: () => void;
  onStopSolver: () => void;
  onPauseSolver: () => void;
  onSaveAll: () => void;
  onModalVisibleChange: (visible: boolean) => void;
}

export function TopTabNavigator({
  expansionPlans,
  generationCandidates,
  transmissionCandidates,
  solverLogs,
  solverResults,
  npvResults,
  unitAdditionResults,
  unitRetirementResults,
  solverStatus,
  selectedPlanId,
  isModalOpen,
  onSelectPlan,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
  onCopyPlan,
  onCreateGenerationCandidate,
  onUpdateGenerationCandidate,
  onDeleteGenerationCandidates,
  onCreateTransmissionCandidate,
  onUpdateTransmissionCandidate,
  onDeleteTransmissionCandidates,
  onStartSolver,
  onStopSolver,
  onPauseSolver,
  onSaveAll,
  onModalVisibleChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const selectedPlan = expansionPlans.find(p => p.id === selectedPlanId) ?? null;

  // Get available regions from the selected plan's source study
  const getAvailableRegions = () => {
    if (!selectedPlan?.sourceStudyId) return [];
    const study = SAMPLE_STUDIES.find(s => s.id === selectedPlan.sourceStudyId);
    return study?.regions || [];
  };

  const tabs: TabName[] = ['Home', 'Settings', 'Candidates', 'Run', 'Status', 'Results', 'NPV Results', 'Additions', 'Retirements'];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBarScroll}
        contentContainerStyle={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => !isModalOpen && setActiveTab(tab)}
            disabled={isModalOpen}
            // @ts-ignore - disable focus rectangle on Windows
            focusable={false}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>
        {activeTab === 'Home' && (
          <HomePage
            expansionPlans={expansionPlans}
            selectedPlanId={selectedPlanId}
            onSelectPlan={onSelectPlan}
            onCreatePlan={onCreatePlan}
            onUpdatePlan={onUpdatePlan}
            onDeletePlan={onDeletePlan}
            onCopyPlan={onCopyPlan}
            onModalVisibleChange={onModalVisibleChange}
          />
        )}
        {activeTab === 'Settings' && (
          <SettingsPage
            selectedPlan={selectedPlan}
            expansionPlans={expansionPlans}
            onSelectPlan={onSelectPlan}
            onUpdatePlan={onUpdatePlan}
            onSaveAll={onSaveAll}
            onModalVisibleChange={onModalVisibleChange}
          />
        )}
        {activeTab === 'Candidates' && (
          <CandidatesPage
            generationCandidates={generationCandidates}
            transmissionCandidates={transmissionCandidates}
            selectedPlanId={selectedPlanId}
            availableRegions={getAvailableRegions()}
            onCreateGenerationCandidate={onCreateGenerationCandidate}
            onUpdateGenerationCandidate={onUpdateGenerationCandidate}
            onDeleteGenerationCandidates={onDeleteGenerationCandidates}
            onCreateTransmissionCandidate={onCreateTransmissionCandidate}
            onUpdateTransmissionCandidate={onUpdateTransmissionCandidate}
            onDeleteTransmissionCandidates={onDeleteTransmissionCandidates}
            onModalVisibleChange={onModalVisibleChange}
          />
        )}
        {activeTab === 'Run' && (
          <RunPage
            expansionPlans={expansionPlans}
            selectedPlanId={selectedPlanId}
            onSelectPlan={onSelectPlan}
            onStartSolver={onStartSolver}
            onStopSolver={onStopSolver}
            onPauseSolver={onPauseSolver}
            solverStatus={solverStatus}
            onModalVisibleChange={onModalVisibleChange}
          />
        )}
        {activeTab === 'Status' && (
          <SolverStatusPage
            solverLogs={solverLogs}
            solverStatus={solverStatus}
            onModalVisibleChange={onModalVisibleChange}
          />
        )}
        {activeTab === 'Results' && (
          <SolverResultsPage
            solverResults={solverResults}
            onModalVisibleChange={onModalVisibleChange}
          />
        )}
        {activeTab === 'NPV Results' && (
          <NPVResultsPage
            npvResults={npvResults}
            onModalVisibleChange={onModalVisibleChange}
          />
        )}
        {activeTab === 'Additions' && (
          <UnitAdditionResultsPage
            unitAdditionResults={unitAdditionResults}
            onModalVisibleChange={onModalVisibleChange}
          />
        )}
        {activeTab === 'Retirements' && (
          <UnitRetirementResultsPage
            unitRetirementResults={unitRetirementResults}
            onModalVisibleChange={onModalVisibleChange}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
  },
  tabBarScroll: {
    flexGrow: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  tabBar: {
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#60a5fa',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3b82f6',
  },
  content: {
    flex: 1,
  },
});
