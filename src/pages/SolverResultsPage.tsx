import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  LayoutChangeEvent,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {SolverResult} from '../types';

interface Props {
  solverResults: SolverResult[];
  onModalVisibleChange: (visible: boolean) => void;
}

// Column definitions
const COLUMNS = [
  {key: 'study', label: 'Study', width: 120},
  {key: 'candidate', label: '1 MW Candidate', width: 200},
  {key: 'iteration', label: 'Iteration', width: 80},
  {key: 'year', label: 'Year', width: 70},
  {key: 'status', label: 'Status', width: 120},
  {key: 'namePlate', label: 'Name Plate (MW)', width: 110},
  {key: 'energyMargin', label: 'Energy Margin ($/MW)', width: 130},
  {key: 'npvEnergyMargin', label: 'NPV Energy Margin ($/MW)', width: 150},
  {key: 'availableMW', label: 'Available MW in EUE Hours', width: 150},
  {key: 'npvAvgAvailableMW', label: 'NPV Avg Available MW', width: 140},
  {key: 'fixedCost', label: 'Fixed Cost ($/MW)', width: 120},
  {key: 'fixedCarryingCost', label: 'Fixed Carrying Cost', width: 130},
  {key: 'fixedOMCost', label: 'Fixed OM Cost', width: 110},
  {key: 'totalNPVFixedCost', label: 'Total NPV Fixed Cost', width: 140},
  {key: 'totalNPVFixedCostMinusMargin', label: 'NPV Fixed Cost - Margin', width: 160},
  {key: 'loleCapacity', label: 'LOLE Capacity', width: 110},
  {key: 'eueCap', label: 'EUE Cap (MW)', width: 100},
  {key: 'lolhCap', label: 'LOLH Cap (Hours)', width: 120},
  {key: 'npvTotalCost', label: 'NPV Total Cost ($)', width: 130},
  {key: 'generation', label: 'Generation (MWh)', width: 130},
  {key: 'capacityFactor', label: 'Capacity Factor', width: 110},
  {key: 'hoursOnline', label: 'Hours Online', width: 100},
];

export function SolverResultsPage({
  solverResults,
}: Props) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [colWidths, setColWidths] = useState<{[key: string]: number}>(
    COLUMNS.reduce((acc, col) => ({...acc, [col.key]: col.width}), {}),
  );
  const [resizing, setResizing] = useState<{
    column: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const onContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handleResizeStart = (column: string, startX: number) => {
    setResizing({
      column,
      startX,
      startWidth: colWidths[column],
    });
  };

  const handleResizeMove = (currentX: number) => {
    if (!resizing) return;
    const diff = currentX - resizing.startX;
    const newWidth = Math.max(60, resizing.startWidth + diff);
    setColWidths(prev => ({
      ...prev,
      [resizing.column]: newWidth,
    }));
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  const handleCopyToClipboard = () => {
    try {
      const headers = COLUMNS.map(c => c.label).join('\t');
      const rows = solverResults.map(row =>
        COLUMNS.map(c => row[c.key as keyof SolverResult]).join('\t'),
      );
      Clipboard.setString([headers, ...rows].join('\n'));
      Alert.alert('Success', 'Results copied to clipboard!');
    } catch (err) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleExport = () => {
    try {
      const data = JSON.stringify(solverResults, null, 2);
      Clipboard.setString(data);
      Alert.alert('Success', 'Results exported to clipboard as JSON!');
    } catch (err) {
      Alert.alert('Error', 'Failed to export');
    }
  };

  // Pagination
  const totalPages = Math.ceil(solverResults.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = solverResults.slice(startIndex, endIndex);

  const tableWidth = Object.values(colWidths).reduce((sum, w) => sum + w, 0) + 48;

  const renderResizeHandle = (column: string) => (
    <View
      style={styles.resizeHandle}
      onStartShouldSetResponder={() => true}
      onResponderGrant={e => handleResizeStart(column, e.nativeEvent.pageX)}
      onResponderMove={e => handleResizeMove(e.nativeEvent.pageX)}
      onResponderRelease={handleResizeEnd}
    />
  );

  const formatValue = (key: string, value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const getStatusStyle = (status: string) => {
    if (status.includes('Selected')) {
      return styles.statusSelected;
    }
    return styles.statusRejected;
  };

  const getStatusTextStyle = (status: string) => {
    if (status.includes('Selected')) {
      return styles.statusSelectedText;
    }
    return styles.statusRejectedText;
  };

  const getCellTextStyle = (key: string) => {
    if (['energyMargin', 'npvEnergyMargin'].includes(key)) {
      return styles.cellTextGreen;
    }
    if (['fixedCost', 'fixedCarryingCost', 'fixedOMCost'].includes(key)) {
      return styles.cellTextYellow;
    }
    if (['totalNPVFixedCost'].includes(key)) {
      return styles.cellTextBlue;
    }
    if (['totalNPVFixedCostMinusMargin'].includes(key)) {
      return styles.cellTextPurple;
    }
    return styles.cellText;
  };

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIndicator} />
          <View>
            <Text style={styles.headerTitle}>Solver Results Analysis</Text>
            <Text style={styles.headerSubtitle}>
              Showing {startIndex + 1}-{Math.min(endIndex, solverResults.length)} of{' '}
              {solverResults.length} results
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCopyToClipboard}>
            <Text style={styles.secondaryButtonText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleExport}>
            <Text style={styles.primaryButtonText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Table */}
      <View style={styles.tableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={{minWidth: Math.max(tableWidth, containerWidth - 32)}}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              {COLUMNS.map(col => (
                <View
                  key={col.key}
                  style={[styles.headerCell, {width: colWidths[col.key]}]}>
                  <Text style={styles.headerCellText} numberOfLines={2}>
                    {col.label.toUpperCase()}
                  </Text>
                  {renderResizeHandle(col.key)}
                </View>
              ))}
            </View>

            {/* Table Body */}
            <ScrollView style={styles.tableBody} nestedScrollEnabled>
              {paginatedData.map((row, idx) => (
                <View
                  key={row.id}
                  style={[
                    styles.tableRow,
                    idx % 2 === 0 && styles.tableRowEven,
                  ]}>
                  {COLUMNS.map(col => (
                    <View
                      key={col.key}
                      style={[styles.cell, {width: colWidths[col.key]}]}>
                      {col.key === 'status' ? (
                        <View
                          style={[
                            styles.statusBadge,
                            getStatusStyle(row.status),
                          ]}>
                          <Text
                            style={[
                              styles.statusBadgeText,
                              getStatusTextStyle(row.status),
                            ]}
                            numberOfLines={1}>
                            {row.status}
                          </Text>
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.cellTextMono,
                            getCellTextStyle(col.key),
                          ]}
                          numberOfLines={1}>
                          {formatValue(col.key, row[col.key as keyof SolverResult])}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages}
        </Text>
        <View style={styles.paginationButtons}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === 1 && styles.paginationButtonDisabled,
            ]}
            onPress={() => setCurrentPage(1)}
            disabled={currentPage === 1}>
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === 1 && styles.paginationButtonTextDisabled,
              ]}>
              First
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === 1 && styles.paginationButtonDisabled,
            ]}
            onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}>
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === 1 && styles.paginationButtonTextDisabled,
              ]}>
              Previous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === totalPages && styles.paginationButtonDisabled,
            ]}
            onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}>
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === totalPages && styles.paginationButtonTextDisabled,
              ]}>
              Next
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === totalPages && styles.paginationButtonDisabled,
            ]}
            onPress={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}>
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === totalPages && styles.paginationButtonTextDisabled,
              ]}>
              Last
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

import { colors } from '../styles/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerIndicator: {
    width: 4,
    height: 20,
    backgroundColor: colors.indicatorGreen,
    borderRadius: 2,
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    position: 'relative',
  },
  headerCellText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.indicatorGreen,
    letterSpacing: 0.3,
  },
  resizeHandle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: colors.transparent,
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.3)',
  },
  tableRowEven: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
  },
  cell: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  cellTextMono: {
    fontSize: 13,
    color: colors.textTertiary,
    fontFamily: 'monospace',
  },
  cellTextGreen: {
    color: colors.green,
  },
  cellTextYellow: {
    color: colors.yellow,
  },
  cellTextBlue: {
    color: colors.blue,
  },
  cellTextPurple: {
    color: colors.purple,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusSelectedText: {
    color: colors.green,
  },
  statusRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusRejectedText: {
    color: colors.red,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 12,
  },
  paginationText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  paginationButtonTextDisabled: {
    color: colors.textQuaternary,
  },
});
