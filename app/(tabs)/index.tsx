import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Image,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexScreen() {
    const router = useRouter();
    const [favoriteMensaName, setFavoriteMensaName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [canteens, setCanteens] = useState<any[]>([]);
    const [meals, setMeals] = useState<any[]>([]);

    const API_KEY =
        'eQqAIq+kKLDkHKJOQK99V4H/DWmFdkyBzvvL1ceWBGHjKTpoEITV/KVTsPa7NV10FHpEqZd78KMb/RAoihGylyXLkIs6hvU9ZnfdwltTt7l/CRJmgu6LA/PRH+9X5EH0F+N2/b6dO0AudBO4hjtRLVUg2aygxKvvpVAv0YaVQc9Sz1/crbpPTEImpoDYlrDPYBUZUjNgA88mJtc43f73Begxdm6EDPDTLQUWsPVqdzB5OM8Eci/nXx8SwYQxwM64I86otLkZ0SQilDoUmfnHREXT5MLrOcG8S914HH6OWYqNPSCPsQZClmhyYTrbLj79AfF5PozRA66w5JK8d/Sd+A=='

    useEffect(() => {
        const loadFavoriteMensa = async () => {
            try {
                const id = await AsyncStorage.getItem('favoriteMensa');
                if (id) {
                    const API_URL = `https://mensa.gregorflachs.de/api/v1/canteen/${id}`;
                    const response = await fetch(API_URL, {
                        headers: { 'X-API-KEY': API_KEY },
                    });
                    const data = await response.json();
                    setFavoriteMensaName(data.name);
                }
            } catch (error) {
                console.error('Fehler beim Laden der Lieblingsmensa:', error);
            }
        };

        const loadData = async () => {
            try {
                const resCanteens = await fetch(
                    'https://mensa.gregorflachs.de/api/v1/canteen?loadingtype=complete',
                    { headers: { 'X-API-KEY': API_KEY } }
                );
                const canteenData = await resCanteens.json();
                setCanteens(canteenData);

                const today = new Date().toISOString().split('T')[0];
                const resMeals = await fetch(
                    `https://mensa.gregorflachs.de/api/v1/menue?startdate=${today}&enddate=${today}&loadingtype=complete`,
                    { headers: { 'X-API-KEY': API_KEY } }
                );
                const mealData = await resMeals.json();

                const mealsToday: any[] = [];
                mealData.forEach((day: any) => {
                    if (day.meals) {
                        day.meals.forEach((meal: any) => {
                            mealsToday.push({
                                ID: meal.ID,
                                name: meal.name,
                                canteenId: day.canteenId,
                            });
                        });
                    }
                });

                setMeals(mealsToday);
            } catch (error) {
                console.error('Fehler beim Laden der Daten:', error);
            }
        };

        loadFavoriteMensa();
        loadData();
    }, []);

    const filteredCanteens = canteens.filter((c) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredMeals = meals.filter((m) =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Image source={require('../../assets/images/icon_mensa.png')} style={styles.logo} />

            <TextInput
                style={styles.search}
                placeholder="Suche nach Mensa oder Gericht..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {searchQuery.length > 0 && (
                <View style={{ width: '100%', marginBottom: 20 }}>
                    {filteredCanteens.map((c) => (
                        <TouchableOpacity
                            key={`canteen-${c.id}`}
                            style={styles.resultItem}
                            onPress={() => router.push(`/mensa/${c.id}`)}
                        >
                            <Text>🏢 {c.name}</Text>
                        </TouchableOpacity>
                    ))}
                    {filteredMeals.map((m, index) => (
                        <TouchableOpacity
                            key={`meal-${m.ID ?? index}`}
                            style={styles.resultItem}
                            onPress={() => router.push('/speiseplan')}
                        >
                            <Text>🍽️ {m.name}</Text>
                        </TouchableOpacity>
                    ))}

                </View>
            )}

            {favoriteMensaName ? (
                <Text style={styles.favorite}>⭐ Deine Lieblings-Mensa: {favoriteMensaName}</Text>
            ) : (
                <Text style={styles.favorite}>⭐ Noch keine Lieblings-Mensa gewählt</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={() => router.push('/mensen')}>
                <Text style={styles.buttonText}>📋 Mensen Liste</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/speiseplan')}>
                <Text style={styles.buttonText}>🍽️ Speiseplan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>⭐ Bewertungen</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    logo: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    search: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        width: '100%',
        marginBottom: 20,
    },
    favorite: {
        fontSize: 16,
        marginBottom: 16,
        color: '#333',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#17D171',
        padding: 15,
        borderRadius: 10,
        width: '100%',
        marginBottom: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    resultItem: {
        padding: 10,
        backgroundColor: '#f5f5f5',
        marginBottom: 6,
        borderRadius: 6,
    },
});
