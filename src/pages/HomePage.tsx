import React, {useState} from 'react';
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

  const showModal = () => {
    setModalVisible(true);
    onModalVisibleChange(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    onModalVisibleChange(false);
  };
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
    <View style={styles.container}>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {copyingPlanId
                ? 'Copy Expansion Plan'
                : editingPlan
                ? 'Rename Plan'
                : 'New Expansion Plan'}
            </Text>

            <Text style={styles.label}>Plan Name</Text>
            <TextInput
              style={styles.input}
              value={planName}
              onChangeText={setPlanName}
              placeholder="Enter plan name"
            />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  planItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planItemSelected: {
    borderColor: '#007AFF',
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
  },
  planDetails: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  activeBadge: {
    backgroundColor: '#e8f5e9',
  },
  inactiveBadge: {
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#2e7d32',
  },
  inactiveText: {
    color: '#666',
  },
  planActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  actionText: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteText: {
    color: '#d32f2f',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    height: 44,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
