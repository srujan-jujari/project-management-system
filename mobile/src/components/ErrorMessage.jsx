import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity accessibilityRole="button" onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderRadius: 14,
    marginVertical: 12,
    padding: 18,
  },
  message: { color: colors.danger, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  button: { paddingHorizontal: 18, paddingTop: 14 },
  buttonText: { color: colors.primary, fontSize: 15, fontWeight: '700' },
});
