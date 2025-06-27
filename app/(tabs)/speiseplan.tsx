import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';

const API_KEY = 'oQtJbCh2JMfR5uyzxob/tPI0uvtRVlSbEz4B6HRBy0t/9gWL+/7JnXqmMxG6QUJQUTrYpU0Qaw5caMl84+QU9NF5OkSovRT5g/3c8R/RGjKI9AyrJeUgYzCi7lG+LdZQTsGNeoBb0UE7rp+Z/AWR3jzeWJajiK6tS8P3z7W9jrg2iB5ZdoFqiWAAKje5aFwW4gA8RsDQxyvhSXxE1ceqJZd0xA9LhBKTbQsKwsTKxXf4hglPNpz6fECodjCX3uY3ixwIu1aT+UXc9bn4Rj530/WUg07P/p2eYbi75WYPOy5eFNKwh63Cuj8QuoXz5HmZJbQIoaPNV4ujn9e3NRb3Fg==';

export default function SpeiseplanScreen() {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpeiseplan = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const url = https://mensa.gregorflachs.de/api/v1/menue?loadingtype=complete&startdate=${today}&enddate=${today};

                const response = await fetch(url, {
                    headers: {
                        'X-API-KEY': API_KEY,
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(HTTP Fehler: ${response.status});
                }

                const data = await response.json();
                const allMeals = [];

                data.forEach(day => {
                    day.meals?.forEach(meal => {
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
                Alert.alert('Fehler', 'Konnte Speiseplan nicht laden.');
            } finally {
                setLoading(false);
            }
        };

        fetchSpeiseplan();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>{item.name  'Kein Name'}</Text>
            <Text>Kategorie: {item.category  'Unbekannt'}</Text>
            <Text>Datum: {item.date}</Text>
            <Text>Mensa-ID: {item.canteenId}</Text>
            {item.prices?.length ? (
                item.prices.map((price, idx) => (
                    <Text key={idx}>Preis ({price.priceType}): {price.price} €</Text>
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
                <Text>Keine Mahlzeiten gefunden.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Speiseplan</Text>
            <FlatList
                data={meals}
                keyExtractor={(item, index) => ${item.ID || index}}
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
