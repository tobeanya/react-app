import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  LayoutChangeEvent,
} from 'react-native';
import {
  GenerationCandidate,
  TransmissionCandidate,
  Region,
  Month,
  MONTHS,
  REGIONS,
} from '../types';

interface Props {
  generationCandidates: GenerationCandidate[];
  transmissionCandidates: TransmissionCandidate[];
  selectedPlanId: string | null;
  availableRegions: Region[];
  onCreateGenerationCandidate: (candidate: Omit<GenerationCandidate, 'id'>) => void;
  onUpdateGenerationCandidate: (candidate: GenerationCandidate) => void;
  onDeleteGenerationCandidates: (ids: string[]) => void;
  onCreateTransmissionCandidate: (candidate: Omit<TransmissionCandidate, 'id'>) => void;
  onUpdateTransmissionCandidate: (candidate: TransmissionCandidate) => void;
  onDeleteTransmissionCandidates: (ids: string[]) => void;
  onModalVisibleChange: (visible: boolean) => void;
}

const defaultGenForm = {
  units: '',
  capacity: '',
  fixedCost: '',
  startMonth: 'Jan' as Month,
  startYear: '2026',
  endYear: '2032',
  maxAdditionsPerYear: '',
  maxAdditionsOverall: '',
  isRetirement: false,
  lifetime: '32',
};

const defaultTransForm = {
  regionA: '' as Region | '',
  regionB: '' as Region | '',
  capacityLimitIn: '',
  capacityLimitOut: '',
  cost: '',
  inflation: '1',
  startYear: '2026',
  endYear: '2032',
  maxAdditionsPerYear: '',
  maxAdditionsOverall: '',
};

// Initial column widths for generation table
const initialGenColumnWidths = {
  checkbox: 40,
  units: 200,
  capacity: 100,
  fixedCost: 100,
  startMonth: 100,
  startYear: 90,
  endYear: 90,
  maxPerYear: 100,
  maxOverall: 110,
  retirement: 100,
  lifetime: 80,
};

// Initial column widths for transmission table
const initialTransColumnWidths = {
  checkbox: 40,
  regionA: 100,
  regionB: 100,
  capacityIn: 120,
  capacityOut: 130,
  cost: 120,
  inflation: 90,
  startYear: 90,
  endYear: 90,
  maxPerYear: 100,
  maxOverall: 110,
};

export function CandidatesPage({
  generationCandidates,
  transmissionCandidates,
  selectedPlanId,
  availableRegions,
  onCreateGenerationCandidate,
  onUpdateGenerationCandidate,
  onDeleteGenerationCandidates,
  onCreateTransmissionCandidate,
  onUpdateTransmissionCandidate,
  onDeleteTransmissionCandidates,
  onModalVisibleChange,
}: Props) {
  const containerRef = useRef<View>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  // Column widths state for resizing
  const [genColWidths, setGenColWidths] = useState(initialGenColumnWidths);
  const [transColWidths, setTransColWidths] = useState(initialTransColumnWidths);
  const [resizing, setResizing] = useState<{table: 'gen' | 'trans'; column: string; startX: number; startWidth: number} | null>(null);

  // Use availableRegions if provided, otherwise fall back to all REGIONS
  const effectiveRegions = availableRegions.length >= 2 ? availableRegions : REGIONS;

  // Selection state
  const [selectedGenIds, setSelectedGenIds] = useState<string[]>([]);
  const [selectedTransIds, setSelectedTransIds] = useState<string[]>([]);

  // Modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [showTransModal, setShowTransModal] = useState(false);
  const [editingGen, setEditingGen] = useState<GenerationCandidate | null>(null);
  const [editingTrans, setEditingTrans] = useState<TransmissionCandidate | null>(null);

  // Form state
  const [genForm, setGenForm] = useState(defaultGenForm);
  const [transForm, setTransForm] = useState(defaultTransForm);

  // Dropdown state
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showRegionADropdown, setShowRegionADropdown] = useState(false);
  const [showRegionBDropdown, setShowRegionBDropdown] = useState(false);

  const anyModalOpen = showGenModal || showTransModal;

  // Filter candidates for selected plan
  const filteredGenCandidates = generationCandidates.filter(
    c => c.expansionPlanId === selectedPlanId,
  );
  const filteredTransCandidates = transmissionCandidates.filter(
    c => c.expansionPlanId === selectedPlanId,
  );

  // Handle container layout change for dynamic sizing
  const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    setContainerWidth(width);
  }, []);

  // Calculate total table width for generation
  const genTableWidth = Object.values(genColWidths).reduce((a, b) => a + b, 0);
  const transTableWidth = Object.values(transColWidths).reduce((a, b) => a + b, 0);

  const closeGenModal = useCallback(() => {
    setShowGenModal(false);
    setEditingGen(null);
    setGenForm(defaultGenForm);
    onModalVisibleChange(false);
  }, [onModalVisibleChange]);

  const closeTransModal = useCallback(() => {
    setShowTransModal(false);
    setEditingTrans(null);
    setTransForm(defaultTransForm);
    onModalVisibleChange(false);
  }, [onModalVisibleChange]);

  // Escape key handler
  const handleKeyDown = useCallback((e: any) => {
    const key = e.nativeEvent?.key || e.key;
    if (key === 'Escape') {
      if (showGenModal) closeGenModal();
      else if (showTransModal) closeTransModal();
    }
  }, [showGenModal, showTransModal, closeGenModal, closeTransModal]);

  useEffect(() => {
    if (anyModalOpen && containerRef.current) {
      // @ts-ignore
      containerRef.current.focus?.();
    }
  }, [anyModalOpen]);

  // Column resize handlers
  const handleResizeStart = (table: 'gen' | 'trans', column: string, startX: number) => {
    const currentWidth = table === 'gen'
      ? genColWidths[column as keyof typeof genColWidths]
      : transColWidths[column as keyof typeof transColWidths];
    setResizing({table, column, startX, startWidth: currentWidth});
  };

  const handleResizeMove = useCallback((pageX: number) => {
    if (!resizing) return;
    const diff = pageX - resizing.startX;
    const newWidth = Math.max(50, resizing.startWidth + diff);

    if (resizing.table === 'gen') {
      setGenColWidths(prev => ({...prev, [resizing.column]: newWidth}));
    } else {
      setTransColWidths(prev => ({...prev, [resizing.column]: newWidth}));
    }
  }, [resizing]);

  const handleResizeEnd = useCallback(() => {
    setResizing(null);
  }, []);

  // Generation Candidate handlers
  const openAddGenModal = () => {
    setEditingGen(null);
    setGenForm(defaultGenForm);
    setShowGenModal(true);
    onModalVisibleChange(true);
  };

  const openEditGenModal = (candidate: GenerationCandidate) => {
    setEditingGen(candidate);
    setGenForm({
      units: candidate.units.join(':'),
      capacity: candidate.capacity.toString(),
      fixedCost: candidate.fixedCost.toString(),
      startMonth: candidate.startMonth,
      startYear: candidate.startYear.toString(),
      endYear: candidate.endYear.toString(),
      maxAdditionsPerYear: candidate.maxAdditionsPerYear?.toString() || '',
      maxAdditionsOverall: candidate.maxAdditionsOverall?.toString() || '',
      isRetirement: candidate.isRetirement,
      lifetime: candidate.lifetime.toString(),
    });
    setShowGenModal(true);
    onModalVisibleChange(true);
  };

  const handleSaveGen = () => {
    if (!selectedPlanId || !genForm.units.trim()) return;

    const candidateData = {
      expansionPlanId: selectedPlanId,
      units: genForm.units.split(':').map(u => u.trim()).filter(u => u),
      capacity: parseFloat(genForm.capacity) || 0,
      fixedCost: parseFloat(genForm.fixedCost) || 0,
      startMonth: genForm.startMonth,
      startYear: parseInt(genForm.startYear, 10) || 2026,
      endYear: parseInt(genForm.endYear, 10) || 2032,
      maxAdditionsPerYear: genForm.maxAdditionsPerYear ? parseInt(genForm.maxAdditionsPerYear, 10) : null,
      maxAdditionsOverall: genForm.maxAdditionsOverall ? parseInt(genForm.maxAdditionsOverall, 10) : null,
      isRetirement: genForm.isRetirement,
      lifetime: parseInt(genForm.lifetime, 10) || 32,
    };

    if (editingGen) {
      onUpdateGenerationCandidate({...candidateData, id: editingGen.id});
    } else {
      onCreateGenerationCandidate(candidateData);
    }
    closeGenModal();
  };

  const handleDeleteGen = () => {
    if (selectedGenIds.length > 0) {
      onDeleteGenerationCandidates(selectedGenIds);
      setSelectedGenIds([]);
    }
  };

  const toggleGenSelection = (id: string) => {
    setSelectedGenIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Transmission Candidate handlers
  const openAddTransModal = () => {
    setEditingTrans(null);
    setTransForm({
      ...defaultTransForm,
      regionA: effectiveRegions[0] || 'ERCOT',
      regionB: effectiveRegions[1] || effectiveRegions[0] || 'SPP',
    });
    setShowTransModal(true);
    onModalVisibleChange(true);
  };

  const openEditTransModal = (candidate: TransmissionCandidate) => {
    setEditingTrans(candidate);
    setTransForm({
      regionA: candidate.regionA,
      regionB: candidate.regionB,
      capacityLimitIn: candidate.capacityLimitIn.toString(),
      capacityLimitOut: candidate.capacityLimitOut.toString(),
      cost: candidate.cost.toString(),
      inflation: candidate.inflation.toString(),
      startYear: candidate.startYear.toString(),
      endYear: candidate.endYear.toString(),
      maxAdditionsPerYear: candidate.maxAdditionsPerYear?.toString() || '',
      maxAdditionsOverall: candidate.maxAdditionsOverall?.toString() || '',
    });
    setShowTransModal(true);
    onModalVisibleChange(true);
  };

  const handleSaveTrans = () => {
    if (!selectedPlanId || !transForm.regionA || !transForm.regionB) return;

    const candidateData = {
      expansionPlanId: selectedPlanId,
      regionA: transForm.regionA as Region,
      regionB: transForm.regionB as Region,
      capacityLimitIn: parseFloat(transForm.capacityLimitIn) || 0,
      capacityLimitOut: parseFloat(transForm.capacityLimitOut) || 0,
      cost: parseFloat(transForm.cost) || 0,
      inflation: parseFloat(transForm.inflation) || 1,
      startYear: parseInt(transForm.startYear, 10) || 2026,
      endYear: parseInt(transForm.endYear, 10) || 2032,
      maxAdditionsPerYear: transForm.maxAdditionsPerYear ? parseInt(transForm.maxAdditionsPerYear, 10) : null,
      maxAdditionsOverall: transForm.maxAdditionsOverall ? parseInt(transForm.maxAdditionsOverall, 10) : null,
    };

    if (editingTrans) {
      onUpdateTransmissionCandidate({...candidateData, id: editingTrans.id});
    } else {
      onCreateTransmissionCandidate(candidateData);
    }
    closeTransModal();
  };

  const handleDeleteTrans = () => {
    if (selectedTransIds.length > 0) {
      onDeleteTransmissionCandidates(selectedTransIds);
      setSelectedTransIds([]);
    }
  };

  const toggleTransSelection = (id: string) => {
    setSelectedTransIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatValue = (value: number | null): string => {
    return value === null ? '-' : value.toString();
  };

  // Input validation helpers
  const filterInteger = (text: string): string => {
    return text.replace(/[^0-9]/g, '');
  };

  const filterDecimal = (text: string): string => {
    // Remove non-numeric characters except decimal point
    let filtered = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = filtered.split('.');
    if (parts.length > 2) {
      filtered = parts[0] + '.' + parts.slice(1).join('');
    }
    return filtered;
  };

  // Render resize handle
  const renderResizeHandle = (table: 'gen' | 'trans', column: string) => (
    <View
      style={styles.resizeHandle}
      // @ts-ignore - pointer events for Windows
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => handleResizeStart(table, column, e.nativeEvent.pageX)}
      onResponderMove={(e) => handleResizeMove(e.nativeEvent.pageX)}
      onResponderRelease={handleResizeEnd}
    />
  );

  if (!selectedPlanId) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No Plan Selected</Text>
          <Text style={styles.emptySubtext}>
            Select a plan from the Home tab to manage candidates
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      ref={containerRef}
      style={styles.container}
      onLayout={onContainerLayout}
      // @ts-ignore
      onKeyDown={anyModalOpen ? handleKeyDown : undefined}
      onKeyUp={anyModalOpen ? handleKeyDown : undefined}
      focusable={anyModalOpen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>⬡</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>CANDIDATES</Text>
            <Text style={styles.headerSubtitle}>Manage generation and transmission expansion candidates</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Generation Candidates Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIndicator} />
              <View>
                <Text style={styles.sectionTitle}>Generation Candidates for Addition</Text>
                <Text style={styles.sectionSubtitle}>Configure generation capacity expansion options</Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={openAddGenModal}>
                <Text style={styles.primaryButtonText}>+ Add Unit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, selectedGenIds.length !== 1 && styles.buttonDisabled]}
                onPress={() => selectedGenIds.length === 1 && openEditGenModal(filteredGenCandidates.find(c => c.id === selectedGenIds[0])!)}
                disabled={selectedGenIds.length !== 1}>
                <Text style={styles.secondaryButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, selectedGenIds.length === 0 && styles.buttonDisabled]}
                onPress={handleDeleteGen}
                disabled={selectedGenIds.length === 0}>
                <Text style={styles.secondaryButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.tableContainer, {minWidth: Math.max(genTableWidth, containerWidth - 48)}]}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View style={{minWidth: genTableWidth}}>
                <View style={styles.tableHeader}>
                  <View style={[styles.headerCellContainer, {width: genColWidths.checkbox}]}>
                    <Text style={styles.headerCell}></Text>
                  </View>
                  <View style={[styles.headerCellContainer, {width: genColWidths.units}]}>
                    <Text style={styles.headerCell}>UNITS</Text>
                    {renderResizeHandle('gen', 'units')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: genColWidths.capacity}]}>
                    <Text style={styles.headerCell}>CAPACITY</Text>
                    {renderResizeHandle('gen', 'capacity')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: genColWidths.fixedCost}]}>
                    <Text style={styles.headerCell}>FIXED COST</Text>
                    {renderResizeHandle('gen', 'fixedCost')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: genColWidths.startMonth}]}>
                    <Text style={styles.headerCell}>START MONTH</Text>
                    {renderResizeHandle('gen', 'startMonth')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: genColWidths.startYear}]}>
                    <Text style={styles.headerCell}>START YEAR</Text>
                    {renderResizeHandle('gen', 'startYear')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: genColWidths.endYear}]}>
                    <Text style={styles.headerCell}>END YEAR</Text>
                    {renderResizeHandle('gen', 'endYear')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: genColWidths.maxPerYear}]}>
                    <Text style={styles.headerCell}>MAX ADDITIONS PER YEAR</Text>
                    {renderResizeHandle('gen', 'maxPerYear')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: genColWidths.maxOverall}]}>
                    <Text style={styles.headerCell}>MAX ADDITIONS OVERALL</Text>
                    {renderResizeHandle('gen', 'maxOverall')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: genColWidths.retirement}]}>
                    <Text style={styles.headerCell}>RETIREMENT</Text>
                    {renderResizeHandle('gen', 'retirement')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: genColWidths.lifetime}]}>
                    <Text style={styles.headerCell}>LIFETIME</Text>
                  </View>
                </View>
                {filteredGenCandidates.length === 0 ? (
                  <View style={styles.emptyTable}>
                    <Text style={styles.emptyTableText}>No generation candidates. Click "+ Add Unit" to create one.</Text>
                  </View>
                ) : (
                  filteredGenCandidates.map(c => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.tableRow, selectedGenIds.includes(c.id) && styles.tableRowSelected]}
                      onPress={() => toggleGenSelection(c.id)}>
                      <View style={[styles.tableCell, {width: genColWidths.checkbox}]}>
                        <View style={[styles.checkbox, selectedGenIds.includes(c.id) && styles.checkboxChecked]}>
                          {selectedGenIds.includes(c.id) && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      </View>
                      <Text style={[styles.tableCell, styles.cellText, {width: genColWidths.units}]} numberOfLines={1}>{c.units.join(':')}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: genColWidths.capacity}]}>{c.capacity.toLocaleString()}</Text>
                      <Text style={[styles.tableCell, styles.cellTextGreen, {width: genColWidths.fixedCost}]}>${c.fixedCost.toFixed(2)}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: genColWidths.startMonth}]}>{c.startMonth}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: genColWidths.startYear}]}>{c.startYear}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: genColWidths.endYear}]}>{c.endYear}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: genColWidths.maxPerYear}]}>{formatValue(c.maxAdditionsPerYear)}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: genColWidths.maxOverall}]}>{formatValue(c.maxAdditionsOverall)}</Text>
                      <View style={[styles.tableCell, {width: genColWidths.retirement}]}>
                        <View style={[styles.badge, c.isRetirement ? styles.badgeAmber : styles.badgeGray]}>
                          <Text style={[styles.badgeText, c.isRetirement ? styles.badgeTextAmber : styles.badgeTextGray]}>
                            {c.isRetirement ? 'True' : 'False'}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.tableCell, styles.cellText, {width: genColWidths.lifetime}]}>{c.lifetime} yrs</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Transmission Candidates Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIndicator, styles.indicatorYellow]} />
              <View>
                <Text style={styles.sectionTitle}>Transmission Candidates for Addition</Text>
                <Text style={styles.sectionSubtitle}>Configure transmission capacity expansion options</Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.primaryButtonYellow}
                onPress={openAddTransModal}>
                <Text style={styles.primaryButtonText}>+ Add Tie</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, selectedTransIds.length !== 1 && styles.buttonDisabled]}
                onPress={() => selectedTransIds.length === 1 && openEditTransModal(filteredTransCandidates.find(c => c.id === selectedTransIds[0])!)}
                disabled={selectedTransIds.length !== 1}>
                <Text style={styles.secondaryButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, selectedTransIds.length === 0 && styles.buttonDisabled]}
                onPress={handleDeleteTrans}
                disabled={selectedTransIds.length === 0}>
                <Text style={styles.secondaryButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.tableContainer, {minWidth: Math.max(transTableWidth, containerWidth - 48)}]}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View style={{minWidth: transTableWidth}}>
                <View style={[styles.tableHeader, styles.tableHeaderYellow]}>
                  <View style={[styles.headerCellContainer, {width: transColWidths.checkbox}]}>
                    <Text style={styles.headerCellYellow}></Text>
                  </View>
                  <View style={[styles.headerCellContainer, {width: transColWidths.regionA}]}>
                    <Text style={styles.headerCellYellow}>REGION A</Text>
                    {renderResizeHandle('trans', 'regionA')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: transColWidths.regionB}]}>
                    <Text style={styles.headerCellYellow}>REGION B</Text>
                    {renderResizeHandle('trans', 'regionB')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: transColWidths.capacityIn}]}>
                    <Text style={styles.headerCellYellow}>CAPACITY IN</Text>
                    {renderResizeHandle('trans', 'capacityIn')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: transColWidths.capacityOut}]}>
                    <Text style={styles.headerCellYellow}>CAPACITY OUT</Text>
                    {renderResizeHandle('trans', 'capacityOut')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: transColWidths.cost}]}>
                    <Text style={styles.headerCellYellow}>COST ($/MW-YR)</Text>
                    {renderResizeHandle('trans', 'cost')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: transColWidths.inflation}]}>
                    <Text style={styles.headerCellYellow}>INFLATION</Text>
                    {renderResizeHandle('trans', 'inflation')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: transColWidths.startYear}]}>
                    <Text style={styles.headerCellYellow}>START YEAR</Text>
                    {renderResizeHandle('trans', 'startYear')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: transColWidths.endYear}]}>
                    <Text style={styles.headerCellYellow}>END YEAR</Text>
                    {renderResizeHandle('trans', 'endYear')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: transColWidths.maxPerYear}]}>
                    <Text style={styles.headerCellYellow}>MAX ADDITIONS PER YEAR</Text>
                    {renderResizeHandle('trans', 'maxPerYear')}
                  </View>
                  <View style={[styles.headerCellContainer, {width: transColWidths.maxOverall}]}>
                    <Text style={styles.headerCellYellow}>MAX ADDITIONS OVERALL</Text>
                  </View>
                </View>
                {filteredTransCandidates.length === 0 ? (
                  <View style={styles.emptyTable}>
                    <Text style={styles.emptyTableText}>No transmission candidates. Click "+ Add Link" to create one.</Text>
                  </View>
                ) : (
                  filteredTransCandidates.map(c => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.tableRow, selectedTransIds.includes(c.id) && styles.tableRowSelected]}
                      onPress={() => toggleTransSelection(c.id)}>
                      <View style={[styles.tableCell, {width: transColWidths.checkbox}]}>
                        <View style={[styles.checkbox, selectedTransIds.includes(c.id) && styles.checkboxChecked]}>
                          {selectedTransIds.includes(c.id) && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      </View>
                      <Text style={[styles.tableCell, styles.cellText, {width: transColWidths.regionA}]}>{c.regionA}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: transColWidths.regionB}]}>{c.regionB}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: transColWidths.capacityIn}]}>{c.capacityLimitIn}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: transColWidths.capacityOut}]}>{c.capacityLimitOut}</Text>
                      <Text style={[styles.tableCell, styles.cellTextGreen, {width: transColWidths.cost}]}>${c.cost}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: transColWidths.inflation}]}>{c.inflation}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: transColWidths.startYear}]}>{c.startYear}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: transColWidths.endYear}]}>{c.endYear}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: transColWidths.maxPerYear}]}>{formatValue(c.maxAdditionsPerYear)}</Text>
                      <Text style={[styles.tableCell, styles.cellText, {width: transColWidths.maxOverall}]}>{formatValue(c.maxAdditionsOverall)}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Generation Candidate Modal */}
      {showGenModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeGenModal} />
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingGen ? 'Edit Generation Candidate' : 'Add Generation Candidate'}</Text>
              <TouchableOpacity onPress={closeGenModal}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>UNITS (separate multiple with colon)</Text>
                <TextInput
                  style={styles.formInput}
                  value={genForm.units}
                  onChangeText={v => setGenForm(f => ({...f, units: v}))}
                  placeholder="Unit1:Unit2:Unit3"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>CAPACITY (MW)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={genForm.capacity}
                    onChangeText={v => setGenForm(f => ({...f, capacity: filterDecimal(v)}))}
                    keyboardType="numeric"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>FIXED COST ($/kW-yr)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={genForm.fixedCost}
                    onChangeText={v => setGenForm(f => ({...f, fixedCost: filterDecimal(v)}))}
                    keyboardType="numeric"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>START MONTH</Text>
                  <TouchableOpacity
                    style={styles.formSelect}
                    onPress={() => setShowMonthDropdown(!showMonthDropdown)}>
                    <Text style={styles.formSelectText}>{genForm.startMonth}</Text>
                    <Text style={styles.formSelectArrow}>▼</Text>
                  </TouchableOpacity>
                  {showMonthDropdown && (
                    <ScrollView style={styles.dropdown}>
                      {MONTHS.map(m => (
                        <TouchableOpacity
                          key={m}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setGenForm(f => ({...f, startMonth: m}));
                            setShowMonthDropdown(false);
                          }}>
                          <Text style={styles.dropdownItemText}>{m}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>LIFETIME (years)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={genForm.lifetime}
                    onChangeText={v => setGenForm(f => ({...f, lifetime: filterInteger(v)}))}
                    keyboardType="numeric"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>START YEAR</Text>
                  <TextInput
                    style={styles.formInput}
                    value={genForm.startYear}
                    onChangeText={v => setGenForm(f => ({...f, startYear: filterInteger(v)}))}
                    keyboardType="numeric"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>END YEAR</Text>
                  <TextInput
                    style={styles.formInput}
                    value={genForm.endYear}
                    onChangeText={v => setGenForm(f => ({...f, endYear: filterInteger(v)}))}
                    keyboardType="numeric"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>MAX ADDITIONS PER YEAR (blank = unlimited)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={genForm.maxAdditionsPerYear}
                    onChangeText={v => setGenForm(f => ({...f, maxAdditionsPerYear: filterInteger(v)}))}
                    keyboardType="numeric"
                    placeholder="-"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>MAX ADDITIONS OVERALL (blank = unlimited)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={genForm.maxAdditionsOverall}
                    onChangeText={v => setGenForm(f => ({...f, maxAdditionsOverall: filterInteger(v)}))}
                    keyboardType="numeric"
                    placeholder="-"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>
              <View style={styles.formSwitchRow}>
                <Text style={styles.formLabel}>IS RETIREMENT</Text>
                <Switch
                  value={genForm.isRetirement}
                  onValueChange={v => setGenForm(f => ({...f, isRetirement: v}))}
                />
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeGenModal}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveGen}>
                <Text style={styles.saveBtnText}>{editingGen ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Transmission Candidate Modal */}
      {showTransModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeTransModal} />
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingTrans ? 'Edit Transmission Candidate' : 'Add Transmission Candidate'}</Text>
              <TouchableOpacity onPress={closeTransModal}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>REGION A</Text>
                  <TouchableOpacity
                    style={styles.formSelect}
                    onPress={() => setShowRegionADropdown(!showRegionADropdown)}>
                    <Text style={styles.formSelectText}>{transForm.regionA || 'Select...'}</Text>
                    <Text style={styles.formSelectArrow}>▼</Text>
                  </TouchableOpacity>
                  {showRegionADropdown && (
                    <ScrollView style={styles.dropdown}>
                      {effectiveRegions.map(r => (
                        <TouchableOpacity
                          key={r}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setTransForm(f => ({...f, regionA: r}));
                            setShowRegionADropdown(false);
                          }}>
                          <Text style={styles.dropdownItemText}>{r}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>REGION B</Text>
                  <TouchableOpacity
                    style={styles.formSelect}
                    onPress={() => setShowRegionBDropdown(!showRegionBDropdown)}>
                    <Text style={styles.formSelectText}>{transForm.regionB || 'Select...'}</Text>
                    <Text style={styles.formSelectArrow}>▼</Text>
                  </TouchableOpacity>
                  {showRegionBDropdown && (
                    <ScrollView style={styles.dropdown}>
                      {effectiveRegions.filter(r => r !== transForm.regionA).map(r => (
                        <TouchableOpacity
                          key={r}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setTransForm(f => ({...f, regionB: r}));
                            setShowRegionBDropdown(false);
                          }}>
                          <Text style={styles.dropdownItemText}>{r}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>CAPACITY LIMIT IN (MW)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={transForm.capacityLimitIn}
                    onChangeText={v => setTransForm(f => ({...f, capacityLimitIn: filterDecimal(v)}))}
                    keyboardType="numeric"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>CAPACITY LIMIT OUT (MW)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={transForm.capacityLimitOut}
                    onChangeText={v => setTransForm(f => ({...f, capacityLimitOut: filterDecimal(v)}))}
                    keyboardType="numeric"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>COST ($/MW-YR)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={transForm.cost}
                    onChangeText={v => setTransForm(f => ({...f, cost: filterDecimal(v)}))}
                    keyboardType="numeric"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>INFLATION (%)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={transForm.inflation}
                    onChangeText={v => setTransForm(f => ({...f, inflation: filterDecimal(v)}))}
                    keyboardType="numeric"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>START YEAR</Text>
                  <TextInput
                    style={styles.formInput}
                    value={transForm.startYear}
                    onChangeText={v => setTransForm(f => ({...f, startYear: filterInteger(v)}))}
                    keyboardType="numeric"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>END YEAR</Text>
                  <TextInput
                    style={styles.formInput}
                    value={transForm.endYear}
                    onChangeText={v => setTransForm(f => ({...f, endYear: filterInteger(v)}))}
                    keyboardType="numeric"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>MAX ADDITIONS PER YEAR (blank = unlimited)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={transForm.maxAdditionsPerYear}
                    onChangeText={v => setTransForm(f => ({...f, maxAdditionsPerYear: filterInteger(v)}))}
                    keyboardType="numeric"
                    placeholder="-"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.formLabel}>MAX ADDITIONS OVERALL (blank = unlimited)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={transForm.maxAdditionsOverall}
                    onChangeText={v => setTransForm(f => ({...f, maxAdditionsOverall: filterInteger(v)}))}
                    keyboardType="numeric"
                    placeholder="-"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeTransModal}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, styles.saveBtnYellow]} onPress={handleSaveTrans}>
                <Text style={styles.saveBtnText}>{editingTrans ? 'Update' : 'Add'}</Text>
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
    backgroundColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
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
    backgroundColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  section: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.1)',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIndicator: {
    width: 4,
    height: 40,
    backgroundColor: colors.indicator,
    borderRadius: 2,
  },
  indicatorYellow: {
    backgroundColor: colors.indicatorYellow,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryButtonYellow: {
    backgroundColor: '#ca8a04',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tableHeaderYellow: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  headerCellContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 11,
    fontWeight: '600',
    color: '#93c5fd',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerCellYellow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 11,
    fontWeight: '600',
    color: '#fde047',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resizeHandle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: colors.transparent,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  tableRowSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  cellTextGreen: {
    fontSize: 13,
    color: colors.green,
    fontWeight: '500',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: colors.textQuaternary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.transparent,
  },
  checkboxChecked: {
    backgroundColor: colors.indicator,
    borderColor: colors.indicator,
  },
  checkmark: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeGray: {
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeTextAmber: {
    color: colors.amber,
  },
  badgeTextGray: {
    color: colors.gray,
  },
  emptyTable: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTableText: {
    color: colors.textQuaternary,
    fontSize: 14,
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
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modal: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    width: 500,
    maxHeight: '90%',
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
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  formField: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  formFieldHalf: {
    flex: 1,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#0f172a',
    color: colors.text,
  },
  formSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#0f172a',
  },
  formSelectText: {
    fontSize: 14,
    color: colors.text,
  },
  formSelectArrow: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  formSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 6,
    marginTop: 4,
    zIndex: 100,
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.text,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  cancelBtnText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  saveBtnYellow: {
    backgroundColor: '#ca8a04',
  },
  saveBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
