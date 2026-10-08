import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function Loading({ label = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  label: { color: colors.muted, fontSize: 15, marginTop: 12 },
});
