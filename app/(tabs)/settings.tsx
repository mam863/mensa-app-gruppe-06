// Datei: einstellungen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function EinstellungenScreen() {
    const [username, setUsername] = useState('Marwa');
    const [mensen, setMensen] = useState([]);
    const [selectedMensa, setSelectedMensa] = useState('');

    const API_URL = 'https://mensa.gregorflachs.de/api/v1/canteen?loadingtype=complete';
    const API_KEY =
        'eQqAIq+kKLDkHKJOQK99V4H/DWmFdkyBzvvL1ceWBGHjKTpoEITV/KVTsPa7NV10FHpEqZd78KMb/RAoihGylyXLkIs6hvU9ZnfdwltTt7l/CRJmgu6LA/PRH+9X5EH0F+N2/b6dO0AudBO4hjtRLVUg2aygxKvvpVAv0YaVQc9Sz1/crbpPTEImpoDYlrDPYBUZUjNgA88mJtc43f73Begxdm6EDPDTLQUWsPVqdzB5OM8Eci/nXx8SwYQxwM64I86otLkZ0SQilDoUmfnHREXT5MLrOcG8S914HH6OWYqNPSCPsQZClmhyYTrbLj79AfF5PozRA66w5JK8d/Sd+A==';

    useEffect(() => {
        fetchMensen();
        loadFavoriteMensa();
    }, []);

    const fetchMensen = async () => {
        try {
            const response = await fetch(API_URL, {
                headers: {
                    'X-API-KEY': API_KEY,
                },
            });
            const data = await response.json();
            setMensen(data);
        } catch (error) {
            console.error('Fehler beim Laden der Mensen:', error);
            Alert.alert('Fehler', 'Konnte Mensen nicht laden.');
        }
    };

    const saveFavoriteMensa = async () => {
        try {
            await AsyncStorage.setItem('favoriteMensa', selectedMensa);
            Alert.alert('Gespeichert', 'Lieblingsmensa wurde gespeichert.');
        } catch (error) {
            console.error('Speicherfehler:', error);
        }
    };

    const loadFavoriteMensa = async () => {
        try {
            const saved = await AsyncStorage.getItem('favoriteMensa');
            if (saved) setSelectedMensa(saved);
        } catch (error) {
            console.error('Fehler beim Laden der Lieblingsmensa:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Einstellungen</Text>
            <Text>Angemeldet als: {username}</Text>
            <Text style={styles.label}>Lieblings-Mensa auswählen:</Text>

            <Picker
                selectedValue={selectedMensa}
                onValueChange={(itemValue) => setSelectedMensa(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="-- Bitte wählen --" value="" />
                {mensen.map((mensa: any) => (
                    <Picker.Item key={mensa.id} label={mensa.name} value={mensa.id.toString()} />
                ))}
            </Picker>

            <Button title="Als Lieblingsmensa speichern" onPress={saveFavoriteMensa} color="#17D171" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        marginTop: 20,
        marginBottom: 10,
    },
    picker: {
        backgroundColor: '#eee',
        marginBottom: 20,
    },
});
