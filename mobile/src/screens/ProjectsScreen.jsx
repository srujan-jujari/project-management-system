import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, Text, TextInput, View } from 'react-native';
import { getProjects } from '../api/projects';
import ErrorMessage from '../components/ErrorMessage';
import FilterChips from '../components/FilterChips';
import HeaderActions from '../components/HeaderActions';
import Loading from '../components/Loading';
import ProjectCard from '../components/ProjectCard';
import Screen from '../components/Screen';
import { common, colors } from '../theme';

const statuses = [
  { label: 'All statuses', value: '' },
  { label: 'Not started', value: 'NOT_STARTED' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function ProjectsScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);
  const query = useMemo(() => ({ search, status }), [search, status]);

  const load = useCallback(async (isRefresh = false) => {
    const sequence = ++requestSequence.current;
    setError('');
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await getProjects(query);
      if (sequence === requestSequence.current) setProjects(result.projects);
    } catch (loadError) {
      if (sequence === requestSequence.current) setError(loadError.message);
    } finally {
      if (sequence === requestSequence.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [query]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: () => <HeaderActions navigation={navigation} current="Projects" /> });
  }, [navigation]);

  useEffect(() => {
    const sequence = ++requestSequence.current;
    getProjects(query)
      .then((result) => {
        if (sequence === requestSequence.current) {
          setProjects(result.projects);
          setError('');
        }
      })
      .catch((loadError) => {
        if (sequence === requestSequence.current) setError(loadError.message);
      })
      .finally(() => {
        if (sequence === requestSequence.current) setLoading(false);
      });
  }, [query]);

  if (loading && projects.length === 0 && !error) return <Screen><Loading label="Loading projects..." /></Screen>;

  return (
    <Screen>
      <FlatList
        contentContainerStyle={common.content}
        data={projects}
        keyExtractor={(project) => String(project.id)}
        ListEmptyComponent={!error ? <Text style={{ color: colors.muted, paddingVertical: 24, textAlign: 'center' }}>No projects match your filters.</Text> : null}
        ListHeaderComponent={
          <View>
            <Text style={common.title}>Projects</Text>
            <Text style={common.subtitle}>Your projects, shared across your workspace.</Text>
            <TextInput onChangeText={setSearch} placeholder="Search project names" placeholderTextColor={colors.muted} style={common.input} value={search} />
            <FilterChips options={statuses} value={status} onChange={setStatus} />
            {!!error && <ErrorMessage message={error} onRetry={() => load()} />}
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        renderItem={({ item }) => (
          <ProjectCard project={item} onPress={() => navigation.navigate('ProjectTasks', { project: item })} />
        )}
      />
      {loading && projects.length > 0 && <View style={{ paddingBottom: 12 }}><Loading label="Updating projects..." /></View>}
    </Screen>
  );
}
