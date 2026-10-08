import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { getDashboard } from '../api/dashboard';
import ErrorMessage from '../components/ErrorMessage';
import HeaderActions from '../components/HeaderActions';
import Loading from '../components/Loading';
import Screen from '../components/Screen';
import { common, colors } from '../theme';

const cards = [
  ['totalProjects', 'Total Projects'],
  ['totalTasks', 'Total Tasks'],
  ['completedTasks', 'Completed Tasks'],
  ['pendingTasks', 'Pending Tasks'],
  ['projectsInProgress', 'Projects In Progress'],
];

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);

  const load = useCallback(async (isRefresh = false) => {
    const sequence = ++requestSequence.current;
    setError('');
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await getDashboard();
      if (sequence === requestSequence.current) setStats(result);
    } catch (loadError) {
      if (sequence === requestSequence.current) setError(loadError.message);
    } finally {
      if (sequence === requestSequence.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: () => <HeaderActions navigation={navigation} current="Dashboard" /> });
  }, [navigation]);

  useEffect(() => {
    let active = true;
    getDashboard()
      .then((result) => {
        if (active) setStats(result);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading && !stats) return <Screen><Loading label="Loading your dashboard..." /></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={common.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}>
        <Text style={common.title}>Your workspace</Text>
        <Text style={common.subtitle}>A quick look at your projects and tasks.</Text>
        {!!error && <ErrorMessage message={error} onRetry={() => load()} />}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {cards.map(([key, label], index) => (
            <View key={key} style={[common.card, { flexGrow: 1, flexBasis: '44%', marginBottom: 0, minHeight: 120 }]}>
              <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>{label}</Text>
              <Text style={{ color: index === 2 ? colors.success : colors.text, fontSize: 32, fontWeight: '800', marginTop: 16 }}>{stats?.[key] ?? '—'}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 24 }}>
          <Text style={common.label}>Continue to</Text>
          <Text onPress={() => navigation.navigate('Projects')} style={{ color: colors.primary, fontSize: 16, fontWeight: '700', paddingVertical: 12 }}>Browse your projects  ›</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
