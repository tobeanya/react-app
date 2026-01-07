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
import {UnitRetirementResult} from '../types';
import {colors} from '../styles/colors';

interface Props {
  unitRetirementResults: UnitRetirementResult[];
  onModalVisibleChange: (visible: boolean) => void;
  planningHorizonStart: number;
  planningHorizonEnd: number;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

export function UnitRetirementResultsPage({
  unitRetirementResults,
  planningHorizonStart,
  planningHorizonEnd,
}: Props) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'candidate',
    direction: 'asc',
  });

  // Generate year columns based on planning horizon (max 5 years for display)
  const years = useMemo(() => {
    const result: number[] = [];
    const maxYears = Math.min(5, planningHorizonEnd - planningHorizonStart + 1);
    for (let i = 0; i < maxYears; i++) {
      result.push(planningHorizonStart + i);
    }
    return result;
  }, [planningHorizonStart, planningHorizonEnd]);

  // Helper to get year value from result - maps display year to data property
  const getYearValue = (item: UnitRetirementResult, year: number): number => {
    const yearIndex = year - planningHorizonStart;
    const yearKeys = ['year2026', 'year2027', 'year2028', 'year2029', 'year2030'] as const;
    if (yearIndex >= 0 && yearIndex < yearKeys.length) {
      return item[yearKeys[yearIndex]];
    }
    return 0;
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    return {
      totalCandidates: unitRetirementResults.length,
      totalCapacity: unitRetirementResults.reduce(
        (sum, item) => sum + item.totalCapacity,
        0,
      ),
    };
  }, [unitRetirementResults]);

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
      return unitRetirementResults;
    }

    return [...unitRetirementResults].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof UnitRetirementResult];
      const bVal = b[sortConfig.key as keyof UnitRetirementResult];

      if (aVal === bVal) return 0;

      let comparison: number;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [unitRetirementResults, sortConfig]);

  const handleCopyToClipboard = () => {
    try {
      const headers = [
        'Candidate',
        'Technology',
        'Total Capacity (MW)',
        ...years.map(y => String(y)),
        'Region',
      ].join('\t');
      const rows = sortedData.map(item =>
        [
          item.candidate,
          item.technology,
          item.totalCapacity,
          ...years.map(y => getYearValue(item, y)),
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

  const getSortIndicator = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return '';
    }
    return sortConfig.direction === 'asc' ? ' ^' : ' v';
  };

  const getTechnologyStyle = (technology: string) => {
    switch (technology.toLowerCase()) {
      case 'coal':
        return styles.techCoal;
      case 'gas':
        return styles.techGas;
      case 'nuclear':
        return styles.techNuclear;
      default:
        return styles.techDefault;
    }
  };

  const getTechnologyTextStyle = (technology: string) => {
    switch (technology.toLowerCase()) {
      case 'coal':
        return styles.techCoalText;
      case 'gas':
        return styles.techGasText;
      case 'nuclear':
        return styles.techNuclearText;
      default:
        return styles.techDefaultText;
    }
  };

  // Calculate year totals dynamically
  const yearTotals = useMemo(() => {
    const totals: {[key: number]: number} = {};
    years.forEach(year => {
      totals[year] = sortedData.reduce((sum, item) => sum + getYearValue(item, year), 0);
    });
    return totals;
  }, [sortedData, years]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>-</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>UNIT RETIREMENT RESULTS</Text>
            <Text style={styles.headerSubtitle}>
              Existing units scheduled for retirement by optimization solver
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
          <View style={[styles.statIconContainer, styles.statIconRed]}>
            <Text style={[styles.statIcon, styles.statIconTextRed]}>X</Text>
          </View>
          <Text style={[styles.statLabel, styles.statLabelRed]}>RETIREMENTS</Text>
          <Text style={styles.statValue}>{summary.totalCandidates}</Text>
          <Text style={styles.statSubtext}>Total Units</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, styles.statIconOrange]}>
            <Text style={[styles.statIcon, styles.statIconTextOrange]}>MW</Text>
          </View>
          <Text style={[styles.statLabel, styles.statLabelOrange]}>CAPACITY</Text>
          <Text style={styles.statValue}>{formatNumber(summary.totalCapacity)}</Text>
          <Text style={styles.statSubtext}>MW Removed</Text>
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
                style={[styles.headerCell, {width: 120}]}
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
              {years.map(year => (
                <View
                  key={year}
                  style={[styles.headerCell, styles.headerCellRight, {width: 100}]}>
                  <Text style={styles.headerCellText}>{year}</Text>
                </View>
              ))}
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
                  <View style={[styles.cell, {width: 120}]}>
                    <View
                      style={[
                        styles.techBadge,
                        getTechnologyStyle(item.technology),
                      ]}>
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
                  {years.map(year => {
                    const value = getYearValue(item, year);
                    return (
                      <View key={year} style={[styles.cell, styles.cellRight, {width: 100}]}>
                        <Text
                          style={[
                            styles.cellTextValue,
                            value > 0 ? styles.cellTextRed : styles.cellTextMuted,
                          ]}>
                          {value > 0 ? formatNumber(value) : '—'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}

              {/* Footer/Total Row */}
              {sortedData.length > 0 && (
                <View style={styles.tableFooter}>
                  <View style={[styles.cell, {width: 200}]}>
                    <Text style={styles.footerText}>Total</Text>
                  </View>
                  <View style={[styles.cell, {width: 120}]} />
                  <View style={[styles.cell, styles.cellRight, {width: 140}]}>
                    <Text style={styles.footerText}>
                      {formatNumber(summary.totalCapacity)}
                    </Text>
                  </View>
                  {years.map(year => {
                    const total = yearTotals[year] || 0;
                    return (
                      <View key={year} style={[styles.cell, styles.cellRight, {width: 100}]}>
                        <Text
                          style={[
                            styles.footerText,
                            total > 0 ? styles.footerTextRed : styles.footerTextMuted,
                          ]}>
                          {formatNumber(total)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {sortedData.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No unit retirements scheduled</Text>
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
    backgroundColor: '#dc2626',
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
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statIconOrange: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  statIcon: {
    fontSize: 12,
    fontWeight: '700',
  },
  statIconTextRed: {
    color: '#f87171',
  },
  statIconTextOrange: {
    color: '#fb923c',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statLabelRed: {
    color: '#fca5a5',
  },
  statLabelOrange: {
    color: '#fdba74',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  statSubtext: {
    fontSize: 12,
    color: colors.textQuaternary,
    marginTop: 4,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
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
    fontSize: 12,
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
    fontSize: 12,
    color: colors.textQuaternary,
    marginTop: 2,
  },
  cellTextValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  cellTextRed: {
    color: '#f87171',
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
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  techCoal: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  techCoalText: {
    color: '#fca5a5',
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
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  techNuclearText: {
    color: '#60a5fa',
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
    backgroundColor: '#ef4444',
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
  footerTextRed: {
    color: '#f87171',
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
