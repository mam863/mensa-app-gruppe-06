import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BewertungenScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>⭐ Bewertungen</Text>
            <Text style={styles.text}>Hier kannst du Bewertungen sehen oder schreiben.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
});
