import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStorage } from '@/hooks/useStorage';

export default function SettingsScreen() {
    const [mensaList] = useStorage('mensaList', []);
    const [username, setUsername] = useState<string | null>(null);
    const [selectedMensa, setSelectedMensa] = useState<string | null>(null);

    useEffect(() => {
        const loadUserAndFavorites = async () => {
            const storedUsername = await AsyncStorage.getItem('username');
            if (!storedUsername) {
                Alert.alert('Fehler', 'Kein Benutzer eingeloggt.');
                return;
            }
            setUsername(storedUsername);
        };
        loadUserAndFavorites();
    }, []);

    const handleSaveFavorite = async () => {
        if (username && selectedMensa) {
            const key = `favoriteMensen_${username}`;
            const stored = await AsyncStorage.getItem(key);
            let favorites = stored ? JSON.parse(stored) : [];

            if (!favorites.includes(selectedMensa)) {
                favorites.push(selectedMensa);
                await AsyncStorage.setItem(key, JSON.stringify(favorites));
                Alert.alert('Gespeichert', 'Diese Mensa wurde zu deinen Favoriten hinzugefügt.');
            } else {
                Alert.alert('Info', 'Diese Mensa ist bereits als Favorit gespeichert.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Einstellungen</Text>
            {username && (
                <>
                    <Text style={styles.label}>Angemeldet als: {username}</Text>
                    <Text style={styles.label}>Lieblings-Mensa auswählen:</Text>
                    <Picker
                        selectedValue={selectedMensa}
                        onValueChange={setSelectedMensa}
                        style={styles.picker}
                    >
                        {mensaList.map((mensa) => (
                            <Picker.Item key={mensa.id} label={mensa.name} value={mensa.id.toString()} />
                        ))}
                    </Picker>

                    <Pressable style={styles.button} onPress={handleSaveFavorite}>
                        <Text style={styles.buttonText}>Als Lieblingsmensa speichern</Text>
                    </Pressable>
                </>
            )}
        </View>
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
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    picker: {
        backgroundColor: '#f2f2f2',
    },
    button: {
        backgroundColor: '#39e297',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});
