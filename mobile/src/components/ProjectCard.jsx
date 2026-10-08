import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { common, colors } from '../theme';

export default function ProjectCard({ project, onPress }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={common.card}>
      <View style={common.row}>
        <Text style={styles.name}>{project.name}</Text>
        <Text style={styles.status}>{project.status?.replaceAll('_', ' ')}</Text>
      </View>
      {!!project.description && <Text style={styles.description}>{project.description}</Text>}
      <Text style={styles.dates}>
        Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
        {'  ·  '}
        End: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
      </Text>
      <Text style={styles.link}>View tasks  ›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, flex: 1, fontSize: 17, fontWeight: '700', marginRight: 8 },
  status: { backgroundColor: colors.primaryLight, borderRadius: 12, color: colors.primary, fontSize: 11, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 12 },
  dates: { color: colors.muted, fontSize: 12, marginTop: 12 },
  link: { color: colors.primary, fontSize: 13, fontWeight: '700', marginTop: 13 },
});
