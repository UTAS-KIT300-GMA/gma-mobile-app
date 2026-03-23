import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface VerifyUIProps {
  code: string;
  onKeyPress: (val: string) => void;
  onResend: () => void;
  onLogout: () => void; 
  email: string;
  loading?: boolean;
}

export const VerifyUI: React.FC<VerifyUIProps> = ({ 
  code, 
  onKeyPress, 
  onResend, 
  onLogout, 
  email, 
  loading 
}) => {
  const dots = code.padEnd(5, ' ').split('').slice(0, 5);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.topSection} edges={['top']}>
        {/* Logout Button in Top Left */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} disabled={loading}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Cancel</Text>
        </TouchableOpacity>

        <Ionicons name="paper-plane-outline" size={80} color="white" />
        <Text style={styles.title}>Confirm Verification</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="white" size="large" />
            <Text style={styles.loadingText}>Checking status...</Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>
            We sent a link to {"\n"}<Text style={styles.boldEmail}>{email}</Text>
            {"\n\n"}Click the link in the email, then enter any 5 digits here to continue.
          </Text>
        )}

        <View style={styles.codeRow}>
          {dots.map((char, i) => (
            <View key={i} style={styles.codeBox}>
              <Text style={styles.codeText}>{char.trim()}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={onResend} disabled={loading}>
          <Text style={styles.resendLink}>Resend link</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '<'].map((key, i) => (
          <TouchableOpacity 
            key={i} 
            style={styles.key} 
            onPress={() => key !== '' && onKeyPress(key)}
            disabled={loading}
          >
            {key === '<' ? (
              <Ionicons name="backspace-outline" size={24} color="#333" />
            ) : (
              <Text style={styles.keyText}>{key}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#9D246E' },
  topSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  logoutBtn: { position: 'absolute', top: 20, left: 20, flexDirection: 'row', alignItems: 'center' },
  logoutText: { color: 'white', marginLeft: 5, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 20 },
  loadingContainer: { marginTop: 20, alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 10, fontSize: 14, opacity: 0.9 },
  subtitle: { color: 'white', textAlign: 'center', marginTop: 10, opacity: 0.8, lineHeight: 20 },
  boldEmail: { fontWeight: 'bold', opacity: 1 },
  codeRow: { flexDirection: 'row', gap: 12, marginVertical: 40 },
  codeBox: { width: 50, height: 65, backgroundColor: 'white', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  codeText: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  resendLink: { color: 'white', textDecorationLine: 'underline', marginTop: 10 },
  keypad: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, flexDirection: 'row', flexWrap: 'wrap', padding: 20, paddingBottom: 40 },
  key: { width: '33.3%', height: 70, justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: 28, color: '#333', fontWeight: '500' },
});