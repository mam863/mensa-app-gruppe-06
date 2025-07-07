import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

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

const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key

export default function SpeiseplanScreen() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [dataSource, setDataSource] = useState<'online' | 'offline' | null>(null);

    const fetchSpeiseplan = async (showAlert = true) => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const storageKey = `meals_${today}`;

            const netInfo = await NetInfo.fetch();

            if (netInfo.isConnected) {
                // ✅ Fetch data from API
                const url = `https://mensa.gregorflachs.de/api/v1/menue?loadingtype=complete&startdate=${today}&enddate=${today}`;
                const response = await fetch(url, {
                    headers: {
                        'X-API-KEY': API_KEY,
                        Accept: 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const data = await response.json();
                const allMeals: Meal[] = [];

                // ✅ Flatten meals from multiple canteens/days into a single list
                (data as DayData[]).forEach((day) => {
                    day.meals?.forEach((meal) => {
                        allMeals.push({
                            ...meal,
                            date: day.date,
                            canteenId: day.canteenId,
                        });
                    });
                });

                // ✅ Update state and store data locally
                setMeals(allMeals);
                await AsyncStorage.setItem(storageKey, JSON.stringify(allMeals));
                setDataSource('online');

                if (showAlert) {
                    Alert.alert('Updated', 'Meals have been refreshed successfully.');
                }
            } else {
                // ✅ Load from cache if offline
                const cached = await AsyncStorage.getItem(storageKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setMeals(parsed);
                    setDataSource('offline');
                } else {
                    Alert.alert('Offline', 'No cached meals available for today.');
                }
            }
        } catch (error) {
            console.error('Error loading meals:', error);
            Alert.alert('Error', 'Failed to load meal data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpeiseplan(false); // Initial fetch without alert
    }, []);

    const renderItem = ({ item }: { item: Meal }) => (
        <View style={styles.card}>
            <Text style={styles.name}>{item.name || 'No name'}</Text>
            <Text>Category: {item.category || 'Unknown'}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Canteen ID: {item.canteenId}</Text>
            {item.prices?.length ? (
                item.prices.map((price, idx) => (
                    <Text key={`${item.ID}-${price.priceType}-${idx}`}>
                        Price ({price.priceType}): {price.price} €
                    </Text>
                ))
            ) : (
                <Text>No price info available.</Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={{ marginTop: 10 }}>Loading meals...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Today's Meals</Text>

            {/* 🔄 Manual refresh button */}
            <Button title="🔄 Refresh" onPress={() => fetchSpeiseplan()} />

            {/* ℹ️ Show data source */}
            {dataSource && (
                <Text style={styles.sourceText}>
                    Data source: {dataSource === 'online' ? '🌐 Online' : '📦 Offline (cached)'}
                </Text>
            )}

            {meals.length === 0 ? (
                <Text style={{ marginTop: 20 }}>No meals available today.</Text>
            ) : (
                <FlatList
                    data={meals}
                    keyExtractor={(item, index) =>
                        item.ID?.toString() || `${item.canteenId}-${index}`
                    }
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingTop: 10 }}
                />
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
    sourceText: {
        marginTop: 10,
        marginBottom: 10,
        fontStyle: 'italic',
        color: '#888',
    },
});
