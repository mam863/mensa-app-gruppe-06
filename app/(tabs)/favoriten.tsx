import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function FavoritenScreen() {
    const [favoriteMensaNames, setFavoriteMensaNames] = useState<string[]>([]);
    const [favoriteMeals, setFavoriteMeals] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            console.log("🔄 Loading favorites...");
            const [storedMensaIdsRaw, mensaListRaw, storedMealsRaw] = await Promise.all([
                AsyncStorage.getItem('favoriteMensen'),
                AsyncStorage.getItem('mensaList'),
                AsyncStorage.getItem('favoriteMeals'),
            ]);

            if (storedMensaIdsRaw && mensaListRaw) {
                const ids = JSON.parse(storedMensaIdsRaw);
                const list = JSON.parse(mensaListRaw);

                const names = ids
                    .map((id: string) => list.find((m: any) => m.id === id))
                    .filter(Boolean)
                    .map((m: any) => m.name);

                setFavoriteMensaNames(names);
            } else {
                setFavoriteMensaNames([]);
            }

            if (storedMealsRaw) {
                setFavoriteMeals(JSON.parse(storedMealsRaw));
            } else {
                setFavoriteMeals([]);
            }

        } catch (error) {
            console.error('❌ Fehler beim Laden der Favoriten:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>📌 Deine Favoriten</Text>

            {loading ? (
                <Text>Lade Favoriten...</Text>
            ) : (
                <>
                    <Text style={styles.sectionTitle}>❤️ Lieblings-Mensen:</Text>
                    {favoriteMensaNames.length > 0 ? (
                        favoriteMensaNames.map((name, idx) => <Text key={idx}>• {name}</Text>)
                    ) : (
                        <Text>Keine Lieblingsmensa gewählt.</Text>
                    )}

                    <Text style={styles.sectionTitle}>⭐ Lieblings-Speisen:</Text>
                    {favoriteMeals.length > 0 ? (
                        favoriteMeals.map((meal, index) => <Text key={index}>• {meal}</Text>)
                    ) : (
                        <Text>Keine Lieblingsspeisen gespeichert.</Text>
                    )}
                </>
            )}
        </ScrollView>
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
