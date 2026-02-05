import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  color?: string;
};

export function PrimaryButton({ label, onPress, style, disabled, color }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        color ? { backgroundColor: color } : null,
        disabled ? styles.disabled : null,
        style
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#facc15'
  },
  disabled: {
    backgroundColor: '#6b7280'
  },
  label: {
    color: '#ffffff',
    fontWeight: '600'
  }
});
