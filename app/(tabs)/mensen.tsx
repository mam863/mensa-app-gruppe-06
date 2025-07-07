import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MensenScreen() {
    const router = useRouter();
    const [mensen, setMensen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<number[]>([]);

    const API_URL = 'https://mensa.gregorflachs.de/api/v1/canteen?loadingtype=complete';
    const API_KEY =
        'eQqAIq+kKLDkHKJOQK99V4H/DWmFdkyBzvvL1ceWBGHjKTpoEITV/KVTsPa7NV10FHpEqZd78KMb/RAoihGylyXLkIs6hvU9ZnfdwltTt7l/CRJmgu6LA/PRH+9X5EH0F+N2/b6dO0AudBO4hjtRLVUg2aygxKvvpVAv0YaVQc9Sz1/crbpPTEImpoDYlrDPYBUZUjNgA88mJtc43f73Begxdm6EDPDTLQUWsPVqdzB5OM8Eci/nXx8SwYQxwM64I86otLkZ0SQilDoUmfnHREXT5MLrOcG8S914HH6OWYqNPSCPsQZClmhyYTrbLj79AfF5PozRA66w5JK8d/Sd+A==';

    useEffect(() => {
        const initialize = async () => {
            await fetchMensen();
            await loadFavorites();
            setLoading(false);
        };
        initialize();
    }, []);

    const loadFavorites = async () => {
        const stored = await AsyncStorage.getItem('mensaFavorites');
        if (stored) {
            setFavorites(JSON.parse(stored));
        }
    };

    const toggleFavorite = async (id: number) => {
        const isAlreadyFavorite = favorites.includes(id);
        const updatedFavorites = isAlreadyFavorite
            ? favorites.filter((favId) => favId !== id)
            : [...favorites, id];

        setFavorites(updatedFavorites);
        await AsyncStorage.setItem('mensaFavorites', JSON.stringify(updatedFavorites));

        Alert.alert(
            'Gespeichert',
            isAlreadyFavorite
                ? 'Mensa wurde aus Favoriten entfernt.'
                : 'Mensa wurde zu Favoriten hinzugefügt.'
        );
    };

    const fetchMensen = async () => {
        try {
            const netInfo = await NetInfo.fetch();

            if (netInfo.isConnected) {
                const response = await fetch(API_URL, {
                    headers: { 'X-API-KEY': API_KEY },
                });

                if (!response.ok) {
                    throw new Error(`HTTP Fehler: ${response.status}`);
                }

                const data = await response.json();
                setMensen(data);
                await AsyncStorage.setItem('mensaList', JSON.stringify(data));
            } else {
                const cached = await AsyncStorage.getItem('mensaList');
                if (cached) {
                    setMensen(JSON.parse(cached));
                } else {
                    Alert.alert('Offline', 'Keine gespeicherten Mensen verfügbar.');
                }
            }
        } catch (error) {
            console.error('Fehler beim Laden:', error);
            Alert.alert('Fehler', 'Konnte Mensen nicht laden.');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => router.push(`/mensa/${item.id}`)}
        >
            <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                    <Ionicons
                        name={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
                        size={24}
                        color={favorites.includes(item.id) ? '#17D171' : '#ccc'}
                    />
                </TouchableOpacity>
            </View>

            {item.address && (
                <Text style={styles.address}>
                    {item.address.street}, {item.address.zipcode} {item.address.city}
                </Text>
            )}

            <Text style={styles.hours}>
                Öffnungszeiten:{' '}
                {item.businessDays?.length > 0
                    ? item.businessDays
                        .map((day: any) =>
                            `${day.day}: ${
                                day.businesshours?.length
                                    ? day.businesshours
                                        .map((hour: any) => `${hour.openAt}–${hour.closeAt}`)
                                        .join(', ')
                                    : 'Keine Zeiten'
                            }`
                        )
                        .join(' | ')
                    : 'Keine Öffnungszeiten verfügbar'}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2ecc71" />
                <Text style={{ marginTop: 10 }}>Lade Mensen...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mensen in Berlin</Text>
            <FlatList
                data={mensen}
                keyExtractor={(item) => item.id.toString()}
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
    item: {
        backgroundColor: '#f2f2f2',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    address: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    hours: {
        fontSize: 13,
        color: '#333',
        marginTop: 4,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
