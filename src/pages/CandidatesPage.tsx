import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import {Candidate, UnitType, UNIT_TYPES} from '../types';

interface Props {
  candidates: Candidate[];
  selectedPlanId: string | null;
  onCreateCandidate: (candidate: Omit<Candidate, 'id'>) => void;
  onUpdateCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (id: string) => void;
  onModalVisibleChange: (visible: boolean) => void;
}

const defaultFormData = {
  name: '',
  maxCapacity: '',
  unitType: 'Solar' as UnitType,
  startYear: '',
  endYear: '',
  maxAdditionsPerYear: '',
  maxAdditionsOverall: '',
  isRetirement: false,
};

export function CandidatesPage({
  candidates,
  selectedPlanId,
  onCreateCandidate,
  onUpdateCandidate,
  onDeleteCandidate,
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
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  const filteredCandidates = candidates.filter(
    c => c.expansionPlanId === selectedPlanId,
  );

  const openCreateModal = () => {
    if (!selectedPlanId) {
      Alert.alert('No Plan Selected', 'Please select an expansion plan first');
      return;
    }
    setEditingCandidate(null);
    setFormData(defaultFormData);
    showModal();
  };

  const openEditModal = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      maxCapacity: candidate.maxCapacity.toString(),
      unitType: candidate.unitType,
      startYear: candidate.startYear.toString(),
      endYear: candidate.endYear.toString(),
      maxAdditionsPerYear: candidate.maxAdditionsPerYear.toString(),
      maxAdditionsOverall: candidate.maxAdditionsOverall.toString(),
      isRetirement: candidate.isRetirement,
    });
    showModal();
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!formData.maxCapacity || isNaN(Number(formData.maxCapacity))) {
      Alert.alert('Error', 'Valid max capacity is required');
      return;
    }

    const candidateData = {
      expansionPlanId: selectedPlanId!,
      name: formData.name,
      maxCapacity: Number(formData.maxCapacity),
      unitType: formData.unitType,
      startYear: Number(formData.startYear) || 2024,
      endYear: Number(formData.endYear) || 2050,
      maxAdditionsPerYear: Number(formData.maxAdditionsPerYear) || 0,
      maxAdditionsOverall: Number(formData.maxAdditionsOverall) || 0,
      isRetirement: formData.isRetirement,
    };

    if (editingCandidate) {
      onUpdateCandidate({...candidateData, id: editingCandidate.id});
    } else {
      onCreateCandidate(candidateData);
    }
    hideModal();
  };

  const handleDelete = (candidate: Candidate) => {
    Alert.alert(
      'Delete Candidate',
      `Are you sure you want to delete "${candidate.name}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteCandidate(candidate.id),
        },
      ],
    );
  };

  const renderCandidateItem = ({item}: {item: Candidate}) => (
    <View style={styles.candidateItem}>
      <View style={styles.candidateHeader}>
        <Text style={styles.candidateName}>{item.name}</Text>
        {item.isRetirement && (
          <View style={styles.retirementBadge}>
            <Text style={styles.retirementText}>Retirement</Text>
          </View>
        )}
      </View>
      <View style={styles.candidateDetails}>
        <Text style={styles.detailText}>
          {item.unitType} | {item.maxCapacity} MW
        </Text>
        <Text style={styles.detailText}>
          Years: {item.startYear} - {item.endYear}
        </Text>
        <Text style={styles.detailText}>
          Max/Year: {item.maxAdditionsPerYear} | Max Total:{' '}
          {item.maxAdditionsOverall}
        </Text>
      </View>
      <View style={styles.candidateActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!selectedPlanId) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No Expansion Plan Selected</Text>
        <Text style={styles.emptySubtext}>
          Select a plan from the Home tab to manage candidates
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Candidates</Text>
        <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
          <Text style={styles.createButtonText}>+ Add Candidate</Text>
        </TouchableOpacity>
      </View>

      {filteredCandidates.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No candidates yet</Text>
          <Text style={styles.emptySubtext}>
            Add candidate units for this expansion plan
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCandidates}
          keyExtractor={item => item.id}
          renderItem={renderCandidateItem}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCandidate ? 'Edit Candidate' : 'New Candidate'}
            </Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={text => setFormData({...formData, name: text})}
              placeholder="Enter candidate name"
            />

            <Text style={styles.label}>Unit Type</Text>
            <View style={styles.optionsRow}>
              {UNIT_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    formData.unitType === type && styles.optionSelected,
                  ]}
                  onPress={() => setFormData({...formData, unitType: type})}>
                  <Text
                    style={[
                      styles.optionText,
                      formData.unitType === type && styles.optionTextSelected,
                    ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Max Capacity (MW)</Text>
            <TextInput
              style={styles.input}
              value={formData.maxCapacity}
              onChangeText={text => setFormData({...formData, maxCapacity: text})}
              placeholder="Enter max capacity"
              keyboardType="numeric"
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Start Year</Text>
                <TextInput
                  style={styles.input}
                  value={formData.startYear}
                  onChangeText={text =>
                    setFormData({...formData, startYear: text})
                  }
                  placeholder="2024"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>End Year</Text>
                <TextInput
                  style={styles.input}
                  value={formData.endYear}
                  onChangeText={text => setFormData({...formData, endYear: text})}
                  placeholder="2050"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Max Additions/Year</Text>
                <TextInput
                  style={styles.input}
                  value={formData.maxAdditionsPerYear}
                  onChangeText={text =>
                    setFormData({...formData, maxAdditionsPerYear: text})
                  }
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Max Additions Total</Text>
                <TextInput
                  style={styles.input}
                  value={formData.maxAdditionsOverall}
                  onChangeText={text =>
                    setFormData({...formData, maxAdditionsOverall: text})
                  }
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Is Retirement</Text>
              <Switch
                value={formData.isRetirement}
                onValueChange={value =>
                  setFormData({...formData, isRetirement: value})
                }
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
                  {editingCandidate ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  candidateItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: '600',
  },
  retirementBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  retirementText: {
    fontSize: 12,
    color: '#e65100',
  },
  candidateDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  candidateActions: {
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
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 450,
    maxHeight: '90%',
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
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
