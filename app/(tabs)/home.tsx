// Datei: app/home.tsx

import React from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={require('@/assets/images/feedme-logo.jpg')}
                style={styles.logo}
                resizeMode="contain"
            />

            <TextInput
                style={styles.searchInput}
                placeholder="Suche nach Mensa oder Gericht..."
                placeholderTextColor="#888"
            />

            <TouchableOpacity style={styles.button} onPress={() => router.push('/mensen')}>
                <Text style={styles.buttonText}>📋 Mensen Liste</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/speiseplan')}>
                <Text style={styles.buttonText}>🍽️ Speiseplan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/bewertung')}>
                <Text style={styles.buttonText}>⭐ Bewertungen</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    logo: {
        width: 220,
        height: 180,
        marginTop: 50,
        marginBottom: 20,
    },
    searchInput: {
        height: 48,
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#2ecc71',
        paddingVertical: 14,
        borderRadius: 10,
        marginBottom: 16,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
