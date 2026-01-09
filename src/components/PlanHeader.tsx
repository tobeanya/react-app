import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {ExpansionPlan, SolverStatusType, SAMPLE_STUDIES} from '../types';
import {colors} from '../styles/colors';

interface PlanHeaderProps {
  expansionPlans: ExpansionPlan[];
  selectedPlan: ExpansionPlan | null;
  solverStatus: SolverStatusType;
  onSelectPlan: (id: string) => void;
}

export function PlanHeader({
  expansionPlans,
  selectedPlan,
  solverStatus,
  onSelectPlan,
}: PlanHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const handleSelectPlan = useCallback((id: string) => {
    onSelectPlan(id);
    setShowDropdown(false);
  }, [onSelectPlan]);

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  // Get source study name
  const getStudyName = (studyId: string | undefined) => {
    if (!studyId) return '-';
    const study = SAMPLE_STUDIES.find(s => s.id === studyId);
    return study?.name || '-';
  };

  // Get status display config
  const getStatusConfig = (status: SolverStatusType) => {
    switch (status) {
      case 'running':
        return {label: 'Running', color: '#10b981', dotStyle: styles.statusDotFilled};
      case 'paused':
        return {label: 'Paused', color: '#f59e0b', dotStyle: styles.statusDotFilled};
      case 'finished':
        return {label: 'Finished', color: '#60a5fa', dotStyle: styles.statusDotFilled};
      case 'error':
        return {label: 'Error', color: '#ef4444', dotStyle: styles.statusDotFilled};
      case 'inactive':
      default:
        return {label: 'Inactive', color: '#94a3b8', dotStyle: styles.statusDotEmpty};
    }
  };

  const statusConfig = getStatusConfig(solverStatus);

  if (!selectedPlan) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.planSelector} onPress={toggleDropdown}>
            <Text style={styles.planSelectorText}>Select a plan...</Text>
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
            <View style={[styles.statusDot, styles.statusDotEmpty]} />
            <Text style={[styles.statusText, {color: '#94a3b8'}]}>Inactive</Text>
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
                {expansionPlans.length === 0 ? (
                  <View style={styles.dropdownEmpty}>
                    <Text style={styles.dropdownEmptyText}>No plans available</Text>
                  </View>
                ) : (
                  expansionPlans.map(plan => (
                    <TouchableOpacity
                      key={plan.id}
                      style={styles.dropdownItem}
                      onPress={() => handleSelectPlan(plan.id)}>
                      <Text style={styles.dropdownItemText}>{plan.name}</Text>
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

  const studyName = getStudyName(selectedPlan.sourceStudyId);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Plan Selector Dropdown */}
        <TouchableOpacity style={styles.planSelector} onPress={toggleDropdown}>
          <Text style={styles.planSelectorText} numberOfLines={1}>
            {selectedPlan.name}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.middleContent}>
          {/* Source Study */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Source Study:</Text>
            <Text style={styles.infoText} numberOfLines={1}>
              {studyName}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Region */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Assessment Region:</Text>
            <View style={styles.regionBadge}>
              <Text style={styles.regionText}>{selectedPlan.region}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Planning Horizon */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Planning Horizon:</Text>
            <Text style={styles.horizonText}>
              {selectedPlan.planningHorizonStart}-{selectedPlan.planningHorizonEnd}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Solver Status */}
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
              {expansionPlans.map(plan => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.dropdownItem,
                    plan.id === selectedPlan.id && styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleSelectPlan(plan.id)}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      plan.id === selectedPlan.id && styles.dropdownItemTextSelected,
                    ]}>
                    {plan.name}
                  </Text>
                  {plan.id === selectedPlan.id && (
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
    borderBottomColor: 'rgba(59, 130, 246, 0.3)',
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
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 180,
    maxWidth: 220,
  },
  planSelectorText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
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
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  regionText: {
    color: '#60a5fa',
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
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: 6,
    minWidth: 220,
    maxWidth: 300,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  dropdownScroll: {
    maxHeight: 250,
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
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  dropdownItemText: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#60a5fa',
    fontWeight: '500',
  },
  dropdownCheck: {
    color: '#60a5fa',
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
