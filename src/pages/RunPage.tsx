import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {ExpansionPlan, RunCase, SolverStatusType, SAMPLE_STUDIES} from '../types';

interface Props {
  expansionPlans: ExpansionPlan[];
  selectedPlanId: string | null;
  onSelectPlan: (id: string) => void;
  onStartSolver: () => void;
  onStopSolver: () => void;
  onPauseSolver: () => void;
  solverStatus: SolverStatusType;
  onModalVisibleChange: (visible: boolean) => void;
}

export function RunPage({
  expansionPlans,
  selectedPlanId,
  onSelectPlan,
  onStartSolver,
  onStopSolver,
  onPauseSolver,
  solverStatus,
}: Props) {
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);

  const selectedPlan = expansionPlans.find(p => p.id === selectedPlanId);

  // Generate run cases from actual expansion plans
  const runCases: RunCase[] = useMemo(() => {
    return expansionPlans.map(plan => {
      const study = SAMPLE_STUDIES.find(s => s.id === plan.sourceStudyId);
      return {
        id: plan.id,
        expansionPlanId: plan.id,
        expansionPlanName: plan.name,
        study: study?.name || '-',
        region: plan.region,
        status: plan.isActive ? 'Running' : 'Inactive' as const,
        cycle: 0,
        caseRunning: plan.isActive ? 1 : 0,
        totalCapacityBuilt: '0 MW',
        totalCapacityRetired: '0 MW',
        horizon: `${plan.planningHorizonStart}-${plan.planningHorizonEnd}`,
      };
    });
  }, [expansionPlans]);

  const casesRunning = runCases.filter(c => c.status === 'Running').length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Running':
        return styles.statusRunning;
      case 'Paused':
        return styles.statusPaused;
      case 'Inactive':
        return styles.statusInactive;
      case 'Error':
        return styles.statusError;
      default:
        return styles.statusInactive;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'Running':
        return styles.statusTextRunning;
      case 'Paused':
        return styles.statusTextPaused;
      case 'Inactive':
        return styles.statusTextInactive;
      case 'Error':
        return styles.statusTextError;
      default:
        return styles.statusTextInactive;
    }
  };

  const getSolverStatusText = () => {
    switch (solverStatus) {
      case 'running':
        return 'Running';
      case 'paused':
        return 'Paused';
      default:
        return 'Ready';
    }
  };

  const getSolverStatusColor = () => {
    switch (solverStatus) {
      case 'running':
        return '#10b981';
      case 'paused':
        return '#f59e0b';
      default:
        return '#94a3b8';
    }
  };

  const currentCycle = runCases.find(c => c.status === 'Running')?.cycle || 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>▶</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>RUN</Text>
            <Text style={styles.headerSubtitle}>
              Execute and monitor expansion planning optimization
            </Text>
          </View>
        </View>

        {/* Control Panel Row */}
        <View style={styles.controlRow}>
          {/* Left: Configuration */}
          <View style={styles.controlPanel}>
            <View style={styles.configRow}>
              {/* Expansion Plan Dropdown */}
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>EXPANSION PLAN</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowPlanDropdown(!showPlanDropdown)}>
                  <Text style={styles.dropdownText}>
                    {selectedPlan?.name || 'Select a plan'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                {showPlanDropdown && (
                  <View style={styles.dropdownMenu}>
                    {expansionPlans.map(plan => (
                      <TouchableOpacity
                        key={plan.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          onSelectPlan(plan.id);
                          setShowPlanDropdown(false);
                        }}>
                        <Text style={styles.dropdownItemText}>{plan.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Study (Read-only) */}
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>STUDY</Text>
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyText}>
                    {selectedPlan?.sourceStudyId || '-'}
                  </Text>
                </View>
              </View>

              {/* Cases Running */}
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>CASES RUNNING</Text>
                <View style={styles.casesRunningBox}>
                  <View
                    style={[
                      styles.statusDot,
                      solverStatus === 'running' && styles.statusDotActive,
                    ]}
                  />
                  <Text style={styles.casesRunningNumber}>{casesRunning}</Text>
                </View>
              </View>
            </View>

            {/* Control Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonStart,
                  solverStatus === 'running' && styles.buttonDisabled,
                ]}
                onPress={onStartSolver}
                disabled={solverStatus === 'running'}>
                <Text style={styles.buttonStartText}>▶ Start</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonStop,
                  solverStatus === 'ready' && styles.buttonDisabled,
                ]}
                onPress={onStopSolver}
                disabled={solverStatus === 'ready'}>
                <Text style={styles.buttonStopText}>■ Stop</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonPause,
                  solverStatus !== 'running' && styles.buttonDisabled,
                ]}
                onPress={onPauseSolver}
                disabled={solverStatus !== 'running'}>
                <Text style={styles.buttonPauseText}>❚❚ Pause</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.buttonSecondary]}>
                <Text style={styles.buttonSecondaryText}>↻ Refresh</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.buttonSecondary]}>
                <Text style={styles.buttonSecondaryText}>↓ Export</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right: Study Summary */}
          <View style={styles.summaryPanel}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryIcon}>⚡</Text>
              <Text style={styles.summaryTitle}>STUDY SUMMARY</Text>
            </View>
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Study Years</Text>
                <Text style={styles.summaryValue}>
                  {selectedPlan
                    ? `${selectedPlan.planningHorizonStart}-${selectedPlan.planningHorizonEnd}`
                    : '-'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Cases</Text>
                <Text style={styles.summaryValue}>{runCases.length}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Number of Seeds</Text>
                <Text style={styles.summaryValue}>3</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>LFEs</Text>
                <Text style={styles.summaryValueMuted}>(number_LFEs)</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Weather Year</Text>
                <Text style={styles.summaryValueMuted}>(number_of_wth_yrs)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status Info Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusBarItem}>
            <Text style={styles.statusBarLabel}>Status: </Text>
            <Text style={[styles.statusBarValue, {color: getSolverStatusColor()}]}>
              {getSolverStatusText()}
            </Text>
          </View>
          <View style={styles.statusBarItem}>
            <Text style={styles.statusBarLabel}>Cycle: </Text>
            <Text style={styles.statusBarCycle}>{currentCycle}</Text>
          </View>
        </View>

        {/* Running Cases Table */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.cellPlan]}>
                  EXPANSION PLAN
                </Text>
                <Text style={[styles.headerCell, styles.cellStudy]}>STUDY</Text>
                <Text style={[styles.headerCell, styles.cellRegion]}>REGION</Text>
                <Text style={[styles.headerCell, styles.cellStatus]}>STATUS</Text>
                <Text style={[styles.headerCell, styles.cellCycle]}>CYCLE</Text>
                <Text style={[styles.headerCell, styles.cellCase]}>
                  CASE RUNNING
                </Text>
                <Text style={[styles.headerCell, styles.cellCapacity]}>
                  CAPACITY BUILT
                </Text>
                <Text style={[styles.headerCell, styles.cellCapacity]}>
                  CAPACITY RETIRED
                </Text>
                <Text style={[styles.headerCell, styles.cellHorizon]}>HORIZON</Text>
              </View>

              {/* Table Body */}
              {runCases.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No cases configured. Create an expansion plan and add candidates
                    to begin.
                  </Text>
                </View>
              ) : (
                runCases.map((caseItem, idx) => (
                  <View
                    key={caseItem.id}
                    style={[
                      styles.tableRow,
                      idx % 2 === 0 && styles.tableRowAlt,
                    ]}>
                    <Text style={[styles.cell, styles.cellPlan, styles.cellTextBold]}>
                      {caseItem.expansionPlanName}
                    </Text>
                    <Text style={[styles.cell, styles.cellStudy]}>
                      {caseItem.study}
                    </Text>
                    <Text style={[styles.cell, styles.cellRegion]}>
                      {caseItem.region}
                    </Text>
                    <View style={[styles.cell, styles.cellStatus]}>
                      <View style={[styles.statusBadge, getStatusStyle(caseItem.status)]}>
                        <Text
                          style={[
                            styles.statusBadgeText,
                            getStatusTextStyle(caseItem.status),
                          ]}>
                          {caseItem.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.cell, styles.cellCycle, styles.cellCycleValue]}>
                      {caseItem.cycle}
                    </Text>
                    <Text style={[styles.cell, styles.cellCase]}>
                      {caseItem.caseRunning}
                    </Text>
                    <Text
                      style={[
                        styles.cell,
                        styles.cellCapacity,
                        styles.cellCapacityBuilt,
                      ]}>
                      {caseItem.totalCapacityBuilt}
                    </Text>
                    <Text
                      style={[
                        styles.cell,
                        styles.cellCapacity,
                        styles.cellCapacityRetired,
                      ]}>
                      {caseItem.totalCapacityRetired}
                    </Text>
                    <Text style={[styles.cell, styles.cellHorizon]}>
                      {caseItem.horizon}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    color: '#fff',
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  controlPanel: {
    flex: 2,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  configRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  configItem: {
    flex: 1,
    position: 'relative',
  },
  configLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dropdownText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  dropdownArrow: {
    color: '#94a3b8',
    fontSize: 10,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 100,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  dropdownItemText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  readOnlyField: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  readOnlyText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  casesRunningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#475569',
  },
  statusDotActive: {
    backgroundColor: '#10b981',
  },
  casesRunningNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonStart: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  buttonStartText: {
    color: '#10b981',
    fontWeight: '500',
    fontSize: 14,
  },
  buttonStop: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  buttonStopText: {
    color: '#ef4444',
    fontWeight: '500',
    fontSize: 14,
  },
  buttonPause: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  buttonPauseText: {
    color: '#fbbf24',
    fontWeight: '500',
    fontSize: 14,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  buttonSecondaryText: {
    color: '#94a3b8',
    fontWeight: '500',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  summaryPanel: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  summaryIcon: {
    fontSize: 18,
    color: '#60a5fa',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93c5fd',
    letterSpacing: 1,
  },
  summaryContent: {
    gap: 12,
  },
  summaryItem: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#cbd5e1',
  },
  summaryValueMuted: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#94a3b8',
  },
  statusBar: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    flexDirection: 'row',
    gap: 24,
  },
  statusBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBarLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  statusBarValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBarCycle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#60a5fa',
  },
  tableContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.8)',
  },
  headerCell: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 11,
    fontWeight: '600',
    color: '#fde047',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  tableRowAlt: {
    backgroundColor: 'rgba(30, 41, 59, 0.2)',
  },
  cell: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 13,
    color: '#94a3b8',
  },
  cellTextBold: {
    fontWeight: '500',
    color: '#cbd5e1',
  },
  cellPlan: {
    width: 180,
  },
  cellStudy: {
    width: 140,
  },
  cellRegion: {
    width: 80,
  },
  cellStatus: {
    width: 100,
    justifyContent: 'center',
  },
  cellCycle: {
    width: 70,
    textAlign: 'right',
  },
  cellCycleValue: {
    fontWeight: '500',
    color: '#60a5fa',
  },
  cellCase: {
    width: 110,
    textAlign: 'right',
  },
  cellCapacity: {
    width: 130,
    textAlign: 'right',
    fontWeight: '500',
  },
  cellCapacityBuilt: {
    color: '#10b981',
  },
  cellCapacityRetired: {
    color: '#ef4444',
  },
  cellHorizon: {
    width: 100,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusRunning: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusTextRunning: {
    color: '#10b981',
  },
  statusPaused: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusTextPaused: {
    color: '#f59e0b',
  },
  statusInactive: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  statusTextInactive: {
    color: '#94a3b8',
  },
  statusError: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusTextError: {
    color: '#ef4444',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});
