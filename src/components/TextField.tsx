import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
};

export function TextField({ value, onChangeText, placeholder, multiline, numberOfLines }: Props) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        style={[styles.input, multiline ? styles.multiline : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff'
  },
  input: {
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827'
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top'
  }
});
