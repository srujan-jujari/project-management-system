import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

export default function FilterChips({ options, value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={option.value || 'all'}
            onPress={() => onChange(option.value)}
            style={[styles.chip, selected && styles.selected]}
          >
            <Text style={[styles.text, selected && styles.selectedText]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingBottom: 12 },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 },
  selected: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  text: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  selectedText: { color: colors.primary },
});
