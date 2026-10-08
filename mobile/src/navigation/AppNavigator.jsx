import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import ProjectTasksScreen from '../screens/ProjectTasksScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={user ? 'authenticated' : 'unauthenticated'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Overview' }} />
          <Stack.Screen name="Projects" component={ProjectsScreen} />
          <Stack.Screen name="ProjectTasks" component={ProjectTasksScreen} options={({ route }) => ({ title: route.params.project.name })} />
          <Stack.Screen name="TaskForm" component={TaskFormScreen} options={({ route }) => ({ title: route.params.taskId ? 'Edit task' : 'New task' })} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
