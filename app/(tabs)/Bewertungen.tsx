import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Review {
    type: 'meal' | 'mensa';
    name: string;
    rating: number;
    comment: string;
}

export default function Bewertungen() {
    const [items, setItems] = useState<string[]>([]);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [rating, setRating] = useState<string>('5');
    const [comment, setComment] = useState('');
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        const loadFavorites = async () => {
            const mealFavorites = await AsyncStorage.getItem('favorite_meals');
            const mensaFavorites = await AsyncStorage.getItem('favorite_mensen');
            const meals = mealFavorites ? JSON.parse(mealFavorites) : [];
            const mensen = mensaFavorites ? JSON.parse(mensaFavorites) : [];
            setItems([...meals.map((m: string) => `🍽️ ${m}`), ...mensen.map((m: string) => `🏫 ${m}`)]);
        };

        const loadReviews = async () => {
            const saved = await AsyncStorage.getItem('reviews');
            if (saved) {
                setReviews(JSON.parse(saved));
            }
        };

        loadFavorites();
        loadReviews();
    }, []);

    const submitReview = async () => {
        if (!selectedItem || !rating) {
            Alert.alert('Missing info', 'Please select an item and enter a rating.');
            return;
        }

        const type = selectedItem.startsWith('🍽️') ? 'meal' : 'mensa';
        const name = selectedItem.substring(3);
        const review: Review = { type, name, rating: parseInt(rating), comment };

        const updated = [...reviews, review];
        setReviews(updated);
        await AsyncStorage.setItem('reviews', JSON.stringify(updated));

        setSelectedItem(null);
        setRating('5');
        setComment('');
        Alert.alert('Thank you!', 'Your review has been saved.');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>⭐ Bewertungen</Text>

            <Text style={styles.label}>Select a Meal or Mensa</Text>
            <FlatList
                data={items}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <Text
                        style={[styles.item, item === selectedItem && styles.selectedItem]}
                        onPress={() => setSelectedItem(item)}
                    >
                        {item}
                    </Text>
                )}
            />

            <Text style={styles.label}>Rating (1–5)</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={rating}
                onChangeText={setRating}
                maxLength={1}
            />

            <Text style={styles.label}>Comment (optional)</Text>
            <TextInput
                style={styles.input}
                value={comment}
                onChangeText={setComment}
                placeholder="Write your feedback..."
            />

            <Button title="Submit Review" onPress={submitReview} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    label: {
        marginTop: 16,
        fontWeight: '600',
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 6,
        padding: 8,
        marginTop: 4,
    },
    item: {
        padding: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
        fontSize: 16,
    },
    selectedItem: {
        backgroundColor: '#e0f7fa',
        fontWeight: 'bold',
    },
});
