import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {HomePage} from '../pages/HomePage';
import {SettingsPage} from '../pages/SettingsPage';
import {CandidatesPage} from '../pages/CandidatesPage';
import {ExpansionPlan, Candidate} from '../types';

const Tab = createMaterialTopTabNavigator();

interface Props {
  expansionPlans: ExpansionPlan[];
  candidates: Candidate[];
  selectedPlanId: string | null;
  isModalOpen: boolean;
  onSelectPlan: (id: string) => void;
  onCreatePlan: (name: string) => void;
  onUpdatePlan: (plan: ExpansionPlan) => void;
  onDeletePlan: (id: string) => void;
  onCopyPlan: (id: string, newName: string) => void;
  onCreateCandidate: (candidate: Omit<Candidate, 'id'>) => void;
  onUpdateCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (id: string) => void;
  onModalVisibleChange: (visible: boolean) => void;
}

export function TopTabNavigator({
  expansionPlans,
  candidates,
  selectedPlanId,
  isModalOpen,
  onSelectPlan,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
  onCopyPlan,
  onCreateCandidate,
  onUpdateCandidate,
  onDeleteCandidate,
  onModalVisibleChange,
}: Props) {
  const selectedPlan = expansionPlans.find(p => p.id === selectedPlanId) ?? null;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: {fontSize: 14, fontWeight: '600'},
        tabBarStyle: {
          backgroundColor: '#fff',
          opacity: isModalOpen ? 0.5 : 1,
          pointerEvents: isModalOpen ? 'none' : 'auto',
        },
        tabBarIndicatorStyle: {backgroundColor: '#007AFF'},
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        swipeEnabled: !isModalOpen,
      }}>
      <Tab.Screen name="Home">
        {() => (
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
      </Tab.Screen>
      <Tab.Screen name="Settings">
        {() => (
          <SettingsPage
            selectedPlan={selectedPlan}
            onUpdatePlan={onUpdatePlan}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Candidates">
        {() => (
          <CandidatesPage
            candidates={candidates}
            selectedPlanId={selectedPlanId}
            onCreateCandidate={onCreateCandidate}
            onUpdateCandidate={onUpdateCandidate}
            onDeleteCandidate={onDeleteCandidate}
            onModalVisibleChange={onModalVisibleChange}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
