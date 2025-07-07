import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

type Canteen = {
    id: number;
    name: string;
    address?: {
        street: string;
        city: string;
        zipcode: string;
    };
};

type Meal = {
    ID: number;
    name: string;
    category?: string;
    date?: string;
    canteenId?: number;
};

export default function FavoritenScreen() {
    const router = useRouter();
    const [favoriteMensen, setFavoriteMensen] = useState<Canteen[]>([]);
    const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const mensaListRaw = await AsyncStorage.getItem('mensaList');
            const mensaFavoritesRaw = await AsyncStorage.getItem('mensaFavorites');
            const mealFavoritesRaw = await AsyncStorage.getItem('mealFavorites');
            const todayKey = `meals_${new Date().toISOString().split('T')[0]}`;
            const mealsRaw = await AsyncStorage.getItem(todayKey);

            const mensaFavorites: number[] = mensaFavoritesRaw ? JSON.parse(mensaFavoritesRaw) : [];
            const mealFavorites: number[] = mealFavoritesRaw ? JSON.parse(mealFavoritesRaw) : [];

            // فلترة الـ Mensen
            const allMensen: Canteen[] = mensaListRaw ? JSON.parse(mensaListRaw) : [];
            const selectedMensen = allMensen.filter((m) => mensaFavorites.includes(m.id));
            setFavoriteMensen(selectedMensen);

            // فلترة الوجبات
            const allMeals: Meal[] = mealsRaw ? JSON.parse(mealsRaw) : [];
            const selectedMeals = allMeals.filter((m) => mealFavorites.includes(m.ID));
            setFavoriteMeals(selectedMeals);
        } catch (error) {
            console.error('Fehler beim Laden der Favoriten:', error);
        } finally {
            setLoading(false);
        }
    };

    // إعادة تحميل المفضلة عند الدخول إلى الصفحة
    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="green" />
                <Text style={{ marginTop: 10 }}>Lade Favoriten...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Button title="🔄 AKTUALISIEREN" onPress={loadFavorites} />

            <Text style={styles.sectionTitle}>💚 Lieblings-Mensen</Text>
            {favoriteMensen.length === 0 ? (
                <Text style={styles.empty}>Keine Mensen als Favorit markiert.</Text>
            ) : (
                <FlatList
                    data={favoriteMensen}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => router.push(`/mensa/${item.id}`)}
                        >
                            <Text style={styles.name}>{item.name}</Text>
                            {item.address && (
                                <Text style={styles.subtext}>
                                    {item.address.street}, {item.address.zipcode} {item.address.city}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                />
            )}

            <Text style={styles.sectionTitle}>💚 Lieblingsgerichte</Text>
            {favoriteMeals.length === 0 ? (
                <Text style={styles.empty}>Keine Gerichte als Favorit markiert.</Text>
            ) : (
                <FlatList
                    data={favoriteMeals}
                    keyExtractor={(item) => item.ID.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.subtext}>
                                Kategorie: {item.category || 'Keine Angabe'}
                            </Text>
                            <Text style={styles.subtext}>
                                Datum: {item.date || 'Unbekannt'} | Mensa ID: {item.canteenId}
                            </Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 12,
        color: 'green',
    },
    item: {
        backgroundColor: '#f2f2f2',
        padding: 16,
        borderRadius: 10,
        marginBottom: 10,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    subtext: {
        fontSize: 14,
        color: '#555',
    },
    empty: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#888',
        marginBottom: 20,
    },
});
