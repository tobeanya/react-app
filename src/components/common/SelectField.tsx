import React, {useRef} from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import { colors } from '../../styles/colors';

interface SelectFieldProps {
  label: string;
  value: string;
  displayValue?: string;
  onPress: (event: any) => void;
  disabled?: boolean;
}

export function SelectField({label, value, displayValue, onPress, disabled}: SelectFieldProps) {
  const buttonRef = useRef<View>(null);

  const handlePress = (e: any) => {
    // Measure the button's position relative to the window
    if (buttonRef.current) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        // Create an event-like object with the measured position
        // Position dropdown directly below the button
        const measuredEvent = {
          nativeEvent: {
            pageX: pageX,
            pageY: pageY + height, // Position below the button
          },
        };
        onPress(measuredEvent);
      });
    } else {
      onPress(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        ref={buttonRef}
        style={[styles.selectButton, disabled && styles.selectButtonDisabled]}
        onPress={handlePress}
        disabled={disabled}>
        <Text style={[styles.selectText, disabled && {color: '#999'}]} numberOfLines={1}>
          {displayValue || value || 'Select...'}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 4,
    padding: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  selectButtonDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  selectText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  arrow: {
    fontSize: 10,
    color: colors.textQuaternary,
    marginLeft: 8,
  },
});
