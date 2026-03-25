import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface VerifyUIProps {
  onResend: () => void;
  onLogout: () => void; 
  email: string;
  loading?: boolean;
}

export const VerifyUI: React.FC<VerifyUIProps> = ({  
  onResend, 
  onLogout, 
  email, 
  loading 
}) => {
 

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.topSection} edges={['top']}>
        {/* Logout Button in Top Left */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} disabled={loading}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Cancel</Text>
        </TouchableOpacity>

        <Ionicons name="paper-plane-outline" size={80} color="white" />
        <Text style={styles.title}>Check your email</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="white" size="large" />
            <Text style={styles.loadingText}>Verifying link...</Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>
            We sent a link to {"\n"}<Text style={styles.boldEmail}>{email}</Text>
          </Text>
        )}
        <TouchableOpacity onPress={onResend} disabled={loading}>
          <Text style={styles.resendLink}>Resend link</Text>
        </TouchableOpacity>
      </SafeAreaView>
  
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
  resendLink: { color: 'white', textDecorationLine: 'underline', marginTop: 10 },
});