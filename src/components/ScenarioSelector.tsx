import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useDatabaseScenarios} from '../hooks';
import {DatabaseScenario, getScenarioStatusColor, getRegionColor} from '../data/mockScenarios';
import {colors} from '../styles/colors';

interface ScenarioSelectorProps {
  selectedScenarioId: number | null;
  onSelectScenario: (id: number | null) => void;
  disabled?: boolean;
}

export function ScenarioSelector({
  selectedScenarioId,
  onSelectScenario,
  disabled = false,
}: ScenarioSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const {scenarios, isLoading, isUsingMockData} = useDatabaseScenarios();

  const selectedScenario = scenarios.find(s => s.epScenarioId === selectedScenarioId);

  const toggleDropdown = useCallback(() => {
    if (!disabled) {
      setShowDropdown(prev => !prev);
    }
  }, [disabled]);

  const handleSelectScenario = useCallback((id: number) => {
    onSelectScenario(id);
    setShowDropdown(false);
  }, [onSelectScenario]);

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  // Get status display config
  const getStatusConfig = (status: string | undefined) => {
    switch (status) {
      case 'completed':
        return {label: 'Completed', color: '#10b981', dotStyle: styles.statusDotFilled};
      case 'running':
        return {label: 'Running', color: '#f59e0b', dotStyle: styles.statusDotFilled};
      case 'pending':
        return {label: 'Pending', color: '#94a3b8', dotStyle: styles.statusDotEmpty};
      default:
        return {label: 'Unknown', color: '#94a3b8', dotStyle: styles.statusDotEmpty};
    }
  };

  const statusConfig = selectedScenario ? getStatusConfig(selectedScenario.status) : getStatusConfig(undefined);

  if (!selectedScenario) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.planSelector, disabled && styles.planSelectorDisabled]}
            onPress={toggleDropdown}
            disabled={disabled}>
            <Text style={styles.planSelectorPlaceholder}>Select a plan...</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <Text style={styles.infoText}>-</Text>
          <View style={styles.divider} />
          <View style={styles.regionBadge}>
            <Text style={styles.regionText}>-</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.infoText}>-</Text>
          <View style={styles.divider} />
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, styles.statusDotEmpty, {borderColor: '#94a3b8'}]} />
            <Text style={[styles.statusText, {color: '#94a3b8'}]}>-</Text>
          </View>
          {/* Data source indicator */}
          <View style={styles.dataSourceContainer}>
            <View style={[
              styles.dataSourceBadge,
              isUsingMockData ? styles.dataSourceBadgeDemo : styles.dataSourceBadgeLive,
            ]}>
              <View style={[
                styles.dataSourceDot,
                isUsingMockData ? styles.dataSourceDotDemo : styles.dataSourceDotLive,
              ]} />
              <Text style={[
                styles.dataSourceText,
                isUsingMockData ? styles.dataSourceTextDemo : styles.dataSourceTextLive,
              ]}>
                {isUsingMockData ? 'Demo' : 'Live'}
              </Text>
            </View>
          </View>
        </View>

        {/* Dropdown */}
        {showDropdown && (
          <View style={styles.dropdownOverlay}>
            <TouchableOpacity
              style={styles.dropdownBackdrop}
              activeOpacity={1}
              onPress={closeDropdown}
            />
            <View style={styles.dropdownMenu}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {scenarios.length === 0 ? (
                  <View style={styles.dropdownEmpty}>
                    <Text style={styles.dropdownEmptyText}>No plans available</Text>
                  </View>
                ) : (
                  scenarios.map(scenario => (
                    <TouchableOpacity
                      key={scenario.epScenarioId}
                      style={styles.dropdownItem}
                      onPress={() => handleSelectScenario(scenario.epScenarioId)}>
                      <Text style={styles.dropdownItemText}>{scenario.epScenarioDescription}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    );
  }

  const regionColors = getRegionColor(selectedScenario.region);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Plan Selector Dropdown */}
        <TouchableOpacity
          style={[styles.planSelector, disabled && styles.planSelectorDisabled]}
          onPress={toggleDropdown}
          disabled={disabled}>
          <Text style={styles.planSelectorText} numberOfLines={1}>
            {selectedScenario.epScenarioDescription}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.middleContent}>
          {/* Region */}
          {selectedScenario.region && (
            <>
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Region:</Text>
                <View style={[styles.regionBadge, {backgroundColor: regionColors.bg, borderColor: regionColors.border}]}>
                  <Text style={[styles.regionText, {color: regionColors.text}]}>{selectedScenario.region}</Text>
                </View>
              </View>
              <View style={styles.divider} />
            </>
          )}

          {/* Planning Horizon */}
          {selectedScenario.planningHorizonStart && selectedScenario.planningHorizonEnd && (
            <>
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Planning Horizon:</Text>
                <Text style={styles.horizonText}>
                  {selectedScenario.planningHorizonStart}-{selectedScenario.planningHorizonEnd}
                </Text>
              </View>
              <View style={styles.divider} />
            </>
          )}

          {/* Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.infoLabel}>Status:</Text>
            <View
              style={[
                styles.statusDot,
                statusConfig.dotStyle,
                {backgroundColor: statusConfig.dotStyle === styles.statusDotFilled ? statusConfig.color : 'transparent'},
                statusConfig.dotStyle === styles.statusDotEmpty && {borderColor: statusConfig.color},
              ]}
            />
            <Text style={[styles.statusText, {color: statusConfig.color}]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Data source indicator */}
        <View style={styles.dataSourceContainer}>
          <View style={[
            styles.dataSourceBadge,
            isUsingMockData ? styles.dataSourceBadgeDemo : styles.dataSourceBadgeLive,
          ]}>
            <View style={[
              styles.dataSourceDot,
              isUsingMockData ? styles.dataSourceDotDemo : styles.dataSourceDotLive,
            ]} />
            <Text style={[
              styles.dataSourceText,
              isUsingMockData ? styles.dataSourceTextDemo : styles.dataSourceTextLive,
            ]}>
              {isUsingMockData ? 'Demo' : 'Live'}
            </Text>
          </View>
        </View>
      </View>

      {/* Dropdown Menu */}
      {showDropdown && (
        <View style={styles.dropdownOverlay}>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            activeOpacity={1}
            onPress={closeDropdown}
          />
          <View style={styles.dropdownMenu}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {scenarios.map(scenario => (
                <TouchableOpacity
                  key={scenario.epScenarioId}
                  style={[
                    styles.dropdownItem,
                    scenario.epScenarioId === selectedScenarioId && styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleSelectScenario(scenario.epScenarioId)}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      scenario.epScenarioId === selectedScenarioId && styles.dropdownItemTextSelected,
                    ]}>
                    {scenario.epScenarioDescription}
                  </Text>
                  {scenario.epScenarioId === selectedScenarioId && (
                    <Text style={styles.dropdownCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 211, 153, 0.3)',
    position: 'relative',
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  middleContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  planSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 180,
    maxWidth: 280,
  },
  planSelectorDisabled: {
    opacity: 0.5,
  },
  planSelectorText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  planSelectorPlaceholder: {
    flex: 1,
    color: colors.textTertiary,
    fontSize: 13,
  },
  dropdownArrow: {
    color: colors.textTertiary,
    fontSize: 10,
    marginLeft: 8,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(71, 85, 105, 0.5)',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  infoLabel: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 13,
    flexShrink: 1,
  },
  regionBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  regionText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  horizonText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotFilled: {
    // backgroundColor set dynamically
  },
  statusDotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Data source indicator
  dataSourceContainer: {
    marginLeft: 'auto',
  },
  dataSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    gap: 4,
  },
  dataSourceBadgeDemo: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  dataSourceBadgeLive: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  dataSourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dataSourceDotDemo: {
    backgroundColor: '#fbbf24',
  },
  dataSourceDotLive: {
    backgroundColor: '#34d399',
  },
  dataSourceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dataSourceTextDemo: {
    color: '#fbbf24',
  },
  dataSourceTextLive: {
    color: '#34d399',
  },
  // Dropdown styles
  dropdownOverlay: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    bottom: -500,
    zIndex: 1000,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 0,
    left: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    borderRadius: 6,
    minWidth: 280,
    maxWidth: 400,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  dropdownItemText: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#34d399',
    fontWeight: '500',
  },
  dropdownCheck: {
    color: '#34d399',
    fontSize: 14,
    marginLeft: 8,
  },
  dropdownEmpty: {
    padding: 16,
    alignItems: 'center',
  },
  dropdownEmptyText: {
    color: colors.textQuaternary,
    fontSize: 13,
  },
});
