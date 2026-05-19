import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const NoktaAvatar = ({ isExpertMode }) => {
    return (
        <View style={styles.container}>
            <View style={[styles.avatarContainer, isExpertMode && styles.expertMode]}>
                <Image
                    source={require('../assets/hero.png')}
                    style={styles.avatar}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    avatarContainer: {
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: (width * 0.5) / 2,
        backgroundColor: '#e0f7fa', // Normal mod arka planı
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#26c6da',
    },
    expertMode: {
        backgroundColor: '#ffebee', // Siber güvenlik uzmanı modu (kırmızımtırak)
        borderColor: '#d32f2f',
    },
    avatar: {
        width: '80%',
        height: '80%',
    }
});

export default NoktaAvatar;