import React from 'react';
import {TextInput, View, Text, StyleSheet} from 'react-native';
import { colors } from '../../styles/colors';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  editable?: boolean;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = true,
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        editable={editable}
      />
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
    input: {
        borderWidth: 1,
        borderColor: 'rgba(71, 85, 105, 0.5)',
        borderRadius: 4,
        padding: 10,
        fontSize: 14,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        color: colors.text,
    },
    inputDisabled: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        color: colors.textQuaternary,
    },
});
