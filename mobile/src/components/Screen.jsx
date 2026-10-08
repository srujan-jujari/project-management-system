import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

export default function Screen({ children, style }) {
  return <SafeAreaView edges={['left', 'right', 'bottom']} style={[{ flex: 1, backgroundColor: colors.background }, style]}>{children}</SafeAreaView>;
}
