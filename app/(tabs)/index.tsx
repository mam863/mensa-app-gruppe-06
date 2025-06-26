import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const [name, setName] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        const savedName = await AsyncStorage.getItem('username');
        if (savedName === name.trim()) {
            router.push('/home'); // 🟢 weiter zur Startseite
        } else {
            Alert.alert('Name nicht gefunden', 'Bitte registriere dich zuerst.');
            setIsNewUser(true);
        }
    };

    const handleRegister = async () => {
        if (name.trim().length === 0) {
            Alert.alert('Ungültiger Name', 'Bitte gib einen gültigen Namen ein.');
            return;
        }
        await AsyncStorage.setItem('username', name.trim());
        Alert.alert('Registrierung erfolgreich', `Willkommen, ${name.trim()}!`);
        router.push('/home');
    };

    return (
        <View style={styles.container}>
            <Image source={require('../assets/icon_compressed.jpg')} style={styles.logo} />
            <Text style={styles.title}>FeedMe</Text>
            <Text style={styles.subtitle}>Bitte gib deinen Namen ein:</Text>
            <TextInput
                placeholder="z. B. Anna"
                style={styles.input}
                value={name}
                onChangeText={setName}
            />
            <Pressable style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Anmelden</Text>
            </Pressable>

            {isNewUser && (
                <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Registrieren</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', paddingTop: 100, backgroundColor: '#fff' },
    logo: { width: 100, height: 100, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold' },
    subtitle: { fontSize: 16, color: 'gray', marginVertical: 20 },
    input: {
        width: '80%', padding: 12, borderWidth: 1, borderColor: '#ccc',
        borderRadius: 8, marginBottom: 20
    },
    button: {
        backgroundColor: '#39e297', paddingVertical: 12, paddingHorizontal: 32,
        borderRadius: 8, marginBottom: 10
    },
    secondaryButton: {
        backgroundColor: '#666'
    },
    buttonText: {
        color: '#fff', fontWeight: 'bold', fontSize: 16
    }
});
