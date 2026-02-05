import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export type TokenOption = {
  mint: string;
  symbol: string;
  balance?: number;
  decimals?: number;
};

type Props = {
  label: string;
  tokens: TokenOption[];
  selected: TokenOption | null;
  onSelect: (token: TokenOption) => void;
};

export function TokenSelector({ label, tokens, selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={styles.selector}>
        <Text style={styles.selectorText}>{selected ? `${selected.symbol}` : 'Select token'}</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select token</Text>
            <ScrollView>
              {tokens.map((token) => (
                <Pressable
                  key={token.mint}
                  onPress={() => {
                    onSelect(token);
                    setOpen(false);
                  }}
                  style={styles.tokenRow}
                >
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  <Text style={styles.tokenMeta}>{token.balance?.toFixed(4) ?? '0.0000'}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={() => setOpen(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  label: {
    color: '#6b7280',
    fontWeight: '600'
  },
  selector: {
    borderWidth: 1,
    borderColor: '#facc15',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff'
  },
  selectorText: {
    color: '#374151'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '60%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  tokenSymbol: {
    fontWeight: '600'
  },
  tokenMeta: {
    color: '#6b7280'
  },
  closeButton: {
    marginTop: 12,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#7c3aed'
  },
  closeText: {
    color: '#ffffff',
    fontWeight: '600'
  }
});
