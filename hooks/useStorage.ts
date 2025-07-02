import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Speicher-Hook
export function useStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        const loadValue = async () => {
            try {
                const item = await AsyncStorage.getItem(key);
                if (item !== null) {
                    setStoredValue(JSON.parse(item));
                }
            } catch (error) {
                console.error('Fehler beim Laden:', error);
            }
        };
        loadValue();
    }, [key]);

    const setValue = (value: T) => {
        setStoredValue(value);
        try {
            AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
        }
    };

    return [storedValue, setValue];
}
