import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function HeaderActions({ navigation, current }) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Signed out', error.message);
    }
  };

  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 16 }}>
      {current !== 'Dashboard' && (
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Home</Text>
        </TouchableOpacity>
      )}
      {current !== 'Projects' && (
        <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Projects</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={handleLogout}>
        <Text style={{ color: colors.danger, fontWeight: '700' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
