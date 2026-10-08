import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { register } from '../api/auth';
import Screen from '../components/Screen';
import { common, colors } from '../theme';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setCanRetry(false);
    setSuccess('');
    if (fullName.trim().length < 2) {
      setError('Enter your full name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await register({ fullName: fullName.trim(), email: email.trim().toLowerCase(), password });
      setSuccess('Account created. You can now sign in.');
      setTimeout(() => navigation.navigate('Login'), 700);
    } catch (submitError) {
      setError(submitError.message || 'Unable to create your account. Please try again.');
      setCanRetry(!submitError.status || submitError.status >= 500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
          <Text style={common.title}>Create account</Text>
          <Text style={common.subtitle}>Get started with your project workspace.</Text>
          <Text style={common.label}>Full name</Text>
          <TextInput autoComplete="name" onChangeText={setFullName} placeholder="Your name" placeholderTextColor={colors.muted} style={common.input} value={fullName} />
          <Text style={common.label}>Email</Text>
          <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.muted} style={common.input} value={email} />
          <Text style={common.label}>Password</Text>
          <TextInput autoComplete="new-password" onChangeText={setPassword} placeholder="At least 8 characters" placeholderTextColor={colors.muted} secureTextEntry style={common.input} value={password} />
          {!!error && <Text accessibilityRole="alert" style={{ color: colors.danger, marginBottom: 14 }}>{error}</Text>}
          {!!success && <Text accessibilityRole="alert" style={{ color: colors.success, marginBottom: 14 }}>{success}</Text>}
          {canRetry && (
            <TouchableOpacity onPress={handleSubmit} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Retry</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity accessibilityRole="button" disabled={submitting} onPress={handleSubmit} style={[common.button, submitting && { opacity: 0.65 }]}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={common.buttonText}>Create account</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
