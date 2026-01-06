import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import {
  ExpansionPlan,
  ExpansionPlanSettings,
  Region,
  SolverType,
  SolutionCriterion,
  WeatherYearSelection,
  LoadUncertainty,
  Study,
  ConstraintVariableType,
  EscalationVariableType,
  REGIONS,
  SOLVER_TYPES,
  SOLUTION_CRITERIA,
  WEATHER_YEAR_SELECTIONS,
  LOAD_UNCERTAINTIES,
  DEFAULT_SETTINGS,
  SAMPLE_STUDIES,
  CONSTRAINT_VARIABLE_TYPES,
  ESCALATION_VARIABLE_TYPES,
  Constraint,
  EscalationInput,
} from '../types';

// Get screen dimensions dynamically to handle window resize/maximize
const getScreenDimensions = () => Dimensions.get('window');

interface Props {
  selectedPlan: ExpansionPlan | null;
  expansionPlans: ExpansionPlan[];
  onSelectPlan: (id: string) => void;
  onUpdatePlan: (plan: ExpansionPlan) => void;
  onSaveAll: () => void;
  onModalVisibleChange: (visible: boolean) => void;
}

// Dropdown state type for centralized modal
interface DropdownState {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  renderOption?: (option: string) => string;
  positionY: number;
  positionX: number;
}

const initialDropdownState: DropdownState = {
  visible: false,
  title: '',
  options: [],
  selectedValue: '',
  onSelect: () => {},
  positionY: 0,
  positionX: 0,
};

import { colors } from '../styles/colors';
import {SelectField} from '../components/common/SelectField';
import {InputField} from '../components/common/InputField';
import {Checkbox} from '../components/common/Checkbox';

// Main Settings Page Component
export function SettingsPage({selectedPlan, expansionPlans, onSelectPlan, onUpdatePlan, onSaveAll, onModalVisibleChange}: Props) {
  const [activeDataTab, setActiveDataTab] = useState<'constraints' | 'escalation'>('constraints');
  const [dropdown, setDropdown] = useState<DropdownState>(initialDropdownState);
  const [scrollOffset, setScrollOffset] = useState(0);
  const dropdownListRef = useRef<ScrollView>(null);
  const [containerDimensions, setContainerDimensions] = useState({width: 800, height: 600});

  // Ref for keyboard handler
  const keyboardHandlerRef = useRef<View>(null);

  // Form state
  const [sourceStudyId, setSourceStudyId] = useState('');
  const [region, setRegion] = useState<Region>('ERCOT');
  const [settings, setSettings] = useState<ExpansionPlanSettings>(DEFAULT_SETTINGS);

  // Constraint modal state
  const [showConstraintModal, setShowConstraintModal] = useState(false);
  const [constraintForm, setConstraintForm] = useState({
    variable: 'LOLE Capacity' as ConstraintVariableType,
    year: '2025',
    limit: '0.0',
    exceedanceThreshold: '0',
  });
  const [selectedConstraintIds, setSelectedConstraintIds] = useState<string[]>([]);

  // Escalation modal state
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationForm, setEscalationForm] = useState({
    variable: 'Fixed Carrying Cost' as EscalationVariableType,
    rate: '0',
  });
  const [selectedEscalationIds, setSelectedEscalationIds] = useState<string[]>([]);

  const closeDropdown = useCallback(() => {
    setDropdown(initialDropdownState);
    onModalVisibleChange(false);
  }, [onModalVisibleChange]);

  const closeConstraintModal = useCallback(() => {
    setShowConstraintModal(false);
    onModalVisibleChange(false);
  }, [onModalVisibleChange]);

  const closeEscalationModal = useCallback(() => {
    setShowEscalationModal(false);
    onModalVisibleChange(false);
  }, [onModalVisibleChange]);

  // Initialize form when selectedPlan changes
  useEffect(() => {
    if (selectedPlan) {
      setSourceStudyId(selectedPlan.sourceStudyId);
      setRegion(selectedPlan.region);
      setSettings(selectedPlan.settings);
    }
  }, [selectedPlan]);

  // Unified escape key handler
  const handleKeyDown = useCallback((e: any) => {
    const key = e.nativeEvent?.key || e.key;
    if (key === 'Escape') {
      if (dropdown.visible) {
        closeDropdown();
      } else if (showConstraintModal) {
        closeConstraintModal();
      } else if (showEscalationModal) {
        closeEscalationModal();
      }
    }
  }, [dropdown.visible, showConstraintModal, showEscalationModal, closeDropdown, closeConstraintModal, closeEscalationModal]);

  // Focus keyboard handler when any modal opens
  const anyModalOpen = dropdown.visible || showConstraintModal || showEscalationModal;
  useEffect(() => {
    if (anyModalOpen && keyboardHandlerRef.current) {
      // @ts-ignore
      keyboardHandlerRef.current.focus?.();
    }
  }, [anyModalOpen]);

  const selectedStudy = SAMPLE_STUDIES.find(s => s.id === sourceStudyId);

  const onContainerLayout = useCallback((event: any) => {
    const {width, height} = event.nativeEvent.layout;
    setContainerDimensions({width, height});
  }, []);

  const openDropdown = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    renderOption?: (option: string) => string,
    event?: {nativeEvent: {pageX: number; pageY: number}}
  ) => {
    const posX = event?.nativeEvent?.pageX || containerDimensions.width / 2;
    const posY = event?.nativeEvent?.pageY || 200;
    setDropdown({visible: true, title, options, selectedValue, onSelect, renderOption, positionX: posX, positionY: posY});
    onModalVisibleChange(true);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  if (!selectedPlan) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No Plan Selected</Text>
          <Text style={styles.emptySubtext}>Select a plan from the Home tab</Text>
        </View>
      </View>
    );
  }

  const updateSettings = <K extends keyof ExpansionPlanSettings>(
    key: K,
    value: ExpansionPlanSettings[K]
  ) => {
    const newSettings = {...settings, [key]: value};
    setSettings(newSettings);
    // Auto-save to parent immediately to persist across tab switches
    const study = SAMPLE_STUDIES.find(s => s.id === sourceStudyId);
    onUpdatePlan({
      ...selectedPlan,
      sourceStudyId,
      planningHorizonStart: study?.startYear || selectedPlan.planningHorizonStart,
      planningHorizonEnd: study?.endYear || selectedPlan.planningHorizonEnd,
      region,
      settings: newSettings,
    });
  };

  const handleSave = () => {
    const study = SAMPLE_STUDIES.find(s => s.id === sourceStudyId);
    onUpdatePlan({
      ...selectedPlan,
      sourceStudyId,
      planningHorizonStart: study?.startYear || 2025,
      planningHorizonEnd: study?.endYear || 2045,
      region,
      settings,
    });
  };

  const handleCancel = () => {
    if (selectedPlan) {
      setSourceStudyId(selectedPlan.sourceStudyId);
      setRegion(selectedPlan.region);
      setSettings(selectedPlan.settings);
    }
  };

  const getStudyName = (studyId: string) => {
    const study = SAMPLE_STUDIES.find(s => s.id === studyId);
    return study?.name || 'Select a study...';
  };

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const openConstraintModal = () => {
    setConstraintForm({
      variable: 'LOLE Capacity',
      year: '2025',
      limit: '0.0',
      exceedanceThreshold: '0',
    });
    setShowConstraintModal(true);
    onModalVisibleChange(true);
  };

  const handleAddConstraint = () => {
    const nextPriority = settings.constraints.length + 1;
    const newConstraint: Constraint = {
      id: generateId(),
      variable: constraintForm.variable,
      year: parseInt(constraintForm.year, 10) || 2025,
      limit: constraintForm.limit,
      exceedanceThreshold: constraintForm.exceedanceThreshold,
      priority: nextPriority,
    };
    updateSettings('constraints', [...settings.constraints, newConstraint]);
    closeConstraintModal();
  };

  const handleDeleteConstraints = () => {
    if (selectedConstraintIds.length === 0) return;
    const remainingConstraints = settings.constraints
      .filter(c => !selectedConstraintIds.includes(c.id))
      .map((c, index) => ({...c, priority: index + 1})); // Re-assign priorities
    updateSettings('constraints', remainingConstraints);
    setSelectedConstraintIds([]);
  };

  const toggleConstraintSelection = (id: string) => {
    setSelectedConstraintIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  // Escalation modal handlers
  const openEscalationModal = () => {
    setEscalationForm({
      variable: 'Fixed Carrying Cost',
      rate: '0',
    });
    setShowEscalationModal(true);
    onModalVisibleChange(true);
  };

  const handleAddEscalation = () => {
    const newEscalation: EscalationInput = {
      id: generateId(),
      variable: escalationForm.variable || 'Fixed Carrying Cost',
      rate: parseFloat(escalationForm.rate) || 0,
    };
    updateSettings('escalationInputs', [...settings.escalationInputs, newEscalation]);
    closeEscalationModal();
  };

  const handleDeleteEscalations = () => {
    if (selectedEscalationIds.length === 0) return;
    const remainingEscalations = settings.escalationInputs
      .filter(e => !selectedEscalationIds.includes(e.id));
    updateSettings('escalationInputs', remainingEscalations);
    setSelectedEscalationIds([]);
  };

  const toggleEscalationSelection = (id: string) => {
    setSelectedEscalationIds(prev =>
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
  };

  // Clipboard import/export handlers
  const handleExportConstraints = () => {
    try {
      const data = JSON.stringify(settings.constraints, null, 2);
      Clipboard.setString(data);
      Alert.alert('Success', 'Constraints exported to clipboard!');
    } catch (err) {
      Alert.alert('Error', 'Failed to export to clipboard');
      console.error('Export error:', err);
    }
  };

  const handleImportConstraints = async () => {
    try {
      const text = await Clipboard.getString();
      if (!text) {
        Alert.alert('Error', 'Clipboard is empty.');
        return;
      }
      const imported = JSON.parse(text) as Constraint[];
      if (Array.isArray(imported)) {
        const newConstraints = imported.map((c, index) => ({
          ...c,
          id: generateId(),
          priority: settings.constraints.length + index + 1,
        }));
        updateSettings('constraints', [...settings.constraints, ...newConstraints]);
        Alert.alert('Success', `Imported ${newConstraints.length} constraints!`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to import from clipboard. Make sure clipboard contains valid JSON.');
    }
  };

  const handleExportEscalations = () => {
    try {
      const data = JSON.stringify(settings.escalationInputs, null, 2);
      Clipboard.setString(data);
      Alert.alert('Success', 'Escalation inputs exported to clipboard!');
    } catch (err) {
      Alert.alert('Error', 'Failed to export to clipboard');
      console.error('Export error:', err);
    }
  };

  const handleImportEscalations = async () => {
    try {
      const text = await Clipboard.getString();
      if (!text) {
        Alert.alert('Error', 'Clipboard is empty.');
        return;
      }
      const imported = JSON.parse(text) as EscalationInput[];
      if (Array.isArray(imported)) {
        const newEscalations = imported.map(e => ({
          ...e,
          id: generateId(),
        }));
        updateSettings('escalationInputs', [...settings.escalationInputs, ...newEscalations]);
        Alert.alert('Success', `Imported ${newEscalations.length} escalation inputs!`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to import from clipboard. Make sure clipboard contains valid JSON.');
    }
  };

  return (
    <View
      ref={keyboardHandlerRef}
      style={styles.container}
      onLayout={onContainerLayout}
      // @ts-ignore - keyboard events for RN Windows
      onKeyDown={anyModalOpen ? handleKeyDown : undefined}
      onKeyUp={anyModalOpen ? handleKeyDown : undefined}
      focusable={anyModalOpen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Simulation Setup</Text>
        <Text style={styles.headerSubtitle}>Configure expansion plan parameters and solver settings</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Study Configuration Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>▼</Text>
            <Text style={styles.sectionTitle}>STUDY CONFIGURATION</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.row}>
              <View style={styles.col}>
                <SelectField
                  label="EXPANSION PLAN"
                  value={selectedPlan.name}
                  onPress={(e) => openDropdown(
                    'Select Expansion Plan',
                    expansionPlans.map(p => p.id),
                    selectedPlan.id,
                    (id) => {
                      onSelectPlan(id);
                      closeDropdown();
                    },
                    (id) => expansionPlans.find(p => p.id === id)?.name || id,
                    e
                  )}
                />
              </View>
              <View style={styles.colSmall}>
                <Text style={styles.label}>PLANNING HORIZON</Text>
                <View style={styles.horizonRow}>
                  <View style={[styles.horizonInput, styles.horizonInputDisabled]}>
                    <Text style={styles.horizonText}>
                      {selectedStudy?.startYear || '—'}
                    </Text>
                  </View>
                  <Text style={styles.horizonSeparator}>–</Text>
                  <View style={[styles.horizonInput, styles.horizonInputDisabled]}>
                    <Text style={styles.horizonText}>
                      {selectedStudy?.endYear || '—'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <SelectField
                  label="SOURCE STUDY"
                  value={sourceStudyId}
                  displayValue={getStudyName(sourceStudyId)}
                  onPress={(e) => openDropdown(
                    'Select Source Study',
                    SAMPLE_STUDIES.map(s => s.id),
                    sourceStudyId,
                    (id) => {
                      setSourceStudyId(id);
                      const study = SAMPLE_STUDIES.find(s => s.id === id);
                      if (study && study.regions.length === 1) {
                        setRegion(study.regions[0]);
                      }
                      closeDropdown();
                    },
                    (id) => SAMPLE_STUDIES.find(s => s.id === id)?.name || id,
                    e
                  )}
                />
              </View>
              <View style={styles.col}>
                <SelectField
                  label="REGION"
                  value={region}
                  disabled={!sourceStudyId}
                  displayValue={sourceStudyId ? region : 'Select a source study first'}
                  onPress={(e) => sourceStudyId && openDropdown(
                    'Select Region',
                    selectedStudy?.regions || [...REGIONS],
                    region,
                    (r) => {
                      setRegion(r as Region);
                      closeDropdown();
                    },
                    undefined,
                    e
                  )}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>▼</Text>
            <Text style={styles.sectionTitle}>SETTINGS</Text>
          </View>
          <View style={styles.twoColumnLayout}>
            {/* General Column */}
            <View style={styles.settingsColumn}>
              <Text style={styles.columnTitle}>General</Text>
              <InputField
                label="UNIT CATEGORY/MODIFIER SUFFIX"
                value={settings.unitNameAccountCenter}
                onChangeText={v => updateSettings('unitNameAccountCenter', v)}
                placeholder="Enter suffix..."
              />
              <InputField
                label="SIMULATION YEAR STEP SIZE"
                value={settings.simulationYearStepSize.toString()}
                onChangeText={v => updateSettings('simulationYearStepSize', parseInt(v, 10) || 1)}
                keyboardType="numeric"
              />
              <InputField
                label="BASE YEAR"
                value={settings.baseYear.toString()}
                onChangeText={v => updateSettings('baseYear', parseInt(v, 10) || 2025)}
                keyboardType="numeric"
              />
              <InputField
                label="AUTOMATED RESUBMISSION TIME (MINS)"
                value={settings.automatedResubmissionTime.toString()}
                onChangeText={v => updateSettings('automatedResubmissionTime', parseInt(v, 10) || 0)}
                keyboardType="numeric"
              />
              <InputField
                label="ECONOMIC DISCOUNT RATE (%)"
                value={settings.economicDiscountRate.toString()}
                onChangeText={v => updateSettings('economicDiscountRate', parseFloat(v) || 0)}
                keyboardType="numeric"
              />
              <InputField
                label="RELIABILITY DISCOUNT RATE (%)"
                value={settings.reliabilityDiscountRate.toString()}
                onChangeText={v => updateSettings('reliabilityDiscountRate', parseFloat(v) || 0)}
                keyboardType="numeric"
              />
            </View>

            {/* Solver Configuration Column */}
            <View style={styles.settingsColumn}>
              <Text style={styles.columnTitle}>Solver Configuration</Text>
              <SelectField
                label="SOLVER TYPE"
                value={settings.solverType}
                onPress={(e) => openDropdown(
                  'Select Solver Type',
                  [...SOLVER_TYPES],
                  settings.solverType,
                  (v) => {
                    updateSettings('solverType', v as SolverType);
                    closeDropdown();
                  },
                  undefined,
                  e
                )}
              />
              <SelectField
                label="SOLUTION CRITERION"
                value={settings.solutionCriterion}
                onPress={(e) => openDropdown(
                  'Select Solution Criterion',
                  [...SOLUTION_CRITERIA],
                  settings.solutionCriterion,
                  (v) => {
                    updateSettings('solutionCriterion', v as SolutionCriterion);
                    closeDropdown();
                  },
                  undefined,
                  e
                )}
              />
              
              <Text style={{...styles.label, marginTop: 16}}>ITERATIONS</Text>
              <View style={styles.row}>
                <View style={styles.col}>
                  <InputField
                    label="PROMPT YEAR"
                    value={settings.iterationsPromptYear.toString()}
                    onChangeText={v => updateSettings('iterationsPromptYear', parseInt(v, 10) || 1)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.col}>
                  <InputField
                    label="FUTURE YEAR"
                    value={settings.iterationsFutureYear.toString()}
                    onChangeText={v => updateSettings('iterationsFutureYear', parseInt(v, 10) || 5)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <SelectField
                label="WEATHER YEAR SELECTION"
                value={settings.weatherYearSelection}
                onPress={(e) => openDropdown(
                  'Select Weather Year',
                  [...WEATHER_YEAR_SELECTIONS],
                  settings.weatherYearSelection,
                  (v) => {
                    updateSettings('weatherYearSelection', v as WeatherYearSelection);
                    closeDropdown();
                  },
                  undefined,
                  e
                )}
              />
              <SelectField
                label="LOAD UNCERTAINTY"
                value={settings.loadUncertainty}
                onPress={(e) => openDropdown(
                  'Select Load Uncertainty',
                  [...LOAD_UNCERTAINTIES],
                  settings.loadUncertainty,
                  (v) => {
                    updateSettings('loadUncertainty', v as LoadUncertainty);
                    closeDropdown();
                  },
                  undefined,
                  e
                )}
              />
              <View style={styles.checkboxGroup}>
                <Checkbox
                  label="Include Outages"
                  value={settings.includeOutages}
                  onValueChange={v => updateSettings('includeOutages', v)}
                />
                <Checkbox
                  label="Auto-export results after EP build cycle"
                  value={settings.autoExportResults}
                  onValueChange={v => updateSettings('autoExportResults', v)}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Constraints and Escalation Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>▼</Text>
            <Text style={styles.sectionTitle}>CONSTRAINTS AND ESCALATION INPUTS</Text>
          </View>

          <View style={styles.dataTabsRow}>
            <View style={styles.dataTabs}>
              <TouchableOpacity
                style={[styles.dataTab, activeDataTab === 'constraints' && styles.dataTabActive]}
                onPress={() => setActiveDataTab('constraints')}
                activeOpacity={0.7}
                // @ts-ignore
                focusable={false}>
                <Text style={[styles.dataTabText, activeDataTab === 'constraints' && styles.dataTabTextActive]}>
                  Constraints
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dataTab, activeDataTab === 'escalation' && styles.dataTabActive]}
                onPress={() => setActiveDataTab('escalation')}
                activeOpacity={0.7}
                // @ts-ignore
                focusable={false}>
                <Text style={[styles.dataTabText, activeDataTab === 'escalation' && styles.dataTabTextActive]}>
                  Escalation Inputs
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tableActions}>
              <TouchableOpacity
                style={styles.tableActionBtn}
                onPress={activeDataTab === 'constraints' ? openConstraintModal : openEscalationModal}>
                <Text style={styles.tableActionText}>+ Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tableActionBtn,
                  ((activeDataTab === 'constraints' && selectedConstraintIds.length === 0) ||
                   (activeDataTab === 'escalation' && selectedEscalationIds.length === 0)) &&
                  styles.tableActionBtnDisabled
                ]}
                onPress={activeDataTab === 'constraints' ? handleDeleteConstraints : handleDeleteEscalations}>
                <Text style={styles.tableActionText}>Remove</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tableActionBtn}
                onPress={activeDataTab === 'constraints' ? handleImportConstraints : handleImportEscalations}>
                <Text style={styles.tableActionText}>Import</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tableActionBtn}
                onPress={activeDataTab === 'constraints' ? handleExportConstraints : handleExportEscalations}>
                <Text style={styles.tableActionText}>Export</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.tableContainer}>
            {activeDataTab === 'constraints' ? (
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, {width: 30}]}></Text>
                  <Text style={[styles.tableHeaderCell, {flex: 2}]}>CONSTRAINT VARIABLE</Text>
                  <Text style={styles.tableHeaderCell}>YEAR</Text>
                  <Text style={styles.tableHeaderCell}>LIMIT</Text>
                  <Text style={[styles.tableHeaderCell, {flex: 1.5}]}>THRESHOLD (%)</Text>
                  <Text style={styles.tableHeaderCell}>PRIORITY</Text>
                </View>
                {settings.constraints.length === 0 ? (
                  <View style={styles.emptyTable}>
                    <Text style={styles.emptyTableText}>No constraints defined. Click "+ Add" to create one.</Text>
                  </View>
                ) : (
                  settings.constraints.map((c: Constraint) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.tableRow, selectedConstraintIds.includes(c.id) && styles.tableRowSelected]}
                      onPress={() => toggleConstraintSelection(c.id)}>
                      <View style={[styles.tableCell, {width: 30, paddingHorizontal: 4}]}>
                        <View style={[styles.tableCheckbox, selectedConstraintIds.includes(c.id) && styles.tableCheckboxChecked]}>
                          {selectedConstraintIds.includes(c.id) && <Text style={styles.tableCheckmark}>✓</Text>}
                        </View>
                      </View>
                      <Text style={[styles.tableCell, {flex: 2}]}>{c.variable}</Text>
                      <Text style={styles.tableCell}>{c.year}</Text>
                      <Text style={styles.tableCell}>{c.limit}</Text>
                      <Text style={[styles.tableCell, {flex: 1.5}]}>{c.exceedanceThreshold}</Text>
                      <Text style={styles.tableCell}>{c.priority}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            ) : (
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, {width: 30}]}></Text>
                  <Text style={[styles.tableHeaderCell, {flex: 2}]}>VARIABLE</Text>
                  <Text style={styles.tableHeaderCell}>RATE (%)</Text>
                </View>
                {settings.escalationInputs.length === 0 ? (
                  <View style={styles.emptyTable}>
                    <Text style={styles.emptyTableText}>No escalation inputs defined. Click "+ Add" to create one.</Text>
                  </View>
                ) : (
                  settings.escalationInputs.map((e: EscalationInput) => (
                    <TouchableOpacity
                      key={e.id}
                      style={[styles.tableRow, selectedEscalationIds.includes(e.id) && styles.tableRowSelected]}
                      onPress={() => toggleEscalationSelection(e.id)}>
                      <View style={[styles.tableCell, {width: 30, paddingHorizontal: 4}]}>
                        <View style={[styles.tableCheckbox, selectedEscalationIds.includes(e.id) && styles.tableCheckboxChecked]}>
                          {selectedEscalationIds.includes(e.id) && <Text style={styles.tableCheckmark}>✓</Text>}
                        </View>
                      </View>
                      <Text style={[styles.tableCell, {flex: 2}]}>{e.variable}</Text>
                      <Text style={styles.tableCell}>{e.rate}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.footerRight}>
          <TouchableOpacity style={styles.saveButton} onPress={onSaveAll}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.runButton} onPress={handleSave}>
            <Text style={styles.runButtonText}>Run Simulation</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Centralized Dropdown Modal - renders on top of everything */}
      {dropdown.visible && (
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            activeOpacity={1}
            onPress={closeDropdown}
          />
          <View style={[
            styles.dropdownModal,
            {
              position: 'absolute',
              top: Math.min(dropdown.positionY, containerDimensions.height - 300),
              left: Math.max(20, Math.min(dropdown.positionX - 150, containerDimensions.width - 320)),
            }
          ]}>
            <ScrollView
              ref={dropdownListRef}
              style={styles.dropdownScroll}
              bounces={false}
              keyboardShouldPersistTaps="handled"
            >
              {dropdown.options.map((option) => {
                const displayText = dropdown.renderOption ? dropdown.renderOption(option) : option;
                const isSelected = option === dropdown.selectedValue;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.dropdownOption, isSelected && styles.dropdownOptionSelected]}
                    onPress={() => dropdown.onSelect(option)}
                  >
                    <Text style={[styles.dropdownOptionText, isSelected && styles.dropdownOptionTextSelected]}>
                      {displayText}
                    </Text>
                    {isSelected && <Text style={styles.dropdownCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Add Constraint Modal */}
      {showConstraintModal && (
        <View style={styles.constraintModalOverlay}>
          <TouchableOpacity
            style={styles.constraintModalBackdrop}
            activeOpacity={1}
            onPress={closeConstraintModal}
          />
          <View style={styles.constraintModal}>
            <View style={styles.constraintModalHeader}>
              <Text style={styles.constraintModalTitle}>Add Constraint</Text>
              <TouchableOpacity onPress={closeConstraintModal}>
                <Text style={styles.constraintModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.constraintModalBody}>
              <View style={styles.constraintFormField}>
                <Text style={styles.constraintFormLabel}>CONSTRAINT VARIABLE</Text>
                <View style={styles.constraintFormSelect}>
                  {CONSTRAINT_VARIABLE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.constraintTypeOption,
                        constraintForm.variable === type && styles.constraintTypeOptionSelected,
                      ]}
                      onPress={() => setConstraintForm(prev => ({...prev, variable: type}))}>
                      <Text style={[
                        styles.constraintTypeText,
                        constraintForm.variable === type && styles.constraintTypeTextSelected,
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.constraintFormRow}>
                <View style={styles.constraintFormFieldHalf}>
                  <Text style={styles.constraintFormLabel}>YEAR</Text>
                  <TextInput
                    style={styles.constraintFormInput}
                    value={constraintForm.year}
                    onChangeText={(v) => setConstraintForm(prev => ({...prev, year: v}))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.constraintFormFieldHalf}>
                  <Text style={styles.constraintFormLabel}>LIMIT</Text>
                  <TextInput
                    style={styles.constraintFormInput}
                    value={constraintForm.limit}
                    onChangeText={(v) => setConstraintForm(prev => ({...prev, limit: v}))}
                  />
                </View>
              </View>
              <View style={styles.constraintFormField}>
                <Text style={styles.constraintFormLabel}>EXCEEDANCE THRESHOLD (%)</Text>
                <TextInput
                  style={styles.constraintFormInput}
                  value={constraintForm.exceedanceThreshold}
                  onChangeText={(v) => setConstraintForm(prev => ({...prev, exceedanceThreshold: v}))}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.constraintPriorityNote}>
                Priority will be automatically assigned: {settings.constraints.length + 1}
              </Text>
            </View>
            <View style={styles.constraintModalFooter}>
              <TouchableOpacity style={styles.constraintCancelBtn} onPress={closeConstraintModal}>
                <Text style={styles.constraintCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.constraintAddBtn} onPress={handleAddConstraint}>
                <Text style={styles.constraintAddText}>Add Constraint</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Add Escalation Modal */}
      {showEscalationModal && (
        <View style={styles.constraintModalOverlay}>
          <TouchableOpacity
            style={styles.constraintModalBackdrop}
            activeOpacity={1}
            onPress={closeEscalationModal}
          />
          <View style={styles.constraintModal}>
            <View style={styles.constraintModalHeader}>
              <Text style={styles.constraintModalTitle}>Add Escalation Input</Text>
              <TouchableOpacity onPress={closeEscalationModal}>
                <Text style={styles.constraintModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.constraintModalBody}>
              <View style={styles.constraintFormField}>
                <Text style={styles.constraintFormLabel}>ESCALATING VARIABLE</Text>
                <View style={styles.constraintFormSelect}>
                  {ESCALATION_VARIABLE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.constraintTypeOption,
                        escalationForm.variable === type && styles.constraintTypeOptionSelected,
                      ]}
                      onPress={() => setEscalationForm(prev => ({...prev, variable: type}))}>
                      <Text style={[
                        styles.constraintTypeText,
                        escalationForm.variable === type && styles.constraintTypeTextSelected,
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.constraintFormField}>
                <Text style={styles.constraintFormLabel}>RATE (%)</Text>
                <TextInput
                  style={styles.constraintFormInput}
                  value={escalationForm.rate}
                  onChangeText={(v) => setEscalationForm(prev => ({...prev, rate: v}))}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.constraintModalFooter}>
              <TouchableOpacity style={styles.constraintCancelBtn} onPress={closeEscalationModal}>
                <Text style={styles.constraintCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.constraintAddBtn} onPress={handleAddEscalation}>
                <Text style={styles.constraintAddText}>Add Escalation</Text>
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
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.backgroundDark,
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  sectionIcon: {
    fontSize: 10,
    color: colors.blue,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.blue,
    letterSpacing: 0.5,
  },
  sectionContent: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  col: {
    flex: 1,
  },
  colSmall: {
    flex: 0.6,
  },
  horizonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizonInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 4,
    padding: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizonInputDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  horizonText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  horizonSeparator: {
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.textQuaternary,
  },
  twoColumnLayout: {
    flexDirection: 'row',
    gap: 32,
    padding: 16,
  },
  settingsColumn: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.blue,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.indicator,
  },
  checkboxGroup: {
    marginTop: 8,
  },
  dataTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dataTabs: {
    flexDirection: 'row',
  },
  dataTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 4,
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  dataTabActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: colors.indicator,
  },
  dataTabText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  dataTabTextActive: {
    color: colors.blue,
    fontWeight: '600',
  },
  tableActions: {
    flexDirection: 'row',
    gap: 8,
  },
  tableActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  tableActionText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tableContainer: {
    borderTopWidth: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 10,
    fontSize: 11,
    fontWeight: '600',
    color: colors.blue,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.3)',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    fontSize: 13,
    color: '#cbd5e1',
  },
  emptyTable: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTableText: {
    color: colors.textQuaternary,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  cancelButtonText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  saveButtonText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  runButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  runButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
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
  // Dropdown Modal Styles
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.transparent,
  },
  dropdownModal: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 4,
    minWidth: 280,
    maxWidth: 400,
    maxHeight: 250,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownOptionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  dropdownOptionTextSelected: {
    color: colors.blue,
    fontWeight: '500',
  },
  dropdownCheck: {
    fontSize: 14,
    color: colors.blue,
    marginLeft: 8,
  },
  // Table selection styles
  tableRowSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  tableCheckbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  tableCheckboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tableCheckmark: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableActionBtnDisabled: {
    opacity: 0.5,
  },
  // Constraint Modal Styles
  constraintModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1001,
    justifyContent: 'center',
    alignItems: 'center',
  },
  constraintModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  constraintModal: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 8,
    width: 480,
    maxHeight: 520,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  constraintModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  constraintModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  constraintModalClose: {
    fontSize: 20,
    color: colors.textQuaternary,
    padding: 4,
  },
  constraintModalBody: {
    padding: 20,
  },
  constraintFormField: {
    marginBottom: 16,
  },
  constraintFormRow: {
    flexDirection: 'row',
    gap: 16,
  },
  constraintFormFieldHalf: {
    flex: 1,
    marginBottom: 16,
  },
  constraintFormLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  constraintFormInput: {
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    color: colors.text,
  },
  constraintFormSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  constraintTypeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  constraintTypeOptionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: colors.indicator,
  },
  constraintTypeText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  constraintTypeTextSelected: {
    color: colors.blue,
    fontWeight: '500',
  },
  constraintPriorityNote: {
    fontSize: 12,
    color: colors.textQuaternary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  constraintModalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  constraintCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  constraintCancelText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  constraintAddBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  constraintAddText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
