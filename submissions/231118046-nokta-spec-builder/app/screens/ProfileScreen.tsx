import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <View style={styles.buggyTextContainer}>
        {/* Text overflow bug */}
        <Text style={styles.buggyText}>
          This is a very long text that should overflow its container. It is not constrained properly and will look broken on the screen.
        </Text>
      </View>
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
  buggyTextContainer: {
    width: 150,
    height: 40,
    backgroundColor: '#ddd',
  },
  buggyText: {
    fontSize: 16,
    color: 'red',
  }
});
