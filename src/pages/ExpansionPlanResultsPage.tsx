import React, {useState, useMemo, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import {EP_DATA} from '../data/expansionPlanResultsData';
import {colors} from '../styles/colors';

interface Props {
  onModalVisibleChange?: (visible: boolean) => void;
  showDetailedResults?: boolean;
  onToggleDetailedResults?: () => void;
}

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

// Tech name mapping for display
const techMap: Record<string, string> = {
  'Candidate_Adv CC_RestOfSys': 'Adv CC',
  'Candidate_Adv CT_RestOfSys': 'Adv CT',
  'Candidate_Battery_4HR_RestOfSys': 'Battery 4HR',
  'Candidate_Battery_4HR_RestOfSys;Candidate_Solar_W_RestOfSys': 'Battery+Solar',
  'Candidate_Solar_W_RestOfSys': 'Solar W',
  'Candidate_Wind_W_RestOfSys': 'Wind W',
};

// Tech colors for badges
const techColors: Record<string, {bg: string; text: string; border: string}> = {
  'Adv CC': {bg: 'rgba(96, 165, 250, 0.2)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)'},
  'Adv CT': {bg: 'rgba(244, 114, 182, 0.2)', text: '#f472b6', border: 'rgba(244, 114, 182, 0.3)'},
  'Battery 4HR': {bg: 'rgba(52, 211, 153, 0.2)', text: '#34d399', border: 'rgba(52, 211, 153, 0.3)'},
  'Battery+Solar': {bg: 'rgba(251, 191, 36, 0.2)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)'},
  'Solar W': {bg: 'rgba(251, 146, 60, 0.2)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.3)'},
  'Wind W': {bg: 'rgba(167, 139, 250, 0.2)', text: '#a78bfa', border: 'rgba(167, 139, 250, 0.3)'},
};

const shortenTech = (t: string): string =>
  techMap[t] || t.replace(/Candidate_|_RestOfSys/g, '').replace(/_/g, ' ');

const formatValue = (val: any): string => {
  if (val == null || val === '') return '—';
  if (typeof val === 'string') return val;
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);
  const abs = Math.abs(num);
  if (abs >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  if (abs < 0.01 && abs > 0) return num.toExponential(2);
  return num.toFixed(2).replace(/\.?0+$/, '');
};

export function ExpansionPlanResultsPage({
  showDetailedResults = false,
  onToggleDetailedResults,
}: Props) {
  const [selectedMetric, setSelectedMetric] = useState('Added Capacity');
  const [sortConfig, setSortConfig] = useState<SortConfig>({key: null, direction: 'asc'});
  const [currentView, setCurrentView] = useState<'table' | 'chart'>('table');
  const [chartType, setChartType] = useState<'bar' | 'line'>('line');
  const [containerWidth, setContainerWidth] = useState(0);
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);

  const containerRef = useRef<View>(null);

  // Handle Escape key to close dropdown
  const handleKeyDown = useCallback((e: any) => {
    const key = e.nativeEvent?.key || e.key;
    if (key === 'Escape' && showMetricDropdown) {
      setShowMetricDropdown(false);
    }
  }, [showMetricDropdown]);

  // Focus container when dropdown opens
  useEffect(() => {
    if (showMetricDropdown && containerRef.current) {
      // @ts-ignore
      containerRef.current.focus?.();
    }
  }, [showMetricDropdown]);

  const onContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const metricInfo = EP_DATA.m.find((x: any) => x.n === selectedMetric);
  const hasBaseline = metricInfo?.b || false;

  const isNumericMetric = useMemo(() => {
    for (const row of EP_DATA.d) {
      if ((row as any)[selectedMetric] != null) {
        return typeof (row as any)[selectedMetric] === 'number';
      }
    }
    return false;
  }, [selectedMetric]);

  const {pivotData, techList, buildCycles} = useMemo(() => {
    const pivot: Record<number, Record<string, {value: any; status: string}>> = {};
    const techs = new Set<string>();

    EP_DATA.d.forEach((row: any) => {
      const bc = row.b;
      if (!pivot[bc]) pivot[bc] = {};
      pivot[bc][row.t] = {value: row[selectedMetric], status: row.s};
      techs.add(row.t);
    });

    const techListArr = Array.from(techs).sort((a, b) =>
      shortenTech(a).localeCompare(shortenTech(b)),
    );
    let cycles = Object.keys(pivot).map(Number).sort((a, b) => a - b);

    if (sortConfig.key) {
      cycles.sort((a, b) => {
        let valA: any, valB: any;
        if (sortConfig.key === 'buildCycle') {
          valA = a;
          valB = b;
        } else {
          valA = pivot[a]?.[sortConfig.key!]?.value;
          valB = pivot[b]?.[sortConfig.key!]?.value;
        }
        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return {pivotData: pivot, techList: techListArr, buildCycles: cycles};
  }, [selectedMetric, sortConfig]);

  const getBaseline = (bc: number): any => {
    if (bc === 0 || !hasBaseline) return null;
    const prevData = pivotData[bc - 1];
    if (!prevData) return null;
    for (const t of techList) {
      if (prevData[t]?.status?.includes('Selected')) {
        return prevData[t].value;
      }
    }
    return null;
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  const getTechBadgeStyle = (tech: string) => {
    const shortName = shortenTech(tech);
    const color = techColors[shortName];
    if (!color) {
      return {
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderColor: 'rgba(148, 163, 184, 0.3)',
      };
    }
    return {
      backgroundColor: color.bg,
      borderColor: color.border,
    };
  };

  const getTechTextColor = (tech: string) => {
    const shortName = shortenTech(tech);
    return techColors[shortName]?.text || '#94a3b8';
  };

  // Chart data for SVG visualization
  const chartData = useMemo(() => {
    if (!isNumericMetric) return null;

    return techList.map(tech => {
      const shortName = shortenTech(tech);
      return {
        label: shortName,
        color: techColors[shortName]?.text || '#94a3b8',
        data: buildCycles.map(bc => ({
          x: bc,
          y: pivotData[bc]?.[tech]?.value ?? null,
        })),
      };
    });
  }, [pivotData, techList, buildCycles, isNumericMetric]);

  // Chart bounds for scaling
  const chartBounds = useMemo(() => {
    if (!chartData) return null;

    const allValues = chartData.flatMap(series =>
      series.data.filter(d => d.y != null && !isNaN(d.y)).map(d => d.y as number),
    );

    if (allValues.length === 0) return null;

    const maxVal = Math.max(...allValues);
    const padding = maxVal * 0.1;

    return {
      minVal: 0,
      maxVal: maxVal + padding,
      range: maxVal + padding,
      minCycle: Math.min(...buildCycles),
      maxCycle: Math.max(...buildCycles),
    };
  }, [chartData, buildCycles]);

  const formatAxisValue = (val: number): string => {
    const abs = Math.abs(val);
    if (abs >= 1e9) return (val / 1e9).toFixed(1) + 'B';
    if (abs >= 1e6) return (val / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return (val / 1e3).toFixed(1) + 'K';
    if (abs < 0.01 && abs > 0) return val.toExponential(1);
    return val.toFixed(1);
  };

  // Calculate column widths
  const buildCycleColWidth = 100;
  const baselineColWidth = hasBaseline ? 100 : 0;
  const techColWidth = 120;
  const tableWidth = buildCycleColWidth + baselineColWidth + techList.length * techColWidth + 32;

  return (
    <View
      ref={containerRef}
      style={styles.container}
      onLayout={onContainerLayout}
      // @ts-ignore - keyboard events for RN Windows
      onKeyDown={showMetricDropdown ? handleKeyDown : undefined}
      focusable={showMetricDropdown}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>⊞</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>EXPANSION PLAN RESULTS</Text>
            <Text style={styles.headerSubtitle}>
              Build cycle analysis by technology
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, currentView === 'table' && styles.viewButtonActive]}
              onPress={() => setCurrentView('table')}>
              <Text
                style={[
                  styles.viewButtonText,
                  currentView === 'table' && styles.viewButtonTextActive,
                ]}>
                Table
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewButton,
                currentView === 'chart' && styles.viewButtonActive,
                !isNumericMetric && styles.viewButtonDisabled,
              ]}
              onPress={() => isNumericMetric && setCurrentView('chart')}
              disabled={!isNumericMetric}>
              <Text
                style={[
                  styles.viewButtonText,
                  currentView === 'chart' && styles.viewButtonTextActive,
                  !isNumericMetric && styles.viewButtonTextDisabled,
                ]}>
                Chart
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Controls Panel */}
      <View style={styles.controlsPanel}>
        <View style={styles.controlsRow}>
          <View style={styles.metricSelector}>
            <Text style={styles.controlLabel}>REPORT METRIC</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowMetricDropdown(!showMetricDropdown)}>
              <Text style={styles.dropdownText}>{selectedMetric}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {showMetricDropdown && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {EP_DATA.m.map((metric: any) => (
                    <TouchableOpacity
                      key={metric.n}
                      style={[
                        styles.dropdownItem,
                        selectedMetric === metric.n && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setSelectedMetric(metric.n);
                        setShowMetricDropdown(false);
                      }}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedMetric === metric.n && styles.dropdownItemTextActive,
                        ]}>
                        {metric.n}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.unitsBadge}>
            <Text style={styles.unitsLabel}>Units:</Text>
            <Text style={styles.unitsValue}>{metricInfo?.u || '—'}</Text>
          </View>

          {hasBaseline && (
            <View style={styles.baselineBadge}>
              <View style={styles.baselineDot} />
              <Text style={styles.baselineText}>Baseline included</Text>
            </View>
          )}
        </View>
      </View>

      {/* Table View */}
      {currentView === 'table' && (
        <>
          <View style={styles.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View style={{minWidth: Math.max(tableWidth, containerWidth - 32)}}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <TouchableOpacity
                    style={[styles.headerCell, {width: buildCycleColWidth}]}
                    onPress={() => handleSort('buildCycle')}>
                    <Text style={styles.headerCellText}>
                      BUILD CYCLE{getSortIndicator('buildCycle')}
                    </Text>
                  </TouchableOpacity>

                  {hasBaseline && (
                    <View style={[styles.headerCell, styles.baselineHeader, {width: baselineColWidth}]}>
                      <Text style={styles.baselineHeaderText}>BASELINE</Text>
                    </View>
                  )}

                  {techList.map(tech => (
                    <TouchableOpacity
                      key={tech}
                      style={[styles.headerCell, {width: techColWidth}]}
                      onPress={() => handleSort(tech)}>
                      <View style={[styles.techBadge, getTechBadgeStyle(tech)]}>
                        <Text style={[styles.techBadgeText, {color: getTechTextColor(tech)}]}>
                          {shortenTech(tech)}
                        </Text>
                      </View>
                      <Text style={styles.sortIndicator}>{getSortIndicator(tech)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Table Body */}
                <ScrollView style={styles.tableBody} nestedScrollEnabled>
                  {buildCycles.map((bc, idx) => (
                    <View
                      key={bc}
                      style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
                      <View style={[styles.cell, {width: buildCycleColWidth}]}>
                        <Text style={styles.cellTextBold}>{bc}</Text>
                      </View>

                      {hasBaseline && (
                        <View style={[styles.cell, styles.baselineCell, {width: baselineColWidth}]}>
                          <Text style={styles.baselineCellText}>
                            {formatValue(getBaseline(bc))}
                          </Text>
                        </View>
                      )}

                      {techList.map(tech => {
                        const cell = pivotData[bc]?.[tech];
                        const isSelected = cell?.status?.includes('Selected');
                        return (
                          <View
                            key={tech}
                            style={[
                              styles.cell,
                              {width: techColWidth},
                              isSelected && styles.selectedCell,
                            ]}>
                            <Text
                              style={[
                                styles.cellTextMono,
                                isSelected && styles.selectedCellText,
                              ]}>
                              {formatValue(cell?.value)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={styles.legendBoxSelected} />
              <Text style={styles.legendText}>Selected Technology</Text>
            </View>
            {hasBaseline && (
              <View style={styles.legendItem}>
                <View style={styles.legendBoxBaseline} />
                <Text style={styles.legendText}>Baseline</Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* Chart View */}
      {currentView === 'chart' && (
        <View style={styles.chartContainer}>
          {isNumericMetric && chartData && chartBounds ? (
            <View style={styles.chartContent}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>{selectedMetric}</Text>
                  <Text style={styles.chartSubtitle}>
                    {metricInfo?.u ? `Units: ${metricInfo.u}` : ''}
                  </Text>
                </View>
                {/* Chart Type Toggle */}
                <View style={styles.chartTypeToggle}>
                  <TouchableOpacity
                    style={[styles.chartTypeButton, chartType === 'line' && styles.chartTypeButtonActive]}
                    onPress={() => setChartType('line')}>
                    <Text style={[styles.chartTypeButtonText, chartType === 'line' && styles.chartTypeButtonTextActive]}>
                      Line
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chartTypeButton, chartType === 'bar' && styles.chartTypeButtonActive]}
                    onPress={() => setChartType('bar')}>
                    <Text style={[styles.chartTypeButtonText, chartType === 'bar' && styles.chartTypeButtonTextActive]}>
                      Bar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bar Chart */}
              {chartType === 'bar' && (
                <View style={styles.barChartWrapper}>
                  <View style={styles.barChartRow}>
                    {/* Y-axis title (rotated) */}
                    <View style={styles.yAxisTitleContainer}>
                      <Text style={styles.yAxisTitle}>
                        {selectedMetric}{metricInfo?.u ? ` (${metricInfo.u})` : ''}
                      </Text>
                    </View>

                    {/* Y-axis labels */}
                    <View style={styles.yAxisLabelsBar}>
                      {[5, 4, 3, 2, 1, 0].map(i => (
                        <Text key={i} style={styles.yAxisLabel}>
                          {formatAxisValue((i / 5) * chartBounds.range)}
                        </Text>
                      ))}
                    </View>

                    {/* Chart area */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollArea}>
                      <View style={styles.barsContainer}>
                        {/* Grid lines */}
                        <View style={styles.barGridLines}>
                          {[0, 1, 2, 3, 4, 5].map(i => (
                            <View key={i} style={styles.barGridLine} />
                          ))}
                        </View>

                        {/* Y-axis line */}
                        <View style={styles.barYAxisLine} />

                        {/* X-axis line */}
                        <View style={styles.barXAxisLine} />

                        {/* Bars for each build cycle */}
                        {buildCycles.map(bc => (
                          <View key={bc} style={styles.barGroup}>
                            <View style={styles.barsRow}>
                              {techList.map(tech => {
                                const value = pivotData[bc]?.[tech]?.value;
                                const shortName = shortenTech(tech);
                                const color = techColors[shortName]?.text || '#94a3b8';
                                const heightPercent =
                                  value != null && chartBounds.range > 0
                                    ? (value / chartBounds.range) * 100
                                    : 0;

                                return (
                                  <View key={tech} style={styles.barWrapper}>
                                    <View
                                      style={[
                                        styles.bar,
                                        {
                                          height: `${Math.max(heightPercent, 0)}%`,
                                          backgroundColor: color,
                                        },
                                      ]}
                                    />
                                  </View>
                                );
                              })}
                            </View>
                            <Text style={styles.barXAxisLabel}>{bc}</Text>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* X-axis title */}
                  <Text style={styles.xAxisTitle}>Build Cycle</Text>
                </View>
              )}

              {/* Line Chart */}
              {chartType === 'line' && (
                <View style={styles.lineChartWrapper}>
                  <View style={styles.lineChartRow}>
                    {/* Y-axis title (rotated) */}
                    <View style={styles.yAxisTitleContainer}>
                      <Text style={styles.yAxisTitle}>
                        {selectedMetric}{metricInfo?.u ? ` (${metricInfo.u})` : ''}
                      </Text>
                    </View>

                    {/* Y-axis labels */}
                    <View style={styles.yAxisLabelsLine}>
                      {[5, 4, 3, 2, 1, 0].map(i => (
                        <Text key={i} style={styles.yAxisLabel}>
                          {formatAxisValue((i / 5) * chartBounds.range)}
                        </Text>
                      ))}
                    </View>

                    {/* Chart area */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollArea}>
                      <View style={[styles.lineChartContainer, {width: buildCycles.length * 80}]}>
                        {/* Horizontal grid lines */}
                        {[0, 1, 2, 3, 4, 5].map(i => (
                          <View
                            key={`hgrid-${i}`}
                            style={[
                              styles.lineGridLineH,
                              {top: i * (276 / 5)},
                            ]}
                          />
                        ))}

                        {/* Y-axis line */}
                        <View style={styles.yAxisLine} />

                        {/* X-axis line */}
                        <View style={styles.xAxisLine} />

                        {/* Lines and points for each tech */}
                        {techList.map(tech => {
                          const shortName = shortenTech(tech);
                          const color = techColors[shortName]?.text || '#94a3b8';
                          const points = buildCycles.map((bc, idx) => {
                            const value = pivotData[bc]?.[tech]?.value;
                            const y = value != null && chartBounds.range > 0
                              ? (1 - value / chartBounds.range) * 276
                              : 276;
                            const x = idx * 80 + 40;
                            return {x, y, value, bc};
                          });

                          return (
                            <View key={tech} style={styles.lineChartLayer}>
                              {/* Connecting lines */}
                              {points.map((point, idx) => {
                                if (idx === 0) return null;
                                const prev = points[idx - 1];
                                if (prev.value == null || point.value == null) return null;

                                const dx = point.x - prev.x;
                                const dy = point.y - prev.y;
                                const length = Math.sqrt(dx * dx + dy * dy);
                                const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                                return (
                                  <View
                                    key={`line-${idx}`}
                                    style={[
                                      styles.lineSegment,
                                      {
                                        width: length,
                                        backgroundColor: color,
                                        left: prev.x,
                                        top: prev.y,
                                        transform: [{rotate: `${angle}deg`}],
                                      },
                                    ]}
                                  />
                                );
                              })}
                              {/* Data points */}
                              {points.map((point, idx) => {
                                if (point.value == null) return null;
                                return (
                                  <View
                                    key={`point-${idx}`}
                                    style={[
                                      styles.dataPoint,
                                      {
                                        left: point.x - 5,
                                        top: point.y - 5,
                                        backgroundColor: color,
                                      },
                                    ]}
                                  />
                                );
                              })}
                            </View>
                          );
                        })}

                        {/* X-axis value labels */}
                        <View style={styles.lineChartXAxis}>
                          {buildCycles.map((bc, idx) => (
                            <Text key={bc} style={[styles.xAxisLabel, {width: 80, textAlign: 'center'}]}>
                              {bc}
                            </Text>
                          ))}
                        </View>
                      </View>
                    </ScrollView>
                  </View>

                  {/* X-axis title */}
                  <Text style={styles.xAxisTitle}>Build Cycle</Text>
                </View>
              )}

              {/* Legend */}
              <View style={styles.chartLegend}>
                {techList.map(tech => {
                  const shortName = shortenTech(tech);
                  const color = techColors[shortName]?.text || '#94a3b8';
                  return (
                    <View key={tech} style={styles.chartLegendItem}>
                      <View style={[styles.chartLegendBox, {backgroundColor: color}]} />
                      <Text style={styles.chartLegendText}>{shortName}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.chartNotAvailable}>
              <Text style={styles.chartNotAvailableIcon}>⚠</Text>
              <Text style={styles.chartNotAvailableTitle}>Chart Not Available</Text>
              <Text style={styles.chartNotAvailableText}>
                This metric contains non-numeric data.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Footer with toggle */}
      {onToggleDetailedResults && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.detailedToggle, showDetailedResults && styles.detailedToggleActive]}
            onPress={onToggleDetailedResults}>
            <View style={[styles.toggleSwitch, showDetailedResults && styles.toggleSwitchActive]}>
              <View style={[styles.toggleKnob, showDetailedResults && styles.toggleKnobActive]} />
            </View>
            <Text style={[styles.detailedToggleText, showDetailedResults && styles.detailedToggleTextActive]}>
              Show Other Results Table
            </Text>
          </TouchableOpacity>
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
  },
  detailedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailedToggleActive: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  toggleSwitch: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(100, 116, 139, 0.5)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#94a3b8',
  },
  toggleKnobActive: {
    backgroundColor: '#60a5fa',
    alignSelf: 'flex-end',
  },
  detailedToggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  detailedToggleTextActive: {
    color: colors.blue,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  viewButtonDisabled: {
    opacity: 0.5,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  viewButtonTextActive: {
    color: colors.blue,
  },
  viewButtonTextDisabled: {
    color: colors.textQuaternary,
  },
  controlsPanel: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    flexWrap: 'wrap',
  },
  metricSelector: {
    flex: 1,
    minWidth: 300,
    position: 'relative',
    zIndex: 10,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.amber,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  dropdownArrow: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 300,
    zIndex: 100,
  },
  dropdownScroll: {
    flex: 1,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.3)',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dropdownItemTextActive: {
    color: colors.blue,
    fontWeight: '600',
  },
  unitsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  unitsLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  unitsValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.blue,
  },
  baselineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  baselineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a855f7',
  },
  baselineText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#c4b5fd',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerCellText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.amber,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  baselineHeader: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  baselineHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c4b5fd',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  techBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  techBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sortIndicator: {
    fontSize: 10,
    color: colors.textQuaternary,
    marginTop: 4,
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  tableRowEven: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
  },
  cell: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellTextBold: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cellTextMono: {
    fontSize: 14,
    color: colors.textTertiary,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  baselineCell: {
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
  },
  baselineCellText: {
    fontSize: 14,
    color: '#c4b5fd',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  selectedCell: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  selectedCellText: {
    color: '#34d399',
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBoxSelected: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: 'rgba(52, 211, 153, 0.3)',
    borderWidth: 1,
    borderColor: '#34d399',
  },
  legendBoxBaseline: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  legendText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 24,
  },
  chartContent: {
    flex: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  chartTypeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chartTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  chartTypeButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  chartTypeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  chartTypeButtonTextActive: {
    color: colors.blue,
  },
  barChartWrapper: {
    height: 420,
  },
  barChartRow: {
    flexDirection: 'row',
    height: 340,
  },
  yAxisLabelsBar: {
    width: 60,
    height: 280,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  lineChartWrapper: {
    height: 420,
  },
  lineChartRow: {
    flexDirection: 'row',
    height: 340,
  },
  yAxisTitleContainer: {
    width: 24,
    height: 276,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yAxisTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    transform: [{rotate: '-90deg'}],
    width: 200,
    textAlign: 'center',
  },
  xAxisTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 8,
    marginLeft: 80,
  },
  yAxisLabels: {
    width: 60,
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingBottom: 24,
  },
  yAxisLabelsLine: {
    width: 60,
    height: 280,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  chartScrollArea: {
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 340,
    paddingBottom: 40,
    position: 'relative',
  },
  barGridLines: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 276,
    justifyContent: 'space-between',
  },
  barGridLine: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  barYAxisLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 276,
    width: 2,
    backgroundColor: '#64748b',
  },
  barXAxisLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 276,
    height: 2,
    backgroundColor: '#64748b',
  },
  barXAxisLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 8,
  },
  gridLines: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 24,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  barGroup: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 276,
    gap: 2,
  },
  barWrapper: {
    width: 12,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    minHeight: 2,
  },
  xAxisLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 4,
  },
  lineChartContainer: {
    height: 340,
    position: 'relative',
    minWidth: 100,
  },
  lineChartLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 276,
  },
  lineGridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  yAxisLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 276,
    width: 2,
    backgroundColor: '#64748b',
  },
  xAxisLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 276,
    height: 2,
    backgroundColor: '#64748b',
  },
  lineChartXAxis: {
    position: 'absolute',
    top: 290,
    left: 0,
    flexDirection: 'row',
  },
  lineSegment: {
    position: 'absolute',
    height: 2.5,
    transformOrigin: 'left center',
  },
  dataPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(15, 23, 42, 0.8)',
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartLegendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  chartLegendText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chartNotAvailable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  chartNotAvailableIcon: {
    fontSize: 48,
    color: colors.textQuaternary,
    marginBottom: 16,
  },
  chartNotAvailableTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  chartNotAvailableText: {
    fontSize: 14,
    color: colors.textQuaternary,
  },
});
