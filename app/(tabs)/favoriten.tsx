import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function FavoritenScreen() {
    const [username, setUsername] = useState<string | null>(null);
    const [favoriteMensaNames, setFavoriteMensaNames] = useState<string[]>([]);
    const [favoriteMeals, setFavoriteMeals] = useState<string[]>([]);

    const loadData = async () => {
        const storedUsername = await AsyncStorage.getItem('username');
        if (!storedUsername) return;
        setUsername(storedUsername);

        const [storedMensaIdsRaw, mensaListRaw, storedMealsRaw] = await Promise.all([
            AsyncStorage.getItem(`favoriteMensen_${storedUsername}`),
            AsyncStorage.getItem('mensaList'),
            AsyncStorage.getItem(`favoriteMeals_${storedUsername}`),
        ]);

        if (storedMensaIdsRaw && mensaListRaw) {
            const ids = JSON.parse(storedMensaIdsRaw);
            const list = JSON.parse(mensaListRaw);

            const names = ids
                .map((id: string) => list.find((m: any) => m.id === id))
                .filter(Boolean)
                .map((m: any) => m.name);

            setFavoriteMensaNames(names);
        }

        if (storedMealsRaw) {
            setFavoriteMeals(JSON.parse(storedMealsRaw));
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Deine Favoriten</Text>
            {username && <Text>👤 Benutzer: {username}</Text>}

            <Text style={styles.sectionTitle}>❤️ Lieblings-Mensen:</Text>
            {favoriteMensaNames.length > 0 ? (
                favoriteMensaNames.map((name, idx) => <Text key={idx}>• {name}</Text>)
            ) : (
                <Text>Noch keine Lieblingsmensa gewählt.</Text>
            )}

            <Text style={styles.sectionTitle}>⭐ Lieblings-Speisen:</Text>
            {favoriteMeals.length > 0 ? (
                favoriteMeals.map((meal, index) => <Text key={index}>• {meal}</Text>)
            ) : (
                <Text>Noch keine Lieblingsspeisen gespeichert.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        marginTop: 20,
        fontWeight: 'bold',
    },
});
