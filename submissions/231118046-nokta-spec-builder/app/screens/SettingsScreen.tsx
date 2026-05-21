import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings Screen</Text>
      <View style={styles.buggyPadding}>
        {/* Bad padding bug */}
        <Text style={styles.optionText}>Settings Option 1</Text>
        <Text style={styles.optionText}>Settings Option 2</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginTop: 50,
    textAlign: 'center',
    marginBottom: 20,
  },
  buggyPadding: {
    padding: 2, // Very bad padding
    marginLeft: -10, // Negative margin makes it cut off
    backgroundColor: '#eee',
  },
  optionText: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  }
});
