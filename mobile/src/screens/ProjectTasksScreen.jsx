import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { deleteTask, getProjectTasks, updateTask } from '../api/tasks';
import ErrorMessage from '../components/ErrorMessage';
import FilterChips from '../components/FilterChips';
import HeaderActions from '../components/HeaderActions';
import Loading from '../components/Loading';
import Screen from '../components/Screen';
import TaskCard from '../components/TaskCard';
import { common, colors } from '../theme';

const statusFilters = [
  { label: 'Any status', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];
const priorityFilters = [
  { label: 'Any priority', value: '' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
];

export default function ProjectTasksScreen({ navigation, route }) {
  const { project } = route.params;
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);
  const query = useMemo(() => ({ search, status, priority }), [search, status, priority]);

  const load = useCallback(async (isRefresh = false) => {
    const sequence = ++requestSequence.current;
    setError('');
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await getProjectTasks(project.id, query);
      if (sequence === requestSequence.current) setTasks(result.tasks);
    } catch (loadError) {
      if (sequence === requestSequence.current) setError(loadError.message);
    } finally {
      if (sequence === requestSequence.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [project.id, query]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: () => <HeaderActions navigation={navigation} current="Tasks" /> });
  }, [navigation]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const handleDelete = (task) => {
    Alert.alert('Delete task?', `“${task.name}” will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(task.id);
            await load(true);
          } catch (deleteError) {
            setError(deleteError.message);
          }
        },
      },
    ]);
  };

  const handleComplete = async (task) => {
    try {
      await updateTask(task.id, { status: 'COMPLETED' });
      await load(true);
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  if (loading && tasks.length === 0 && !error) return <Screen><Loading label="Loading tasks..." /></Screen>;

  return (
    <Screen>
      <FlatList
        contentContainerStyle={common.content}
        data={tasks}
        keyExtractor={(task) => String(task.id)}
        ListEmptyComponent={!error ? <Text style={{ color: colors.muted, paddingVertical: 24, textAlign: 'center' }}>No tasks match your filters.</Text> : null}
        ListHeaderComponent={
          <View>
            <Text style={common.title}>Project tasks</Text>
            <Text style={common.subtitle}>{project.name}</Text>
            <TextInput onChangeText={setSearch} placeholder="Search task names" placeholderTextColor={colors.muted} style={common.input} value={search} />
            <FilterChips options={statusFilters} value={status} onChange={setStatus} />
            <FilterChips options={priorityFilters} value={priority} onChange={setPriority} />
            {!!error && <ErrorMessage message={error} onRetry={() => load()} />}
            <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('TaskForm', { project })} style={[common.button, { marginBottom: 16 }]}>
              <Text style={common.buttonText}>＋  Add task</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onComplete={() => handleComplete(item)}
            onDelete={() => handleDelete(item)}
            onEdit={() => navigation.navigate('TaskForm', { project, taskId: item.id })}
          />
        )}
      />
      {loading && tasks.length > 0 && <View style={{ paddingBottom: 12 }}><Loading label="Updating tasks..." /></View>}
    </Screen>
  );
}
