import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveData = async (key: string, value: string) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (e) {
        console.error("Fehler beim Speichern", e);
    }
};

export const loadData = async (key: string): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(key);
    } catch (e) {
        console.error("Fehler beim Laden", e);
        return null;
    }
};