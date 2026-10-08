import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { createTask, getTask, updateTask } from '../api/tasks';
import ErrorMessage from '../components/ErrorMessage';
import FilterChips from '../components/FilterChips';
import Loading from '../components/Loading';
import Screen from '../components/Screen';
import { common, colors } from '../theme';

const priorities = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
];
const statuses = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

const initialFields = {
  name: '',
  description: '',
  priority: 'MEDIUM',
  status: 'PENDING',
  dueDate: '',
};

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export default function TaskFormScreen({ navigation, route }) {
  const { project, taskId } = route.params;
  const [fields, setFields] = useState(initialFields);
  const [loading, setLoading] = useState(!!taskId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [retryOperation, setRetryOperation] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ title: taskId ? 'Edit task' : 'New task' });
  }, [navigation, taskId]);

  const loadTask = useCallback(async () => {
    setError('');
    setRetryOperation('');
    setLoading(true);
    try {
      const { task } = await getTask(taskId);
      setFields({
        name: task.name || '',
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    } catch (loadError) {
      setError(loadError.message);
      setRetryOperation('load');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (!taskId) return undefined;
    const timeout = setTimeout(loadTask, 0);
    return () => clearTimeout(timeout);
  }, [taskId, loadTask]);

  const set = useCallback((key, value) => {
    setFields((current) => ({ ...current, [key]: value }));
  }, []);

  const submit = async () => {
    setError('');
    setRetryOperation('');
    if (!fields.name.trim()) {
      setError('Task name is required.');
      return;
    }
    if (!priorities.some((item) => item.value === fields.priority)) {
      setError('Choose a valid priority.');
      return;
    }
    if (!statuses.some((item) => item.value === fields.status)) {
      setError('Choose a valid status.');
      return;
    }
    if (fields.dueDate.trim() && !isValidDate(fields.dueDate.trim())) {
      setError('Enter a valid due date in YYYY-MM-DD format.');
      return;
    }

    const payload = {
      name: fields.name.trim(),
      description: fields.description.trim() || null,
      priority: fields.priority,
      status: fields.status,
      dueDate: fields.dueDate.trim() || null,
    };
    setSubmitting(true);
    try {
      if (taskId) await updateTask(taskId, payload);
      else await createTask({ projectId: Number(project.id), ...payload });
      navigation.goBack();
    } catch (submitError) {
      setError(submitError.message || 'Unable to save the task. Please try again.');
      setRetryOperation('save');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Screen><Loading label="Loading task..." /></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
        <Text style={common.title}>{taskId ? 'Update task' : 'Create task'}</Text>
        <Text style={common.subtitle}>{project.name}</Text>
        {!!error && (
          <ErrorMessage
            message={error}
            onRetry={retryOperation === 'load' ? loadTask : retryOperation === 'save' ? submit : undefined}
          />
        )}
        <Text style={common.label}>Task name</Text>
        <TextInput onChangeText={(value) => set('name', value)} placeholder="What needs to be done?" placeholderTextColor={colors.muted} style={common.input} value={fields.name} />
        <Text style={common.label}>Description</Text>
        <TextInput multiline onChangeText={(value) => set('description', value)} placeholder="Add details (optional)" placeholderTextColor={colors.muted} style={[common.input, { minHeight: 90, paddingTop: 13, textAlignVertical: 'top' }]} value={fields.description} />
        <Text style={common.label}>Priority</Text>
        <FilterChips options={priorities} value={fields.priority} onChange={(value) => set('priority', value)} />
        <Text style={common.label}>Status</Text>
        <FilterChips options={statuses} value={fields.status} onChange={(value) => set('status', value)} />
        <Text style={common.label}>Due date</Text>
        <TextInput onChangeText={(value) => set('dueDate', value)} placeholder="YYYY-MM-DD (optional)" placeholderTextColor={colors.muted} style={common.input} value={fields.dueDate} />
        <TouchableOpacity accessibilityRole="button" disabled={submitting} onPress={submit} style={[common.button, submitting && { opacity: 0.65 }]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={common.buttonText}>{taskId ? 'Save changes' : 'Create task'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}
