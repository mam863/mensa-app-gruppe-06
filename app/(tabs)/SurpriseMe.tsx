import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Animated,
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

export default function SurpriseMe() {
    const [loading, setLoading] = useState(false);
    const [randomMeal, setRandomMeal] = useState<Meal | null>(null);
    const fadeAnim = useState(new Animated.Value(0))[0];

    const fadeIn = () => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    };

    const fetchRandomMeal = async () => {
        try {
            setLoading(true);
            setRandomMeal(null);

            const today = new Date().toISOString().split('T')[0];
            const url = `https://mensa.gregorflachs.de/api/v1/menue?loadingtype=complete&startdate=${today}&enddate=${today}`;

            const response = await fetch(url, {
                headers: {
                    'X-API-KEY': API_KEY,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) throw new Error(`HTTP Fehler: ${response.status}`);

            const data: DayData[] = await response.json();
            const allMeals: Meal[] = [];

            data.forEach((day) => {
                day.meals?.forEach((meal) => {
                    allMeals.push({
                        ...meal,
                        date: day.date,
                        canteenId: day.canteenId,
                    });
                });
            });

            if (allMeals.length === 0) {
                Alert.alert('Keine Gerichte gefunden', 'Es wurden keine Gerichte geladen.');
                setLoading(false);
                return;
            }

            const randomIndex = Math.floor(Math.random() * allMeals.length);
            const selectedMeal = allMeals[randomIndex];

            setRandomMeal(selectedMeal);
            fadeIn();
            setLoading(false);
        } catch (error) {
            console.error('Fehler beim Laden:', error);
            Alert.alert('Fehler', 'Daten konnten nicht geladen werden.');
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎲 Überrasch mich!</Text>

            <TouchableOpacity style={styles.button} onPress={fetchRandomMeal}>
                <Text style={styles.buttonText}>Zeig mir ein Gericht 🍽️</Text>
            </TouchableOpacity>

            {loading && (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={{ marginTop: 10 }}>Lade dein Überraschungsgericht...</Text>
                </View>
            )}

            {randomMeal && (
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <Text style={styles.name}>{randomMeal.name || 'Kein Name'}</Text>
                    <Text>Kategorie: {randomMeal.category || 'Unbekannt'}</Text>
                    <Text>Datum: {randomMeal.date}</Text>
                    <Text>Mensa-ID: {randomMeal.canteenId}</Text>

                    {randomMeal.prices?.length ? (
                        randomMeal.prices.map((price, idx) => (
                            <Text key={idx}>
                                Preis ({price.priceType}): {price.price} €
                            </Text>
                        ))
                    ) : (
                        <Text>Keine Preisinformationen.</Text>
                    )}
                </Animated.View>
            )}
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#17D171',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    card: {
        backgroundColor: '#f2f2f2',
        padding: 16,
        borderRadius: 10,
        marginTop: 20,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    center: {
        marginTop: 20,
        alignItems: 'center',
    },
});
