import React from 'react';
import {TextInput, View, Text, StyleSheet} from 'react-native';
import { colors } from '../../styles/colors';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  inputType?: 'text' | 'integer' | 'decimal';
  editable?: boolean;
}

export function InputField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType = 'default',
  inputType = 'text',
  editable = true,
}: InputFieldProps) {
  const handleChangeText = (text: string) => {
    let filteredText = text;

    if (inputType === 'integer') {
      // Only allow digits
      filteredText = text.replace(/[^0-9]/g, '');
    } else if (inputType === 'decimal') {
      // Allow digits and one decimal point
      // First, remove all non-numeric characters except decimal point
      filteredText = text.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      const parts = filteredText.split('.');
      if (parts.length > 2) {
        filteredText = parts[0] + '.' + parts.slice(1).join('');
      }
    }

    onChangeText(filteredText);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={handleChangeText}
        onBlur={onBlur}
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
