import React, {useState, useMemo} from 'react';
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
import {NPVResult} from '../types';
import {colors} from '../styles/colors';

interface Props {
  npvResults: NPVResult[];
  onModalVisibleChange: (visible: boolean) => void;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

// Column definitions
const COLUMNS = [
  {key: 'study', label: 'Study', width: 140, align: 'left' as const, color: 'cyan'},
  {key: 'iteration', label: 'Iteration', width: 80, align: 'right' as const, color: 'cyan'},
  {key: 'evalYear', label: 'Eval Year', width: 90, align: 'right' as const, color: 'cyan'},
  {key: 'stage', label: 'Stage', width: 90, align: 'left' as const, color: 'blue'},
  {key: 'year', label: 'Year', width: 70, align: 'right' as const, color: 'cyan'},
  {key: 'candidate', label: 'Marginal Candidate', width: 180, align: 'left' as const, color: 'cyan'},
  {key: 'loleCapacity', label: 'LOLE Capacity', width: 110, align: 'right' as const, color: 'yellow'},
  {key: 'discLoleCapacity', label: 'Disc. LOLE Cap', width: 120, align: 'right' as const, color: 'yellow'},
  {key: 'margin', label: 'Margin ($/MW)', width: 120, align: 'right' as const, color: 'yellow'},
  {key: 'discMargin', label: 'Disc. Margin', width: 120, align: 'right' as const, color: 'yellow'},
  {key: 'totalCost', label: 'Total Cost ($)', width: 140, align: 'right' as const, color: 'green'},
  {key: 'discTotalCost', label: 'Disc. Total Cost', width: 150, align: 'right' as const, color: 'green'},
  {key: 'prodCost', label: 'Prod Cost ($)', width: 130, align: 'right' as const, color: 'purple'},
  {key: 'discProdCost', label: 'Disc. Prod Cost', width: 140, align: 'right' as const, color: 'purple'},
  {key: 'fuelCost', label: 'Fuel Cost ($)', width: 130, align: 'right' as const, color: 'amber'},
  {key: 'discFuelCost', label: 'Disc. Fuel Cost', width: 140, align: 'right' as const, color: 'amber'},
];

export function NPVResultsPage({npvResults}: Props) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState<SortConfig>({key: null, direction: null});
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

  // Sorting logic
  const handleSort = (columnKey: string) => {
    setSortConfig(prev => {
      if (prev.key !== columnKey) {
        return {key: columnKey, direction: 'asc'};
      }
      if (prev.direction === 'asc') {
        return {key: columnKey, direction: 'desc'};
      }
      return {key: null, direction: null};
    });
    setCurrentPage(1); // Reset to first page when sorting
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return npvResults;
    }

    return [...npvResults].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof NPVResult];
      const bVal = b[sortConfig.key as keyof NPVResult];

      if (aVal === bVal) return 0;

      let comparison: number;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [npvResults, sortConfig]);

  // Column resize handlers
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
      const rows = sortedData.map(row =>
        COLUMNS.map(c => row[c.key as keyof NPVResult]).join('\t'),
      );
      Clipboard.setString([headers, ...rows].join('\n'));
      Alert.alert('Success', 'Results copied to clipboard!');
    } catch (err) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleExport = () => {
    try {
      const data = JSON.stringify(sortedData, null, 2);
      Clipboard.setString(data);
      Alert.alert('Success', 'Results exported to clipboard as JSON!');
    } catch (err) {
      Alert.alert('Error', 'Failed to export');
    }
  };

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

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

  const getSortIndicator = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return ' ';
    }
    return sortConfig.direction === 'asc' ? ' ^' : ' v';
  };

  const formatValue = (key: string, value: any) => {
    if (typeof value === 'number') {
      // Format with appropriate decimal places
      if (['loleCapacity', 'discLoleCapacity'].includes(key)) {
        return value.toFixed(3);
      }
      if (['margin', 'discMargin'].includes(key)) {
        return value.toFixed(1);
      }
      return value.toLocaleString(undefined, {maximumFractionDigits: 3});
    }
    return value;
  };

  const getHeaderColorStyle = (color: string) => {
    switch (color) {
      case 'cyan':
        return styles.headerTextCyan;
      case 'yellow':
        return styles.headerTextYellow;
      case 'green':
        return styles.headerTextGreen;
      case 'purple':
        return styles.headerTextPurple;
      case 'amber':
        return styles.headerTextAmber;
      case 'blue':
        return styles.headerTextBlue;
      default:
        return styles.headerTextCyan;
    }
  };

  const getCellTextStyle = (color: string) => {
    switch (color) {
      case 'cyan':
        return styles.cellTextCyan;
      case 'yellow':
        return styles.cellTextYellow;
      case 'green':
        return styles.cellTextGreen;
      case 'purple':
        return styles.cellTextPurple;
      case 'amber':
        return styles.cellTextAmber;
      case 'blue':
        return styles.cellTextBlue;
      default:
        return styles.cellText;
    }
  };

  const rowsPerPageOptions = [10, 25, 50, 100];

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIndicator} />
          <View>
            <Text style={styles.headerTitle}>NPV Results Analysis</Text>
            <Text style={styles.headerSubtitle}>
              Net Present Value calculations across all expansion scenarios
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

      {/* Pagination Info Bar */}
      <View style={styles.paginationInfoBar}>
        <View style={styles.paginationInfoLeft}>
          <Text style={styles.paginationInfoText}>
            Showing{' '}
            <Text style={styles.paginationInfoHighlight}>{startIndex + 1}</Text> to{' '}
            <Text style={styles.paginationInfoHighlight}>
              {Math.min(endIndex, sortedData.length)}
            </Text>{' '}
            of <Text style={styles.paginationInfoHighlight}>{sortedData.length}</Text>{' '}
            results
          </Text>
          <View style={styles.rowsPerPageContainer}>
            <Text style={styles.rowsPerPageLabel}>Rows per page:</Text>
            <View style={styles.rowsPerPageSelect}>
              {rowsPerPageOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.rowsPerPageOption,
                    rowsPerPage === option && styles.rowsPerPageOptionActive,
                  ]}
                  onPress={() => {
                    setRowsPerPage(option);
                    setCurrentPage(1);
                  }}>
                  <Text
                    style={[
                      styles.rowsPerPageOptionText,
                      rowsPerPage === option && styles.rowsPerPageOptionTextActive,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.paginationControls}>
          <TouchableOpacity
            style={[
              styles.paginationArrow,
              currentPage === 1 && styles.paginationArrowDisabled,
            ]}
            onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}>
            <Text style={styles.paginationArrowText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.pageIndicator}>
            Page <Text style={styles.pageIndicatorHighlight}>{currentPage}</Text> of{' '}
            <Text style={styles.pageIndicatorHighlight}>{totalPages || 1}</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.paginationArrow,
              currentPage === totalPages && styles.paginationArrowDisabled,
            ]}
            onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}>
            <Text style={styles.paginationArrowText}>{'>'}</Text>
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
                <TouchableOpacity
                  key={col.key}
                  style={[styles.headerCell, {width: colWidths[col.key]}]}
                  onPress={() => handleSort(col.key)}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.headerCellContent,
                      col.align === 'right' && styles.headerCellRight,
                    ]}>
                    <Text
                      style={[styles.headerCellText, getHeaderColorStyle(col.color)]}
                      numberOfLines={2}>
                      {col.label.toUpperCase()}
                      {getSortIndicator(col.key)}
                    </Text>
                  </View>
                  {renderResizeHandle(col.key)}
                </TouchableOpacity>
              ))}
            </View>

            {/* Table Body */}
            <ScrollView style={styles.tableBody} nestedScrollEnabled>
              {paginatedData.map((row, idx) => (
                <View
                  key={row.id}
                  style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
                  {COLUMNS.map(col => (
                    <View
                      key={col.key}
                      style={[
                        styles.cell,
                        {width: colWidths[col.key]},
                        col.align === 'right' && styles.cellRight,
                      ]}>
                      <Text
                        style={[
                          styles.cellTextMono,
                          getCellTextStyle(col.color),
                          col.key === 'candidate' && styles.cellTextBold,
                        ]}
                        numberOfLines={1}>
                        {formatValue(col.key, row[col.key as keyof NPVResult])}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
              {paginatedData.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No NPV results available</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Pagination */}
      <View style={styles.bottomPagination}>
        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages || 1}
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
            disabled={currentPage === totalPages || totalPages === 0}>
            <Text
              style={[
                styles.paginationButtonText,
                (currentPage === totalPages || totalPages === 0) &&
                  styles.paginationButtonTextDisabled,
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
            disabled={currentPage === totalPages || totalPages === 0}>
            <Text
              style={[
                styles.paginationButtonText,
                (currentPage === totalPages || totalPages === 0) &&
                  styles.paginationButtonTextDisabled,
              ]}>
              Last
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Notice */}
      <View style={styles.infoNotice}>
        <View style={styles.infoNoticeBorder} />
        <View style={styles.infoNoticeContent}>
          <Text style={styles.infoNoticeTitle}>NPV Analysis Complete</Text>
          <Text style={styles.infoNoticeText}>
            Click column headers to sort. Drag column edges to resize.
          </Text>
        </View>
      </View>
    </View>
  );
}

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
    backgroundColor: colors.blue,
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
  paginationInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  paginationInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  paginationInfoText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  paginationInfoHighlight: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  rowsPerPageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowsPerPageLabel: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  rowsPerPageSelect: {
    flexDirection: 'row',
    gap: 4,
  },
  rowsPerPageOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
  },
  rowsPerPageOptionActive: {
    backgroundColor: colors.primary,
  },
  rowsPerPageOptionText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  rowsPerPageOptionTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paginationArrow: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationArrowDisabled: {
    opacity: 0.4,
  },
  paginationArrowText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  pageIndicator: {
    fontSize: 13,
    color: colors.textTertiary,
    paddingHorizontal: 12,
  },
  pageIndicatorHighlight: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
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
    paddingVertical: 12,
    position: 'relative',
  },
  headerCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCellRight: {
    justifyContent: 'flex-end',
  },
  headerCellText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headerTextCyan: {
    color: '#67e8f9',
  },
  headerTextYellow: {
    color: '#fde047',
  },
  headerTextGreen: {
    color: '#4ade80',
  },
  headerTextPurple: {
    color: '#c084fc',
  },
  headerTextAmber: {
    color: '#fbbf24',
  },
  headerTextBlue: {
    color: '#60a5fa',
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
  cellRight: {
    alignItems: 'flex-end',
  },
  cellText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  cellTextMono: {
    fontSize: 12,
    color: colors.textTertiary,
    fontFamily: 'monospace',
  },
  cellTextBold: {
    fontWeight: '600',
  },
  cellTextCyan: {
    color: '#67e8f9',
  },
  cellTextYellow: {
    color: colors.textTertiary,
  },
  cellTextGreen: {
    color: '#4ade80',
    fontWeight: '500',
  },
  cellTextPurple: {
    color: '#c084fc',
    fontWeight: '500',
  },
  cellTextAmber: {
    color: '#fbbf24',
    fontWeight: '500',
  },
  cellTextBlue: {
    color: '#60a5fa',
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  bottomPagination: {
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
  infoNotice: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    overflow: 'hidden',
  },
  infoNoticeBorder: {
    width: 4,
    backgroundColor: colors.primary,
  },
  infoNoticeContent: {
    flex: 1,
    padding: 16,
  },
  infoNoticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#93c5fd',
    marginBottom: 4,
  },
  infoNoticeText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
