import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import PredictPage from './PredictPage/PredictPage';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <PredictPage />
    </View>
  );
}

