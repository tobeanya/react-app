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
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

export function UnitRetirementResultsPage({unitRetirementResults}: Props) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'candidate',
    direction: 'asc',
  });

  const hasData = unitRetirementResults.length > 0;

  // Calculate summary statistics
  const summary = useMemo(() => {
    return {
      totalCandidates: unitRetirementResults.length,
      totalCapacity: unitRetirementResults.reduce(
        (sum, item) => sum + item.totalCapacity,
        0,
      ),
      estimatedSavings: unitRetirementResults.reduce(
        (sum, item) => sum + item.omCost,
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
    if (!hasData) {
      Alert.alert('Info', 'No data to copy');
      return;
    }
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
        'O&M Savings ($)',
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
          item.omCost,
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
    if (!hasData) {
      Alert.alert('Info', 'No data to export');
      return;
    }
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
            style={[styles.secondaryButton, !hasData && styles.buttonDisabled]}
            onPress={handleCopyToClipboard}
            disabled={!hasData}>
            <Text
              style={[
                styles.secondaryButtonText,
                !hasData && styles.buttonTextDisabled,
              ]}>
              Copy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, !hasData && styles.buttonDisabled]}
            onPress={handleExport}
            disabled={!hasData}>
            <Text
              style={[
                styles.primaryButtonText,
                !hasData && styles.buttonTextDisabled,
              ]}>
              Export
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Banner - shown when no retirements */}
      {!hasData && (
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerBorder} />
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>No Retirements Scheduled</Text>
            <Text style={styles.infoBannerText}>
              The optimization solver has not identified any existing units for
              retirement in the current planning horizon. This may indicate
              sufficient existing capacity or economic viability of current assets.
            </Text>
          </View>
        </View>
      )}

      {/* Summary Statistics */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, !hasData && styles.statCardEmpty]}>
          <View style={[styles.statIconContainer, styles.statIconRed]}>
            <Text style={[styles.statIcon, styles.statIconTextRed]}>X</Text>
          </View>
          <Text style={[styles.statLabel, styles.statLabelRed]}>RETIREMENTS</Text>
          <Text style={styles.statValue}>{summary.totalCandidates}</Text>
          <Text style={styles.statSubtext}>Total Units</Text>
        </View>

        <View style={[styles.statCard, !hasData && styles.statCardEmpty]}>
          <View style={[styles.statIconContainer, styles.statIconOrange]}>
            <Text style={[styles.statIcon, styles.statIconTextOrange]}>MW</Text>
          </View>
          <Text style={[styles.statLabel, styles.statLabelOrange]}>CAPACITY</Text>
          <Text style={styles.statValue}>{formatNumber(summary.totalCapacity)}</Text>
          <Text style={styles.statSubtext}>MW Removed</Text>
        </View>

        <View style={[styles.statCard, !hasData && styles.statCardEmpty]}>
          <View style={[styles.statIconContainer, styles.statIconGreen]}>
            <Text style={[styles.statIcon, styles.statIconTextGreen]}>$</Text>
          </View>
          <Text style={[styles.statLabel, styles.statLabelGreen]}>SAVINGS</Text>
          <Text style={styles.statValue}>{formatCurrency(summary.estimatedSavings)}</Text>
          <Text style={styles.statSubtext}>Annual O&M</Text>
        </View>
      </View>

      {/* Data Table or Empty State */}
      {hasData ? (
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
                <View
                  style={[styles.headerCell, styles.headerCellRight, {width: 100}]}>
                  <Text style={styles.headerCellText}>2026</Text>
                </View>
                <View
                  style={[styles.headerCell, styles.headerCellRight, {width: 100}]}>
                  <Text style={styles.headerCellText}>2027</Text>
                </View>
                <View
                  style={[styles.headerCell, styles.headerCellRight, {width: 100}]}>
                  <Text style={styles.headerCellText}>2028</Text>
                </View>
                <View
                  style={[styles.headerCell, styles.headerCellRight, {width: 100}]}>
                  <Text style={styles.headerCellText}>2029</Text>
                </View>
                <View
                  style={[styles.headerCell, styles.headerCellRight, {width: 100}]}>
                  <Text style={styles.headerCellText}>2030</Text>
                </View>
                <TouchableOpacity
                  style={[styles.headerCell, styles.headerCellRight, {width: 130}]}
                  onPress={() => handleSort('omCost')}>
                  <Text style={styles.headerCellText}>
                    O&M SAVINGS{getSortIndicator('omCost')}
                  </Text>
                </TouchableOpacity>
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
                    <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                      <Text
                        style={[
                          styles.cellTextValue,
                          item.year2026 > 0 ? styles.cellTextRed : styles.cellTextMuted,
                        ]}>
                        {item.year2026 > 0 ? formatNumber(item.year2026) : '—'}
                      </Text>
                    </View>
                    <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                      <Text
                        style={[
                          styles.cellTextValue,
                          item.year2027 > 0 ? styles.cellTextRed : styles.cellTextMuted,
                        ]}>
                        {item.year2027 > 0 ? formatNumber(item.year2027) : '—'}
                      </Text>
                    </View>
                    <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                      <Text
                        style={[
                          styles.cellTextValue,
                          item.year2028 > 0 ? styles.cellTextRed : styles.cellTextMuted,
                        ]}>
                        {item.year2028 > 0 ? formatNumber(item.year2028) : '—'}
                      </Text>
                    </View>
                    <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                      <Text
                        style={[
                          styles.cellTextValue,
                          item.year2029 > 0 ? styles.cellTextRed : styles.cellTextMuted,
                        ]}>
                        {item.year2029 > 0 ? formatNumber(item.year2029) : '—'}
                      </Text>
                    </View>
                    <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                      <Text
                        style={[
                          styles.cellTextValue,
                          item.year2030 > 0 ? styles.cellTextRed : styles.cellTextMuted,
                        ]}>
                        {item.year2030 > 0 ? formatNumber(item.year2030) : '—'}
                      </Text>
                    </View>
                    <View style={[styles.cell, styles.cellRight, {width: 130}]}>
                      <Text style={[styles.cellTextValue, styles.cellTextGreen]}>
                        {formatCurrency(item.omCost)}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Footer/Total Row */}
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
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.footerText,
                        yearTotals.year2026 > 0
                          ? styles.footerTextRed
                          : styles.footerTextMuted,
                      ]}>
                      {formatNumber(yearTotals.year2026)}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.footerText,
                        yearTotals.year2027 > 0
                          ? styles.footerTextRed
                          : styles.footerTextMuted,
                      ]}>
                      {formatNumber(yearTotals.year2027)}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.footerText,
                        yearTotals.year2028 > 0
                          ? styles.footerTextRed
                          : styles.footerTextMuted,
                      ]}>
                      {formatNumber(yearTotals.year2028)}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.footerText,
                        yearTotals.year2029 > 0
                          ? styles.footerTextRed
                          : styles.footerTextMuted,
                      ]}>
                      {formatNumber(yearTotals.year2029)}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 100}]}>
                    <Text
                      style={[
                        styles.footerText,
                        yearTotals.year2030 > 0
                          ? styles.footerTextRed
                          : styles.footerTextMuted,
                      ]}>
                      {formatNumber(yearTotals.year2030)}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.cellRight, {width: 130}]}>
                    <Text style={[styles.footerText, styles.footerTextGreen]}>
                      {formatCurrency(summary.estimatedSavings)}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIconContainer}>
            <Text style={styles.emptyStateIcon}>X</Text>
          </View>
          <Text style={styles.emptyStateTitle}>No Retirements Scheduled</Text>
          <Text style={styles.emptyStateText}>
            The optimization solver has determined that no existing generation units
            should be retired during the planning horizon based on current economic
            and operational constraints.
          </Text>
          <View style={styles.emptyStateInfo}>
            <Text style={styles.emptyStateInfoText}>
              This is a common result when existing assets remain economically viable
            </Text>
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
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
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
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  primaryButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonTextDisabled: {
    color: colors.textQuaternary,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  infoBannerBorder: {
    width: 4,
    backgroundColor: colors.primary,
  },
  infoBannerContent: {
    flex: 1,
    padding: 16,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#93c5fd',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: colors.textTertiary,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statCardEmpty: {
    opacity: 0.5,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIconRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statIconOrange: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  statIconGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statIcon: {
    fontSize: 11,
    fontWeight: '700',
  },
  statIconTextRed: {
    color: '#f87171',
  },
  statIconTextOrange: {
    color: '#fb923c',
  },
  statIconTextGreen: {
    color: '#4ade80',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  statLabelRed: {
    color: '#fca5a5',
  },
  statLabelOrange: {
    color: '#fdba74',
  },
  statLabelGreen: {
    color: '#6ee7b7',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statSubtext: {
    fontSize: 10,
    color: colors.textQuaternary,
    marginTop: 2,
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
  cellTextRed: {
    color: '#f87171',
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
  footerTextGreen: {
    color: '#4ade80',
  },
  footerTextMuted: {
    color: colors.textQuaternary,
  },
  emptyState: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(100, 116, 139, 0.3)',
    borderStyle: 'dashed',
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateIcon: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textQuaternary,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textQuaternary,
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyStateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateInfoText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
