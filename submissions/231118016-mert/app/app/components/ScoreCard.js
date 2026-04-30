import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ScoreCard = ({ score }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Idea Readiness Score</Text>
      <Text style={[styles.score, { color: score === 100 ? '#4CAF50' : '#FF9800' }]}>
        {score}%
      </Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${score}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressContainer: {
    height: 10,
    width: '100%',
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
});

export default ScoreCard;
