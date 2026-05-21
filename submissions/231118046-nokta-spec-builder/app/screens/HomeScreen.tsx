import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <View style={styles.buggyButtonContainer}>
        {/* Misaligned button bug */}
        <Button title="Go to Profile" onPress={() => navigation.navigate('Profile')} />
      </View>
      <Button title="Go to Settings" onPress={() => navigation.navigate('Settings')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  buggyButtonContainer: {
    marginLeft: 80, // Misalignment bug
    marginBottom: 10,
  }
});
