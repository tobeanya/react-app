import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import {ExpansionPlan} from '../types';
import {useDatabaseScenarios} from '../hooks';
import {DatabaseScenario, getScenarioStatusColor, getRegionColor} from '../data/mockScenarios';
import {DatabaseConnectionSection} from '../components/DatabaseConnectionSection';

interface Props {
  expansionPlans: ExpansionPlan[];
  selectedPlanId: string | null;
  onSelectPlan: (id: string) => void;
  onCreatePlan: (name: string) => void;
  onUpdatePlan: (plan: ExpansionPlan) => void;
  onDeletePlan: (id: string) => void;
  onCopyPlan: (id: string, newName: string) => void;
  onResetAllData: () => void;
  onModalVisibleChange: (visible: boolean) => void;
  storageMode: 'local' | 'database';
  onStorageModeChange: (mode: 'local' | 'database') => void;
  selectedDatabaseScenarioId: number | null;
  onSelectDatabaseScenario: (id: number | null) => void;
}

export function HomePage({
  expansionPlans,
  selectedPlanId,
  onSelectPlan,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
  onCopyPlan,
  onResetAllData,
  onModalVisibleChange,
  storageMode,
  onStorageModeChange,
  selectedDatabaseScenarioId,
  onSelectDatabaseScenario,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const containerRef = useRef<View>(null);

  // Fetch database scenarios and mutations
  const {
    scenarios,
    isLoading: isScenariosLoading,
    isUsingMockData,
    createScenario,
    updateScenario,
    deleteScenario,
    isCreating,
  } = useDatabaseScenarios();

  // State for editing database scenarios
  const [editingScenarioId, setEditingScenarioId] = useState<number | null>(null);
  const [copyingScenarioId, setCopyingScenarioId] = useState<number | null>(null);

  // State for database connection modal
  const [connectionModalVisible, setConnectionModalVisible] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);

  const showModal = () => {
    setModalVisible(true);
    onModalVisibleChange(true);
  };

  const hideModal = useCallback(() => {
    setModalVisible(false);
    onModalVisibleChange(false);
  }, [onModalVisibleChange]);

  const showConnectionModal = useCallback(() => {
    setConnectionModalVisible(true);
    onModalVisibleChange(true);
  }, [onModalVisibleChange]);

  const hideConnectionModal = useCallback(() => {
    setConnectionModalVisible(false);
    onModalVisibleChange(false);
  }, [onModalVisibleChange]);

  // Handle escape key
  const handleKeyDown = useCallback((e: any) => {
    const key = e.nativeEvent?.key || e.key;
    if (key === 'Escape') {
      if (modalVisible) {
        hideModal();
      } else if (connectionModalVisible) {
        hideConnectionModal();
      }
    }
  }, [modalVisible, connectionModalVisible, hideModal, hideConnectionModal]);

  // Focus container when modal opens
  const anyModalOpen = modalVisible || connectionModalVisible;
  useEffect(() => {
    if (anyModalOpen && containerRef.current) {
      // @ts-ignore
      containerRef.current.focus?.();
    }
  }, [anyModalOpen]);
  const [editingPlan, setEditingPlan] = useState<ExpansionPlan | null>(null);
  const [copyingPlanId, setCopyingPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');

  const openCreateModal = () => {
    setEditingPlan(null);
    setCopyingPlanId(null);
    setEditingScenarioId(null);
    setCopyingScenarioId(null);
    setPlanName('');
    showModal();
  };

  const openEditModal = (plan: ExpansionPlan) => {
    setEditingPlan(plan);
    setCopyingPlanId(null);
    setEditingScenarioId(null);
    setCopyingScenarioId(null);
    setPlanName(plan.name);
    showModal();
  };

  const openCopyModal = (plan: ExpansionPlan) => {
    setEditingPlan(null);
    setCopyingPlanId(plan.id);
    setEditingScenarioId(null);
    setCopyingScenarioId(null);
    setPlanName('');
    showModal();
  };

  // Database scenario modal handlers
  const openEditScenarioModal = (scenario: DatabaseScenario) => {
    setEditingPlan(null);
    setCopyingPlanId(null);
    setEditingScenarioId(scenario.epScenarioId);
    setCopyingScenarioId(null);
    setPlanName(scenario.epScenarioDescription);
    showModal();
  };

  const openCopyScenarioModal = (scenario: DatabaseScenario) => {
    setEditingPlan(null);
    setCopyingPlanId(null);
    setEditingScenarioId(null);
    setCopyingScenarioId(scenario.epScenarioId);
    setPlanName('');
    showModal();
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (storageMode === 'database') {
      // Database mode: use API
      try {
        if (editingScenarioId) {
          // Update existing scenario
          await updateScenario(editingScenarioId, planName);
        } else if (copyingScenarioId) {
          // Copy scenario (create new with same data)
          const newScenario = await createScenario(planName);
          if (newScenario.epScenarioId) {
            onSelectDatabaseScenario(newScenario.epScenarioId);
          }
        } else {
          // Create new scenario
          const newScenario = await createScenario(planName);
          if (newScenario.epScenarioId) {
            onSelectDatabaseScenario(newScenario.epScenarioId);
          }
        }
        hideModal();
        setEditingScenarioId(null);
        setCopyingScenarioId(null);
      } catch (error) {
        Alert.alert('Error', 'Failed to save plan in database');
      }
    } else {
      // Local mode: use local state
      if (copyingPlanId) {
        onCopyPlan(copyingPlanId, planName);
      } else if (editingPlan) {
        onUpdatePlan({...editingPlan, name: planName});
      } else {
        onCreatePlan(planName);
      }
      hideModal();
      setCopyingPlanId(null);
    }
  };

  const handleDelete = (plan: ExpansionPlan) => {
    Alert.alert(
      'Delete Plan',
      `Are you sure you want to delete "${plan.name}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: () => onDeletePlan(plan.id)},
      ],
    );
  };

  const handleDeleteScenario = (scenario: DatabaseScenario) => {
    Alert.alert(
      'Delete Plan',
      `Are you sure you want to delete "${scenario.epScenarioDescription}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScenario(scenario.epScenarioId);
              if (selectedDatabaseScenarioId === scenario.epScenarioId) {
                onSelectDatabaseScenario(null);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete plan from database');
            }
          },
        },
      ],
    );
  };

  const toggleActive = (plan: ExpansionPlan) => {
    onUpdatePlan({...plan, isActive: !plan.isActive});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderPlanItem = ({item}: {item: ExpansionPlan}) => (
    <TouchableOpacity
      style={[
        styles.planItem,
        selectedPlanId === item.id && styles.planItemSelected,
      ]}
      onPress={() => onSelectPlan(item.id)}>
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{item.name}</Text>
          <Text style={styles.planDetails}>
            Created: {formatDate(item.dateCreated)}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.statusBadge,
            item.isActive ? styles.activeBadge : styles.inactiveBadge,
          ]}
          onPress={() => toggleActive(item)}>
          <Text
            style={[
              styles.statusText,
              item.isActive ? styles.activeText : styles.inactiveText,
            ]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.planActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}>
          <Text style={styles.actionText}>Rename</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openCopyModal(item)}>
          <Text style={styles.actionText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render database scenario item - matches local plan item style
  const renderScenarioItem = ({item}: {item: DatabaseScenario}) => {
    const statusColors = getScenarioStatusColor(item.status);
    const isSelected = selectedDatabaseScenarioId === item.epScenarioId;

    return (
      <TouchableOpacity
        style={[styles.planItem, isSelected && styles.planItemSelected]}
        onPress={() => onSelectDatabaseScenario(item.epScenarioId)}>
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>{item.epScenarioDescription}</Text>
            <Text style={styles.planDetails}>
              {item.createdDate ? `Created: ${item.createdDate}` : 'Database Plan'}
            </Text>
          </View>
          {item.status && (
            <View style={[styles.statusBadge, {backgroundColor: statusColors.bg, borderColor: statusColors.border}]}>
              <View style={[styles.statusDot, {backgroundColor: statusColors.text}]} />
              <Text style={[styles.statusText, {color: statusColors.text}]}>
                {item.status}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.planActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditScenarioModal(item)}>
            <Text style={styles.actionText}>Rename</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openCopyScenarioModal(item)}>
            <Text style={styles.actionText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteScenario(item)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      ref={containerRef}
      style={styles.container}
      // @ts-ignore - keyboard events for RN Windows
      onKeyDown={anyModalOpen ? handleKeyDown : undefined}
      onKeyUp={anyModalOpen ? handleKeyDown : undefined}
      focusable={anyModalOpen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>☰</Text>
          </View>
          <Text style={styles.title}>EXPANSION PLANS</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Storage Mode Toggle */}
          <View style={styles.storageModeToggle}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                storageMode === 'local' && styles.modeButtonActive,
              ]}
              onPress={() => onStorageModeChange('local')}>
              <Text style={[
                styles.modeButtonText,
                storageMode === 'local' && styles.modeButtonTextActive,
              ]}>Local</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                storageMode === 'database' && styles.modeButtonActiveDb,
              ]}
              onPress={() => onStorageModeChange('database')}>
              <Text style={[
                styles.modeButtonText,
                storageMode === 'database' && styles.modeButtonTextActiveDb,
              ]}>Database</Text>
            </TouchableOpacity>
          </View>
          {storageMode === 'database' && (
            <TouchableOpacity
              style={[
                styles.configureDbButton,
                isDbConnected && styles.configureDbButtonConnected,
              ]}
              onPress={showConnectionModal}>
              <View
                style={[
                  styles.connectionIndicator,
                  isDbConnected
                    ? styles.connectionIndicatorConnected
                    : styles.connectionIndicatorDisconnected,
                ]}
              />
              <Text style={styles.configureDbButtonText}>
                {isDbConnected ? 'Connected' : 'Configure Database'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
            <Text style={styles.createButtonText}>+ New Plan</Text>
          </TouchableOpacity>
          {storageMode === 'local' && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                Alert.alert(
                  'Reset All Data',
                  'This will delete all your plans and data, and create fresh sample plans. Are you sure?',
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {text: 'Reset', style: 'destructive', onPress: onResetAllData},
                  ],
                );
              }}>
              <Text style={styles.resetButtonText}>Reset Data</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content based on storage mode */}
      {storageMode === 'local' ? (
        // Local storage: show expansion plans
        expansionPlans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No expansion plans yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first plan to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={expansionPlans}
            keyExtractor={item => item.id}
            renderItem={renderPlanItem}
            contentContainerStyle={styles.list}
          />
        )
      ) : (
        // Database mode: show database scenarios as plans
        scenarios.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No expansion plans yet</Text>
            <Text style={styles.emptySubtext}>
              {isUsingMockData
                ? 'Click "Configure Database" to connect'
                : 'No plans found in database'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={scenarios}
            keyExtractor={item => String(item.epScenarioId)}
            renderItem={renderScenarioItem}
            contentContainerStyle={styles.list}
          />
        )
      )}

      {modalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={hideModal}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {copyingPlanId || copyingScenarioId
                  ? 'Copy Expansion Plan'
                  : editingPlan || editingScenarioId
                  ? 'Rename Plan'
                  : 'New Expansion Plan'}
              </Text>
              <TouchableOpacity onPress={hideModal}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Plan Name</Text>
              <TextInput
                style={styles.input}
                value={planName}
                onChangeText={setPlanName}
                placeholder="Enter plan name"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={hideModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {copyingPlanId || copyingScenarioId ? 'Copy' : editingPlan || editingScenarioId ? 'Save' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Database Connection Modal */}
      {connectionModalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={hideConnectionModal}
          />
          <View style={styles.connectionModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Database Connection</Text>
              <TouchableOpacity onPress={hideConnectionModal}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.connectionModalBody}>
              <DatabaseConnectionSection
                onConnectionChange={(connected) => setIsDbConnected(connected)}
              />
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

import { colors } from '../styles/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Database scenario styles
  scenarioDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  regionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  regionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  horizonText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storageModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 6,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  modeButtonActiveDb: {
    backgroundColor: 'rgba(52, 211, 153, 0.3)',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  modeButtonTextActive: {
    color: '#60a5fa',
  },
  modeButtonTextActiveDb: {
    color: '#34d399',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  resetButtonText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  planItem: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  planItemSelected: {
    borderColor: colors.indicator,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text,
  },
  planDetails: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    gap: 4,
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  activeText: {
    color: colors.green,
  },
  inactiveText: {
    color: colors.textTertiary,
  },
  planActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
  },
  actionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteText: {
    color: colors.red,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textQuaternary,
    marginTop: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 0,
    width: 350,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalClose: {
    fontSize: 20,
    color: colors.textTertiary,
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#cbd5e1',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    height: 44,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  cancelButtonText: {
    color: colors.textTertiary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  // Database mode styles
  databaseContent: {
    flex: 1,
  },
  databaseContentContainer: {
    padding: 16,
  },
  connectionSection: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  connectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  connectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  scenariosSection: {
    flex: 1,
  },
  scenariosSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  emptyStateInline: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  // Configure Database button styles
  configureDbButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
  },
  configureDbButtonConnected: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionIndicatorConnected: {
    backgroundColor: colors.green,
  },
  connectionIndicatorDisconnected: {
    backgroundColor: colors.red,
  },
  configureDbButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  // Connection modal styles
  connectionModalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    width: 450,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  connectionModalBody: {
    maxHeight: 500,
  },
});
