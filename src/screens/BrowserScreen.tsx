import React, { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';

export function BrowserScreen() {
  const webviewRef = useRef<WebView>(null);
  const [url, setUrl] = useState('https://jup.ag');
  const [currentUrl, setCurrentUrl] = useState('https://jup.ag');

  const handleGo = () => {
    setCurrentUrl(url);
  };

  const handleMessage = (event: any) => {
    const message = event.nativeEvent.data;
    Alert.alert('MWA/WalletConnect', `Incoming request: ${message}`, [
      { text: 'Reject', style: 'cancel' },
      { text: 'Approve', onPress: () => Alert.alert('Approved', 'Manual approval only.') }
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.toolbar} horizontal>
        <View style={styles.inputWrapper}>
          <TextField value={url} onChangeText={setUrl} placeholder="https://" />
        </View>
        <PrimaryButton label="Go" onPress={handleGo} style={styles.goButton} />
      </ScrollView>
      <Text style={styles.helper}>Manual approval required for any transaction requests.</Text>
      <WebView
        ref={webviewRef}
        source={{ uri: currentUrl }}
        onMessage={handleMessage}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        cacheEnabled
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    gap: 8,
    backgroundColor: '#ffffff'
  },
  toolbar: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  inputWrapper: {
    flex: 1,
    minWidth: 240
  },
  goButton: {
    minWidth: 80
  },
  helper: {
    color: '#6b7280',
    fontSize: 12
  },
  webview: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden'
  }
});
