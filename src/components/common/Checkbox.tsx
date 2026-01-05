import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import { colors } from '../../styles/colors';

interface CheckboxProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Checkbox({label, value, onValueChange}: CheckboxProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onValueChange(!value)}>
      <View style={[styles.box, value && styles.boxChecked]}>
        {value && <Text style={styles.check}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  box: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 3,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  check: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 13,
    color: '#cbd5e1',
    flex: 1,
  },
});
