import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import Screen from '../components/Screen';
import { common, colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const { signIn, sessionExpired, clearSessionExpired, startupError, clearStartupError, retrySession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [canRetrySubmit, setCanRetrySubmit] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setCanRetrySubmit(false);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    clearSessionExpired();
    clearStartupError();
    setSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to sign in. Please try again.');
      setCanRetrySubmit(submitError instanceof ApiError && (!submitError.status || submitError.status >= 500));
    } finally {
      setSubmitting(false);
    }
  };

  const retryStartup = () => {
    setError('');
    setSubmitting(true);
    retrySession().finally(() => setSubmitting(false));
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[common.content, { flexGrow: 1, justifyContent: 'center' }]} keyboardShouldPersistTaps="handled">
          <Text style={[common.title, { fontSize: 32 }]}>Welcome back</Text>
          <Text style={common.subtitle}>Sign in to your project workspace.</Text>
          <Text style={common.label}>Email</Text>
          <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.muted} style={common.input} value={email} />
          <Text style={common.label}>Password</Text>
          <TextInput autoComplete="password" onChangeText={setPassword} onSubmitEditing={handleSubmit} placeholder="Your password" placeholderTextColor={colors.muted} secureTextEntry style={common.input} value={password} />
          {!!(error || (sessionExpired ? 'Session expired. Please log in again.' : startupError)) && (
            <Text accessibilityRole="alert" style={{ color: colors.danger, marginBottom: 14 }}>
              {error || (sessionExpired ? 'Session expired. Please log in again.' : startupError)}
            </Text>
          )}
          {!!startupError && (
            <TouchableOpacity onPress={retryStartup} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Retry connection</Text>
            </TouchableOpacity>
          )}
          {canRetrySubmit && (
            <TouchableOpacity onPress={handleSubmit} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Retry</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity accessibilityRole="button" disabled={submitting} onPress={handleSubmit} style={[common.button, submitting && { opacity: 0.65 }]}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={common.buttonText}>Sign in</Text>}
          </TouchableOpacity>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 22 }}>
            <Text style={{ color: colors.muted }}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
