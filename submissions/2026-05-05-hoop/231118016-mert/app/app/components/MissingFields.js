import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MissingFields = ({ fields }) => {
  if (!fields || fields.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Missing Fields:</Text>
      {fields.map((field, index) => (
        <Text key={index} style={styles.item}>
          • {field}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  item: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
    marginBottom: 4,
  },
});

export default MissingFields;
