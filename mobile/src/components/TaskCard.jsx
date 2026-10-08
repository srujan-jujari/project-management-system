import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { common, colors } from '../theme';

const statusColors = {
  PENDING: { color: colors.warning, backgroundColor: colors.warningLight },
  IN_PROGRESS: { color: colors.primary, backgroundColor: colors.primaryLight },
  COMPLETED: { color: colors.success, backgroundColor: colors.successLight },
};

export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  return (
    <View style={common.card}>
      <View style={common.row}>
        <Text style={styles.name}>{task.name}</Text>
        <Text style={[styles.status, statusColors[task.status]]}>{task.status?.replaceAll('_', ' ')}</Text>
      </View>
      {!!task.description && <Text style={styles.description}>{task.description}</Text>}
      <Text style={styles.meta}>Priority: {task.priority}  ·  Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</Text>
      <Text style={styles.meta}>Created: {new Date(task.createdAt).toLocaleDateString()}</Text>
      <View style={styles.actions}>
        <TouchableOpacity accessibilityRole="button" onPress={onEdit} style={styles.action}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        {task.status !== 'COMPLETED' && (
          <TouchableOpacity accessibilityRole="button" onPress={onComplete} style={styles.action}>
            <Text style={styles.actionText}>Mark completed</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity accessibilityRole="button" onPress={onDelete} style={styles.action}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, flex: 1, fontSize: 16, fontWeight: '700', marginRight: 8 },
  status: { borderRadius: 12, fontSize: 11, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 10 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 10 },
  actions: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14, paddingTop: 10 },
  action: { borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7 },
  actionText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  deleteText: { color: colors.danger, fontSize: 12, fontWeight: '700' },
});
