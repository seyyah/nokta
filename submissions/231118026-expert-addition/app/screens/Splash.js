import React, { useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function Splash({ navigation }) {
  const { authUser } = useContext(AppContext);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      navigation.replace(authUser ? 'MainTabs' : 'Auth');
    });
  }, [authUser]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity }}>
        <Text style={styles.logo}>NonSlop</Text>
        <Text style={styles.tagline}>Your specialty. Your app. Two minutes.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121415',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    color: '#abcbdf',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  tagline: {
    color: '#6B6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
});

