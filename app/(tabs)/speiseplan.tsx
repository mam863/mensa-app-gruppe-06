import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';

type Price = {
    priceType: string;
    price: number;
};

type Meal = {
    ID?: number;
    name?: string;
    category?: string;
    date: string;
    canteenId: number;
    prices?: Price[];
};

type DayData = {
    date: string;
    canteenId: number;
    meals?: Meal[];
};

const API_KEY =
    'eQqAIq+kKLDkHKJOQK99V4H/DWmFdkyBzvvL1ceWBGHjKTpoEITV/KVTsPa7NV10FHpEqZd78KMb/RAoihGylyXLkIs6hvU9ZnfdwltTt7l/CRJmgu6LA/PRH+9X5EH0F+N2/b6dO0AudBO4hjtRLVUg2aygxKvvpVAv0YaVQc9Sz1/crbpPTEImpoDYlrDPYBUZUjNgA88mJtc43f73Begxdm6EDPDTLQUWsPVqdzB5OM8Eci/nXx8SwYQxwM64I86otLkZ0SQilDoUmfnHREXT5MLrOcG8S914HH6OWYqNPSCPsQZClmhyYTrbLj79AfF5PozRA66w5JK8d/Sd+A==';

export default function SpeiseplanScreen() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpeiseplan = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const url = `https://mensa.gregorflachs.de/api/v1/menue?loadingtype=complete&startdate=${today}&enddate=${today}`;

                const response = await fetch(url, {
                    headers: {
                        'X-API-KEY': API_KEY,
                        Accept: 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP Fehler: ${response.status}`);
                }

                const data = await response.json();
                const allMeals: Meal[] = [];

                (data as DayData[]).forEach((day) => {
                    day.meals?.forEach((meal) => {
                        allMeals.push({
                            ...meal,
                            date: day.date,
                            canteenId: day.canteenId,
                        });
                    });
                });

                setMeals(allMeals);
            } catch (error) {
                console.error('Fehler beim Laden:', error);
                Alert.alert(
                    'Verbindungsproblem',
                    'Keine Verbindung zum Server.\nBitte prüfe deine Internetverbindung und versuche es erneut.'
                );
            } finally {
                // ✅ هذا هو ما كان مفقوداً
                setLoading(false);
            }
        };

        fetchSpeiseplan();
    }, []);

    const renderItem = ({ item }: { item: Meal }) => (
        <View style={styles.card}>
            <Text style={styles.name}>{item.name || 'Kein Name'}</Text>
            <Text>Kategorie: {item.category || 'Unbekannt'}</Text>
            <Text>Datum: {item.date}</Text>
            <Text>Mensa-ID: {item.canteenId}</Text>

            {item.prices?.length ? (
                item.prices.map((price, idx) => (
                    <Text key={`${item.ID}-${price.priceType}-${idx}`}>
                        Preis ({price.priceType}): {price.price} €
                    </Text>
                ))
            ) : (
                <Text>Keine Preisinformationen.</Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={{ marginTop: 10 }}>Lade Speiseplan...</Text>
            </View>
        );
    }

    if (meals.length === 0) {
        return (
            <View style={styles.center}>
                <Text>Keine Mahlzeiten für heute verfügbar.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Speiseplan für heute</Text>
            <FlatList
                data={meals}
                keyExtractor={(item, index) => item.ID?.toString() || `${item.canteenId}-${index}`}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 48,
        backgroundColor: '#fff',
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#f2f2f2',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});
