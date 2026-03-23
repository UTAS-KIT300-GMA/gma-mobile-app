import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

interface Props {
  onLogin: (email: string, pass: string) => void;
  loading: boolean;
  // ADD THESE TWO LINES:
  onRegisterPress: () => void;
  onForgotPress: () => void;
}

export const LoginScreen = ({ onLogin, loading, onRegisterPress, onForgotPress }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      {/* ... your logo/title ... */}
      
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        style={styles.input}
        autoCapitalize="none"
      />
      
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        style={styles.input}
      />

      <TouchableOpacity onPress={() => onLogin(email, password)} style={styles.button}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      {/* New Navigation Links */}
      <TouchableOpacity onPress={onForgotPress} style={styles.link}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onRegisterPress} style={styles.link}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 10 },
  button: { backgroundColor: '#9D246E', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  link: { marginTop: 15, alignItems: 'center' },
  linkText: { color: '#9D246E', fontWeight: '600' }
});