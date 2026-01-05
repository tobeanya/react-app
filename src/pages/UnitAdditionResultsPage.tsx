import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {UnitAdditionResult} from '../types';
import {colors} from '../styles/colors';

interface Props {
  unitAdditionResults: UnitAdditionResult[];
  onModalVisibleChange: (visible: boolean) => void;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

export function UnitAdditionResultsPage({unitAdditionResults}: Props) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'candidate',
    direction: 'asc',
  });

  // Calculate summary statistics
  const summary = useMemo(() => {
    return {
      totalCandidates: unitAdditionResults.length,
      totalCapacity: unitAdditionResults.reduce(
        (sum, item) => sum + item.totalCapacity,
        0,
      ),
      totalCapex: unitAdditionResults.reduce((sum, item) => sum + item.capex, 0),
    };
  }, [unitAdditionResults]);

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
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return unitAdditionResults;
    }

    return [...unitAdditionResults].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof UnitAdditionResult];
      const bVal = b[sortConfig.key as keyof UnitAdditionResult];

      if (aVal === bVal) return 0;

      let comparison: number;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [unitAdditionResults, sortConfig]);

  const handleCopyToClipboard = () => {
    try {
      const headers = [
        'Candidate',
        'Technology',
        'Total Capacity (MW)',
        '2026',
        '2027',
        '2028',
        '2029',
        '2030',
        'CAPEX ($)',
        'Region',
      ].join('\t');
      const rows = sortedData.map(item =>
        [
          item.candidate,
          item.technology,
          item.totalCapacity,
          item.year2026,
          item.year2027,
          item.year2028,
          item.year2029,
          item.year2030,
          item.capex,
          item.region,
        ].join('\t'),
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

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    return '$' + num.toLocaleString();
  };

  const getSortIndicator = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return '';
    }
    return sortConfig.direction === 'asc' ? ' ^' : ' v';
  };

  const getTechnologyStyle = (technology: string) => {
    switch (technology) {
      case 'Solar PV':
        return styles.techSolar;
      case 'Wind':
        return styles.techWind;
      case 'Battery':
        return styles.techBattery;
      case 'Combined Cycle':
      case 'Gas Turbine':
        return styles.techGas;
      case 'Nuclear':
        return styles.techNuclear;
      default:
        return styles.techDefault;
    }
  };

  const getTechnologyTextStyle = (technology: string) => {
    switch (technology) {
      case 'Solar PV':
        return styles.techSolarText;
      case 'Wind':
        return styles.techWindText;
      case 'Battery':
        return styles.techBatteryText;
      case 'Combined Cycle':
      case 'Gas Turbine':
        return styles.techGasText;
      case 'Nuclear':
        return styles.techNuclearText;
      default:
        return styles.techDefaultText;
    }
  };

  // Calculate year totals
  const yearTotals = useMemo(() => {
    return {
      year2026: sortedData.reduce((sum, item) => sum + item.year2026, 0),
      year2027: sortedData.reduce((sum, item) => sum + item.year2027, 0),
      year2028: sortedData.reduce((sum, item) => sum + item.year2028, 0),
      year2029: sortedData.reduce((sum, item) => sum + item.year2029, 0),
      year2030: sortedData.reduce((sum, item) => sum + item.year2030, 0),
    };
  }, [sortedData]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>+</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>UNIT ADDITION RESULTS</Text>
            <Text style={styles.headerSubtitle}>
              Expansion candidates selected by optimization solver
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

      {/* Summary Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>N</Text>
          </View>
          <Text style={styles.statLabel}>CANDIDATES</Text>
          <Text style={styles.statValue}>{summary.totalCandidates}</Text>
          <Text style={styles.statSubtext}>Total Selected</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, styles.statIconGreen]}>
            <Text style={styles.statIcon}>MW</Text>
          </View>
          <Text style={[styles.statLabel, styles.statLabelGreen]}>CAPACITY</Text>
          <Text style={styles.statValue}>{formatNumber(summary.totalCapacity)}</Text>
          <Text style={styles.statSubtext}>MW Added</Text>
        </View>
      </View>

      {/* Data Table */}
      <View style={styles.tableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <TouchableOpacity
                style={[styles.headerCell, {width: 200}]}
                onPress={() => handleSort('candidate')}>
                <Text style={styles.headerCellText}>
                  CANDIDATE{getSortIndicator('candidate')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerCell, {width: 130}]}
                onPress={() => handleSort('technology')}>
                <Text style={styles.headerCellText}>
                  TECHNOLOGY{getSortIndicator('technology')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerCell, styles.headerCellRight, {width: 140}]}
                onPress={() => handleSort('totalCapacity')}>
                <Text style={styles.headerCellText}>
                  TOTAL CAPACITY (MW){getSortIndicator('totalCapacity')}
                </Text>
              </TouchableOpacity>
              <View style={[styles.headerCell, styles.headerCellRight, {width: 100}]}>
                <Text style={styles.headerCellText}>2026</Text>
              </View>
              <View style={[styles.headerCell, styles.headerCellRight, {width: 100}]}>
                <Text style={styles.headerCellText}>2027</Text>
              </View>
              <View style={[styles.headerCell, styles.headerCellRight, {width: 100}]}>
                <Text style={styles.headerCellText}>2028</Text>
              </View>
              <View style={[styles.headerCell, styles.headerCellRight, {width: 100}]}>
                <Text style={styles.headerCellText}>2029</Text>
              </View>
              <View style={[styles.headerCell, styles.headerCellRight, {width: 100}]}>
                <Text style={styles.headerCellText}>2030</Text>
              </View>
            </View>

            {/* Table Body */}
            <ScrollView style={styles.tableBody} nestedScrollEnabled>
              {sortedData.map((item, idx) => (
                <View
                  key={item.id}
                  style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
                  <View style={[styles.cell, {width: 200}]}>
                    <Text style={styles.cellTextPrimary}>{item.candidate}</Text>
                    <Text style={styles.cellTextSecondary}>{item.region}</Text>
                  </View>
                  <View style={[styles.cell, {width: 130}]}>
                    <View
                      style={[styles.techBadge, getTechnologyStyle(item.technology)]}>
                      <Text
                        style={[
                          styles.techBadgeText,
                          getTechnologyTextStyle(item.technology),
                        ]}>
                        {item.technology}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 140}]}>
                    <Text style={styles.cellTextValue}>
                      {formatNumber(item.totalCapacity)}
                    </Text>
                    <View style={styles.capacityBarContainer}>
                      <View
                        style={[
                          styles.capacityBar,
                          {
                            width: `${(item.totalCapacity / summary.totalCapacity) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.cellTextValue,
                        item.year2026 > 0 ? styles.cellTextGreen : styles.cellTextMuted,
                      ]}>
                      {item.year2026 > 0 ? formatNumber(item.year2026) : '—'}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.cellTextValue,
                        item.year2027 > 0 ? styles.cellTextGreen : styles.cellTextMuted,
                      ]}>
                      {item.year2027 > 0 ? formatNumber(item.year2027) : '—'}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.cellTextValue,
                        item.year2028 > 0 ? styles.cellTextGreen : styles.cellTextMuted,
                      ]}>
                      {item.year2028 > 0 ? formatNumber(item.year2028) : '—'}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.cellTextValue,
                        item.year2029 > 0 ? styles.cellTextGreen : styles.cellTextMuted,
                      ]}>
                      {item.year2029 > 0 ? formatNumber(item.year2029) : '—'}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.cellTextValue,
                        item.year2030 > 0 ? styles.cellTextGreen : styles.cellTextMuted,
                      ]}>
                      {item.year2030 > 0 ? formatNumber(item.year2030) : '—'}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Footer/Total Row */}
              {sortedData.length > 0 && (
                <View style={styles.tableFooter}>
                  <View style={[styles.cell, {width: 200}]}>
                    <Text style={styles.footerText}>Total</Text>
                  </View>
                  <View style={[styles.cell, {width: 130}]} />
                  <View style={[styles.cell, styles.cellRight, {width: 140}]}>
                    <Text style={styles.footerText}>
                      {formatNumber(summary.totalCapacity)}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text style={[styles.footerText, styles.footerTextGreen]}>
                      {formatNumber(yearTotals.year2026)}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.footerText,
                        yearTotals.year2027 > 0
                          ? styles.footerTextGreen
                          : styles.footerTextMuted,
                      ]}>
                      {yearTotals.year2027 > 0 ? formatNumber(yearTotals.year2027) : '0'}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.footerText,
                        yearTotals.year2028 > 0
                          ? styles.footerTextGreen
                          : styles.footerTextMuted,
                      ]}>
                      {yearTotals.year2028 > 0 ? formatNumber(yearTotals.year2028) : '0'}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.footerText,
                        yearTotals.year2029 > 0
                          ? styles.footerTextGreen
                          : styles.footerTextMuted,
                      ]}>
                      {yearTotals.year2029 > 0 ? formatNumber(yearTotals.year2029) : '0'}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.footerText,
                        yearTotals.year2030 > 0
                          ? styles.footerTextGreen
                          : styles.footerTextMuted,
                      ]}>
                      {yearTotals.year2030 > 0 ? formatNumber(yearTotals.year2030) : '0'}
                    </Text>
                  </View>
                </View>
              )}

              {sortedData.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No unit additions scheduled</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </ScrollView>
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
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
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
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
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  primaryButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.blue,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#93c5fd',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statLabelGreen: {
    color: '#6ee7b7',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  statSubtext: {
    fontSize: 11,
    color: colors.textQuaternary,
    marginTop: 4,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerCellRight: {
    alignItems: 'flex-end',
  },
  headerCellText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fde047',
    letterSpacing: 0.5,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  cellRight: {
    alignItems: 'flex-end',
  },
  cellTextPrimary: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  cellTextSecondary: {
    fontSize: 11,
    color: colors.textQuaternary,
    marginTop: 2,
  },
  cellTextValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  cellTextGreen: {
    color: '#4ade80',
  },
  cellTextMuted: {
    color: colors.textQuaternary,
  },
  techBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  techBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  techSolar: {
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
  },
  techSolarText: {
    color: '#fde047',
  },
  techWind: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  techWindText: {
    color: '#60a5fa',
  },
  techBattery: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  techBatteryText: {
    color: '#4ade80',
  },
  techGas: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  techGasText: {
    color: '#c084fc',
  },
  techNuclear: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  techNuclearText: {
    color: '#f87171',
  },
  techDefault: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  techDefaultText: {
    color: colors.textTertiary,
  },
  capacityBarContainer: {
    height: 3,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  capacityBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(51, 65, 85, 0.5)',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  footerTextGreen: {
    color: '#4ade80',
  },
  footerTextMuted: {
    color: colors.textQuaternary,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
});
