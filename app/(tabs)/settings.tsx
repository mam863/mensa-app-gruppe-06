import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStorage } from '@/hooks/useStorage';

export default function SettingsScreen() {
    const [mensaList] = useStorage('mensaList', []);
    const [username, setUsername] = useState<string | null>(null);
    const [favoriteMensa, setFavoriteMensa] = useStorage<string | null>(
        username ? `favoriteMensa_${username}` : '',
        null
    );

    useEffect(() => {
        const loadUsername = async () => {
            try {
                const name = await AsyncStorage.getItem('username');
                if (!name) {
                    Alert.alert('Fehler', 'Kein Benutzer eingeloggt.');
                } else {
                    setUsername(name);
                }
            } catch (error) {
                Alert.alert('Fehler beim Laden des Benutzernamens.');
            }
        };
        loadUsername();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Einstellungen</Text>

            {username && (
                <>
                    <Text style={styles.label}>Angemeldet als: {username}</Text>
                    <Text style={styles.label}>Lieblings-Mensa auswählen:</Text>
                    <Picker
                        selectedValue={favoriteMensa}
                        onValueChange={setFavoriteMensa}
                        style={styles.picker}
                    >
                        {mensaList.map((mensa) => (
                            <Picker.Item key={mensa.id} label={mensa.name} value={mensa.id.toString()} />
                        ))}
                    </Picker>
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
});
