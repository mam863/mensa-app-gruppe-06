import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ ضع هنا مفتاح API الصحيح الخاص بك
const GEMINI_API_KEY = 'AIzaSyCvfpW-aL6Ro8yF3vM4RH1mOHDXEEDx_1w';

export default function KIFeature() {
    const [meals, setMeals] = useState<string[]>([]);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadMeals = async () => {
            const today = new Date().toISOString().split('T')[0];
            const cached = await AsyncStorage.getItem(`meals_${today}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                const names = parsed.map((m: any) => m.name).filter((name: string) => !!name);
                setMeals(names);
            } else {
                Alert.alert('No meals found', 'Please open the Speiseplan screen at least once.');
            }
        };
        loadMeals();
    }, []);

    const askGemini = async () => {
        if (meals.length === 0) {
            Alert.alert('No meals available', 'Cannot generate suggestion.');
            return;
        }

        setLoading(true);
        setSuggestion(null);

        // ✅ إنشاء prompt قبل الاستخدام
        const prompt = `Here is a list of meals: ${meals.join(', ')}. Suggest one meal that would be a good choice today and explain why in one short sentence.`;

        try {
            const response = await fetch(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': GEMINI_API_KEY,
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: prompt }],
                            },
                        ],
                    }),
                }
            );

            const data = await response.json();

            if (response.ok && data.candidates && data.candidates.length > 0) {
                const text = data.candidates[0].content.parts[0].text;
                setSuggestion(text);
            } else {
                console.error('Gemini error:', data);
                Alert.alert('Error', 'Failed to get suggestion from Gemini.');
            }
        } catch (error) {
            console.error('Gemini API error:', error);
            Alert.alert('Error', 'Something went wrong with Gemini.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎓 KI Feature – Meal Suggestion</Text>
            <Button title="🔍 Suggest a Meal" onPress={askGemini} disabled={loading} />

            {loading && (
                <View style={{ marginTop: 20 }}>
                    <ActivityIndicator size="large" color="#007bff" />
                </View>
            )}

            {suggestion && (
                <View style={styles.result}>
                    <Text style={styles.resultText}>{suggestion}</Text>
                </View>
            )}
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
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    result: {
        marginTop: 30,
        padding: 16,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
    },
    resultText: {
        fontSize: 16,
        color: '#333',
    },
});
