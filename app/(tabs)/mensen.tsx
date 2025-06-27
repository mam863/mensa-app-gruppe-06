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
import { useRouter } from 'expo-router';

export default function MensenScreen() {
    const router = useRouter();
    const [mensen, setMensen] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = 'https://mensa.gregorflachs.de/api/v1/canteen?loadingtype=complete';
    const API_KEY =
        'eQqAIq+kKLDkHKJOQK99V4H/DWmFdkyBzvvL1ceWBGHjKTpoEITV/KVTsPa7NV10FHpEqZd78KMb/RAoihGylyXLkIs6hvU9ZnfdwltTt7l/CRJmgu6LA/PRH+9X5EH0F+N2/b6dO0AudBO4hjtRLVUg2aygxKvvpVAv0YaVQc9Sz1/crbpPTEImpoDYlrDPYBUZUjNgA88mJtc43f73Begxdm6EDPDTLQUWsPVqdzB5OM8Eci/nXx8SwYQxwM64I86otLkZ0SQilDoUmfnHREXT5MLrOcG8S914HH6OWYqNPSCPsQZClmhyYTrbLj79AfF5PozRA66w5JK8d/Sd+A==';

    useEffect(() => {
        const fetchMensen = async () => {
            try {
                const response = await fetch(API_URL, {
                    headers: {
                        'X-API-KEY': API_KEY,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP Fehler: ${response.status}`);
                }

                const data = await response.json();
                setMensen(data);
            } catch (error) {
                console.error('Fehler beim Laden:', error);
                Alert.alert('Fehler', 'Konnte Mensen nicht laden.');
            } finally {
                setLoading(false);
            }
        };

        fetchMensen();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => router.push(`/mensa/${item.id}`)}
        >
            <Text style={styles.name}>{item.name}</Text>

            {item.address && (
                <Text style={styles.address}>
                    {item.address.street}, {item.address.zipcode} {item.address.city}
                </Text>
            )}

            <Text style={styles.hours}>
                Öffnungszeiten:{' '}
                {item.businessDays?.length > 0
                    ? item.businessDays
                        .map(
                            (day: { day: any; businesshours: any[]; }) =>
                                `${day.day}: ${
                                     day.businesshours?.length > 0
                                        ? day.businesshours
                                            .map((hour) => `${hour.openAt}–${hour.closeAt}`)
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
});
