import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {ExpansionPlan} from '../types';

interface Props {
  expansionPlans: ExpansionPlan[];
  selectedPlanId: string | null;
  onSelectPlan: (id: string) => void;
  onCreatePlan: (name: string) => void;
  onUpdatePlan: (plan: ExpansionPlan) => void;
  onDeletePlan: (id: string) => void;
  onCopyPlan: (id: string, newName: string) => void;
  onModalVisibleChange: (visible: boolean) => void;
}

export function HomePage({
  expansionPlans,
  selectedPlanId,
  onSelectPlan,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
  onCopyPlan,
  onModalVisibleChange,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const containerRef = useRef<View>(null);

  const showModal = () => {
    setModalVisible(true);
    onModalVisibleChange(true);
  };

  const hideModal = useCallback(() => {
    setModalVisible(false);
    onModalVisibleChange(false);
  }, [onModalVisibleChange]);

  // Handle escape key
  const handleKeyDown = useCallback((e: any) => {
    const key = e.nativeEvent?.key || e.key;
    if (key === 'Escape' && modalVisible) {
      hideModal();
    }
  }, [modalVisible, hideModal]);

  // Focus container when modal opens
  useEffect(() => {
    if (modalVisible && containerRef.current) {
      // @ts-ignore
      containerRef.current.focus?.();
    }
  }, [modalVisible]);
  const [editingPlan, setEditingPlan] = useState<ExpansionPlan | null>(null);
  const [copyingPlanId, setCopyingPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');

  const openCreateModal = () => {
    setEditingPlan(null);
    setCopyingPlanId(null);
    setPlanName('');
    showModal();
  };

  const openEditModal = (plan: ExpansionPlan) => {
    setEditingPlan(plan);
    setCopyingPlanId(null);
    setPlanName(plan.name);
    showModal();
  };

  const openCopyModal = (plan: ExpansionPlan) => {
    setEditingPlan(null);
    setCopyingPlanId(plan.id);
    setPlanName('');
    showModal();
  };

  const handleSave = () => {
    if (!planName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (copyingPlanId) {
      onCopyPlan(copyingPlanId, planName);
    } else if (editingPlan) {
      onUpdatePlan({...editingPlan, name: planName});
    } else {
      onCreatePlan(planName);
    }
    hideModal();
    setCopyingPlanId(null);
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

  return (
    <View
      ref={containerRef}
      style={styles.container}
      // @ts-ignore - keyboard events for RN Windows
      onKeyDown={modalVisible ? handleKeyDown : undefined}
      onKeyUp={modalVisible ? handleKeyDown : undefined}
      focusable={modalVisible}>
      <View style={styles.header}>
        <Text style={styles.title}>Expansion Plans</Text>
        <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
          <Text style={styles.createButtonText}>+ New Plan</Text>
        </TouchableOpacity>
      </View>

      {expansionPlans.length === 0 ? (
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
                {copyingPlanId
                  ? 'Copy Expansion Plan'
                  : editingPlan
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
                  {copyingPlanId ? 'Copy' : editingPlan ? 'Save' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
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
});
