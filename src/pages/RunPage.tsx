import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {ExpansionPlan, RunCase, SolverStatusType, SAMPLE_STUDIES, Region} from '../types';
import {useScenarioDetails} from '../hooks/useScenarioDetails';
import {useDatabaseScenarios} from '../hooks';

interface Props {
  expansionPlans: ExpansionPlan[];
  selectedPlanId: string | null;
  solverStatuses: Record<string, SolverStatusType>;
  onSelectPlan: (id: string) => void;
  onStartSolver: (planId: string) => void;
  onStopSolver: (planId: string) => void;
  onPauseSolver: (planId: string) => void;
  onModalVisibleChange: (visible: boolean) => void;
  storageMode?: 'local' | 'database';
  scenarioId?: number | null;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: keyof RunCase | null;
  direction: SortDirection;
}

// Column definitions
const COLUMNS: {key: keyof RunCase; label: string; width: number}[] = [
  {key: 'expansionPlanName', label: 'EXPANSION PLAN', width: 180},
  {key: 'study', label: 'SOURCE STUDY', width: 280},
  {key: 'region', label: 'REGION', width: 80},
  {key: 'status', label: 'STATUS', width: 100},
  {key: 'cycle', label: 'CYCLE', width: 70},
  {key: 'caseRunning', label: 'CASE RUNNING', width: 110},
  {key: 'totalCapacityBuilt', label: 'CAPACITY BUILT', width: 130},
  {key: 'totalCapacityRetired', label: 'CAPACITY RETIRED', width: 130},
  {key: 'horizon', label: 'HORIZON', width: 100},
];

export function RunPage({
  expansionPlans,
  selectedPlanId,
  solverStatuses,
  onSelectPlan,
  onStartSolver,
  onStopSolver,
  onPauseSolver,
  storageMode = 'local',
  scenarioId,
}: Props) {
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({key: null, direction: null});
  const [colWidths, setColWidths] = useState<{[key: string]: number}>(
    COLUMNS.reduce((acc, col) => ({...acc, [col.key]: col.width}), {}),
  );
  const [resizing, setResizing] = useState<{
    column: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Fetch database data when in database mode
  const {scenarios, isLoading: isLoadingScenarios} = useDatabaseScenarios();
  const {details: scenarioDetails, isLoading: isLoadingDetails} = useScenarioDetails(
    storageMode === 'database' ? scenarioId : null
  );

  const selectedPlan = expansionPlans.find(p => p.id === selectedPlanId);
  const selectedScenario = scenarios.find(s => s.epScenarioId === scenarioId);

  // Get plan/scenario name for display based on mode
  const activePlanName = storageMode === 'local'
    ? selectedPlan?.name || 'Select a plan'
    : selectedScenario?.epScenarioDescription || 'Select a plan';

  // Get study info for display based on mode
  const activeStudyName = storageMode === 'local'
    ? (selectedPlan?.sourceStudyId
        ? SAMPLE_STUDIES.find(s => s.id === selectedPlan.sourceStudyId)?.name || '-'
        : '-')
    : (scenarioDetails?.studies?.[0]?.unitCategoryDescription || '-');

  // Get planning horizon
  const planningHorizonStart = storageMode === 'local'
    ? selectedPlan?.planningHorizonStart
    : (scenarioDetails?.studies?.[0]?.year ? parseInt(scenarioDetails.studies[0].year, 10) : undefined);

  const planningHorizonEnd = storageMode === 'local'
    ? selectedPlan?.planningHorizonEnd
    : (scenarioDetails?.studies?.[0]?.endYear ? parseInt(scenarioDetails.studies[0].endYear, 10) : undefined);

  // Helper to get status for a plan - now looks up from per-plan statuses
  const getPlanStatus = (planId: string): 'Running' | 'Paused' | 'Inactive' | 'Error' | 'Finished' => {
    const status = solverStatuses[planId] || 'inactive';
    switch (status) {
      case 'running':
        return 'Running';
      case 'paused':
        return 'Paused';
      case 'finished':
        return 'Finished';
      case 'error':
        return 'Error';
      default:
        return 'Inactive';
    }
  };

  // Generate run cases from expansion plans (local mode) or scenarios (database mode)
  const runCases: RunCase[] = useMemo(() => {
    if (storageMode === 'database') {
      // In database mode, show database scenarios
      return scenarios.map(scenario => {
        const status = getPlanStatus(scenario.epScenarioId?.toString() || '');
        return {
          id: scenario.epScenarioId?.toString() || '',
          expansionPlanId: scenario.epScenarioId?.toString() || '',
          expansionPlanName: scenario.epScenarioDescription || 'Unnamed Scenario',
          study: '-', // Could be fetched from scenario details if needed
          region: (scenario.region || 'ERCOT') as Region,
          status,
          cycle: status === 'Running' ? 1 : 0,
          caseRunning: status === 'Running' ? 1 : 0,
          totalCapacityBuilt: '0 MW',
          totalCapacityRetired: '0 MW',
          horizon: scenario.planningHorizonStart && scenario.planningHorizonEnd
            ? `${scenario.planningHorizonStart}-${scenario.planningHorizonEnd}`
            : '-',
        };
      });
    }
    // Local mode - use expansion plans
    return expansionPlans.map(plan => {
      const study = SAMPLE_STUDIES.find(s => s.id === plan.sourceStudyId);
      const status = getPlanStatus(plan.id);
      return {
        id: plan.id,
        expansionPlanId: plan.id,
        expansionPlanName: plan.name,
        study: study?.name || '-',
        region: plan.region,
        status,
        cycle: status === 'Running' ? 1 : 0,
        caseRunning: status === 'Running' ? 1 : 0,
        totalCapacityBuilt: '0 MW',
        totalCapacityRetired: '0 MW',
        horizon: `${plan.planningHorizonStart}-${plan.planningHorizonEnd}`,
      };
    });
  }, [storageMode, expansionPlans, scenarios, solverStatuses]);

  // Sorting logic
  const handleSort = (columnKey: keyof RunCase) => {
    setSortConfig(prev => {
      if (prev.key !== columnKey) {
        return {key: columnKey, direction: 'asc'};
      }
      if (prev.direction === 'asc') {
        return {key: columnKey, direction: 'desc'};
      }
      return {key: null, direction: null};
    });
  };

  const getSortIndicator = (columnKey: keyof RunCase) => {
    if (sortConfig.key !== columnKey) return '';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const sortedRunCases = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return runCases;
    }
    return [...runCases].sort((a, b) => {
      const aVal = a[sortConfig.key!];
      const bVal = b[sortConfig.key!];
      if (aVal === bVal) return 0;
      let comparison: number;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [runCases, sortConfig]);

  // Column resize handlers
  const handleResizeStart = (column: string, startX: number) => {
    setResizing({column, startX, startWidth: colWidths[column]});
  };

  const handleResizeMove = (currentX: number) => {
    if (!resizing) return;
    const diff = currentX - resizing.startX;
    const newWidth = Math.max(60, resizing.startWidth + diff);
    setColWidths(prev => ({...prev, [resizing.column]: newWidth}));
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  const renderResizeHandle = (column: string) => (
    <View
      style={[styles.resizeHandle, resizing?.column === column && styles.resizeHandleActive]}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={e => handleResizeStart(column, e.nativeEvent.pageX)}
      onResponderMove={e => handleResizeMove(e.nativeEvent.pageX)}
      onResponderRelease={handleResizeEnd}
      onResponderTerminate={handleResizeEnd}
    />
  );

  const casesRunning = runCases.filter(c => c.status === 'Running').length;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Running':
        return styles.statusRunning;
      case 'Paused':
        return styles.statusPaused;
      case 'Finished':
        return styles.statusFinished;
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
      case 'Finished':
        return styles.statusTextFinished;
      case 'Inactive':
        return styles.statusTextInactive;
      case 'Error':
        return styles.statusTextError;
      default:
        return styles.statusTextInactive;
    }
  };

  // Get the active plan/scenario ID based on mode
  const activePlanId = storageMode === 'local'
    ? selectedPlanId
    : scenarioId?.toString() || null;

  // Get the status for the currently selected plan
  const selectedPlanSolverStatus = activePlanId
    ? (solverStatuses[activePlanId] || 'inactive')
    : 'inactive';

  const getSolverStatusText = () => {
    switch (selectedPlanSolverStatus) {
      case 'running':
        return 'Running';
      case 'paused':
        return 'Paused';
      case 'finished':
        return 'Finished';
      case 'error':
        return 'Error';
      default:
        return 'Inactive';
    }
  };

  const getSolverStatusColor = () => {
    switch (selectedPlanSolverStatus) {
      case 'running':
        return '#10b981';
      case 'paused':
        return '#f59e0b';
      case 'finished':
        return '#60a5fa';
      case 'error':
        return '#ef4444';
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
          <View style={styles.headerLeft}>
            <View style={styles.headerIconContainer}>
              <Text style={styles.headerIcon}>▶</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>RUN</Text>
              <Text style={styles.headerSubtitle}>
                Execute and monitor expansion planning optimization
              </Text>
            </View>
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
                  onPress={() => storageMode === 'local' && setShowPlanDropdown(!showPlanDropdown)}
                  disabled={storageMode === 'database'}>
                  <Text style={styles.dropdownText}>
                    {activePlanName}
                  </Text>
                  {storageMode === 'local' && <Text style={styles.dropdownArrow}>▼</Text>}
                </TouchableOpacity>
                {showPlanDropdown && storageMode === 'local' && (
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

              {/* Source Study (Read-only) */}
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>SOURCE STUDY</Text>
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyText} numberOfLines={1}>
                    {activeStudyName}
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
                      casesRunning > 0 && styles.statusDotActive,
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
                  (!activePlanId || selectedPlanSolverStatus === 'running') && styles.buttonDisabled,
                ]}
                onPress={() => activePlanId && onStartSolver(activePlanId)}
                disabled={!activePlanId || selectedPlanSolverStatus === 'running'}>
                <Text style={styles.buttonStartText}>▶ Start</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonStop,
                  (!activePlanId || selectedPlanSolverStatus === 'inactive') && styles.buttonDisabled,
                ]}
                onPress={() => activePlanId && onStopSolver(activePlanId)}
                disabled={!activePlanId || selectedPlanSolverStatus === 'inactive'}>
                <Text style={styles.buttonStopText}>■ Stop</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonPause,
                  (!activePlanId || selectedPlanSolverStatus !== 'running') && styles.buttonDisabled,
                ]}
                onPress={() => activePlanId && onPauseSolver(activePlanId)}
                disabled={!activePlanId || selectedPlanSolverStatus !== 'running'}>
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
                  {planningHorizonStart && planningHorizonEnd
                    ? `${planningHorizonStart}-${planningHorizonEnd}`
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
            <Text style={styles.statusBarLabel}>Status:</Text>
            <Text style={[styles.statusBarValue, {color: getSolverStatusColor()}]}>
              {getSolverStatusText()}
            </Text>
          </View>
          <View style={styles.statusBarItem}>
            <Text style={styles.statusBarLabel}>Cycle:</Text>
            <Text style={styles.statusBarCycle}>{currentCycle}</Text>
          </View>
        </View>

        {/* Running Cases Table */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                {COLUMNS.map(col => (
                  <TouchableOpacity
                    key={col.key}
                    style={[styles.headerCell, {width: colWidths[col.key]}]}
                    onPress={() => handleSort(col.key)}>
                    <Text style={styles.headerCellText} numberOfLines={1}>
                      {col.label}{getSortIndicator(col.key)}
                    </Text>
                    {renderResizeHandle(col.key)}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Table Body */}
              {sortedRunCases.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No cases configured. Create an expansion plan and add candidates
                    to begin.
                  </Text>
                </View>
              ) : (
                sortedRunCases.map((caseItem, idx) => (
                  <View
                    key={caseItem.id}
                    style={[
                      styles.tableRow,
                      idx % 2 === 0 && styles.tableRowAlt,
                    ]}>
                    <View style={[styles.cell, {width: colWidths.expansionPlanName}]}>
                      <Text style={styles.cellTextBold} numberOfLines={1}>
                        {caseItem.expansionPlanName}
                      </Text>
                    </View>
                    <View style={[styles.cell, {width: colWidths.study}]}>
                      <Text style={styles.cellText} numberOfLines={1}>
                        {caseItem.study}
                      </Text>
                    </View>
                    <View style={[styles.cell, {width: colWidths.region}]}>
                      <Text style={styles.cellText}>{caseItem.region}</Text>
                    </View>
                    <View style={[styles.cell, {width: colWidths.status}]}>
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
                    <View style={[styles.cell, styles.cellRight, {width: colWidths.cycle}]}>
                      <Text style={styles.cellCycleValue}>{caseItem.cycle}</Text>
                    </View>
                    <View style={[styles.cell, styles.cellRight, {width: colWidths.caseRunning}]}>
                      <Text style={styles.cellText}>{caseItem.caseRunning}</Text>
                    </View>
                    <View style={[styles.cell, styles.cellRight, {width: colWidths.totalCapacityBuilt}]}>
                      <Text style={styles.cellCapacityBuilt}>
                        {caseItem.totalCapacityBuilt}
                      </Text>
                    </View>
                    <View style={[styles.cell, styles.cellRight, {width: colWidths.totalCapacityRetired}]}>
                      <Text style={styles.cellCapacityRetired}>
                        {caseItem.totalCapacityRetired}
                      </Text>
                    </View>
                    <View style={[styles.cell, {width: colWidths.horizon}]}>
                      <Text style={styles.cellText}>{caseItem.horizon}</Text>
                    </View>
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
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
    gap: 8,
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
    position: 'relative',
    overflow: 'visible',
  },
  headerCellText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fde047',
    letterSpacing: 0.5,
  },
  resizeHandle: {
    position: 'absolute',
    right: -5,
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: 'transparent',
    zIndex: 10,
    borderRightWidth: 2,
    borderRightColor: 'rgba(59, 130, 246, 0.3)',
  },
  resizeHandleHover: {
    borderRightColor: 'rgba(96, 165, 250, 0.8)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  resizeHandleActive: {
    borderRightColor: '#60a5fa',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
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
    justifyContent: 'center',
  },
  cellRight: {
    alignItems: 'flex-end',
  },
  cellText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  cellTextBold: {
    fontSize: 13,
    fontWeight: '500',
    color: '#cbd5e1',
  },
  cellCycleValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#60a5fa',
  },
  cellCapacityBuilt: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10b981',
  },
  cellCapacityRetired: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ef4444',
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
  statusFinished: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  statusTextFinished: {
    color: '#60a5fa',
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
