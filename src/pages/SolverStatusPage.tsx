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
import {SolverLog, SolverStatusType, SAMPLE_SOLVER_LOGS} from '../types';

interface Props {
  solverLogs: SolverLog[];
  solverStatus: SolverStatusType;
  onModalVisibleChange: (visible: boolean) => void;
}

export function SolverStatusPage({
  solverLogs,
  solverStatus,
}: Props) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [colWidths, setColWidths] = useState({
    type: 80,
    time: 180,
    message: 500,
  });
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
      startWidth: colWidths[column as keyof typeof colWidths],
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
      const logText = solverLogs
        .map(log => `[${log.type}] ${log.time}: ${log.message}`)
        .join('\n');
      Clipboard.setString(logText);
      Alert.alert('Success', 'Logs copied to clipboard!');
    } catch (err) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleExport = () => {
    try {
      const data = JSON.stringify(solverLogs, null, 2);
      Clipboard.setString(data);
      Alert.alert('Success', 'Logs exported to clipboard as JSON!');
    } catch (err) {
      Alert.alert('Error', 'Failed to export');
    }
  };

  const getLogTypeStyle = (type: string) => {
    switch (type) {
      case 'Info':
        return styles.logTypeInfo;
      case 'Warning':
        return styles.logTypeWarning;
      case 'Error':
        return styles.logTypeError;
      default:
        return styles.logTypeInfo;
    }
  };

  const getLogTypeTextStyle = (type: string) => {
    switch (type) {
      case 'Info':
        return styles.logTypeInfoText;
      case 'Warning':
        return styles.logTypeWarningText;
      case 'Error':
        return styles.logTypeErrorText;
      default:
        return styles.logTypeInfoText;
    }
  };

  // Calculate statistics
  const totalEntries = solverLogs.length;
  const infoMessages = solverLogs.filter(l => l.type === 'Info').length;
  const warningMessages = solverLogs.filter(l => l.type === 'Warning').length;
  const lastUpdate = solverLogs.length > 0 ? solverLogs[solverLogs.length - 1].time : 'N/A';

  const tableWidth = colWidths.type + colWidths.time + colWidths.message + 48;

  const renderResizeHandle = (column: string) => (
    <View
      style={styles.resizeHandle}
      onStartShouldSetResponder={() => true}
      onResponderGrant={e => handleResizeStart(column, e.nativeEvent.pageX)}
      onResponderMove={e => handleResizeMove(e.nativeEvent.pageX)}
      onResponderRelease={handleResizeEnd}
    />
  );

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIndicator} />
          <View>
            <Text style={styles.headerTitle}>Solver Execution Log</Text>
            <Text style={styles.headerSubtitle}>
              Real-time solver status and execution messages
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

      {/* Log Table */}
      <View style={styles.tableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={{minWidth: Math.max(tableWidth, containerWidth - 32)}}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={[styles.headerCell, {width: colWidths.type}]}>
                <Text style={styles.headerCellText}>TYPE</Text>
                {renderResizeHandle('type')}
              </View>
              <View style={[styles.headerCell, {width: colWidths.time}]}>
                <Text style={styles.headerCellText}>TIME</Text>
                {renderResizeHandle('time')}
              </View>
              <View style={[styles.headerCell, {width: colWidths.message, flex: 1}]}>
                <Text style={styles.headerCellText}>MESSAGE</Text>
                {renderResizeHandle('message')}
              </View>
            </View>

            {/* Table Body */}
            <ScrollView style={styles.tableBody} nestedScrollEnabled>
              {solverLogs.map((log, idx) => (
                <View
                  key={log.id}
                  style={[
                    styles.tableRow,
                    idx % 2 === 0 && styles.tableRowEven,
                  ]}>
                  <View style={[styles.cell, {width: colWidths.type}]}>
                    <View style={[styles.logTypeBadge, getLogTypeStyle(log.type)]}>
                      <Text style={[styles.logTypeBadgeText, getLogTypeTextStyle(log.type)]}>
                        {log.type}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.cell, {width: colWidths.time}]}>
                    <Text style={styles.cellTextMono}>{log.time}</Text>
                  </View>
                  <View style={[styles.cell, {width: colWidths.message, flex: 1}]}>
                    <Text style={styles.cellText} numberOfLines={2}>
                      {log.message}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TOTAL ENTRIES</Text>
          <Text style={styles.statValue}>{totalEntries}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>INFO MESSAGES</Text>
          <Text style={[styles.statValue, styles.statValueBlue]}>{infoMessages}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>WARNINGS</Text>
          <Text style={[styles.statValue, styles.statValueYellow]}>{warningMessages}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>LAST UPDATE</Text>
          <Text style={[styles.statValue, styles.statValueSmall]}>{lastUpdate}</Text>
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerIndicator: {
    width: 4,
    height: 24,
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
    marginTop: 4,
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
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  headerCellText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.indicatorGreen,
    letterSpacing: 0.5,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  cellTextMono: {
    fontSize: 14,
    color: colors.textTertiary,
    fontFamily: 'monospace',
  },
  logTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  logTypeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logTypeInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  logTypeInfoText: {
    color: colors.blue,
  },
  logTypeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  logTypeWarningText: {
    color: colors.amber,
  },
  logTypeError: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logTypeErrorText: {
    color: colors.red,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statValueBlue: {
    color: colors.blue,
  },
  statValueYellow: {
    color: colors.amber,
  },
  statValueSmall: {
    fontSize: 16,
    color: '#cbd5e1',
  },
});
