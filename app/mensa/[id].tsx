<<<<<<< HEAD
import MealRating from "../../components/MealRating";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

type Price = {
  priceType: string;
  price: number;
};

type Meal = {
  ID?: number;
  name?: string;
  category?: string;
  date: string;
  canteenId: number;
  prices?: Price[];
};

type DayData = {
  date: string;
  canteenId: number;
  meals?: Meal[];
};

const API_KEY =
  "eQqAIq+kKLDkHKJOQK99V4H/DWmFdkyBzvvL1ceWBGHjKTpoEITV/KVTsPa7NV10FHpEqZd78KMb/RAoihGylyXLkIs6hvU9ZnfdwltTt7l/CRJmgu6LA/PRH+9X5EH0F+N2/b6dO0AudBO4hjtRLVUg2aygxKvvpVAv0YaVQc9Sz1/crbpPTEImpoDYlrDPYBUZUjNgA88mJtc43f73Begxdm6EDPDTLQUWsPVqdzB5OM8Eci/nXx8SwYQxwM64I86otLkZ0SQilDoUmfnHREXT5MLrOcG8S914HH6OWYqNPSCPsQZClmhyYTrbLj79AfF5PozRA66w5JK8d/Sd+A==";

export default function MensaDetailScreen() {
  const { id } = useLocalSearchParams();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const fetchSpeiseplan = async () => {
      const today = "2025-05-05"; //new Date().toISOString().split("T")[0];
      const cacheKey = `meals_${today}_canteen_${id}`;

      try {
        const url = `https://mensa.gregorflachs.de/api/v1/menue?loadingtype=complete&startdate=${today}&enddate=${today}`;
        const response = await fetch(url, {
          headers: {
            "X-API-KEY": API_KEY,
            Accept: "application/json",
          },
        });
        if (!response.ok) throw new Error(`HTTP Fehler: ${response.status}`);

        const data = await response.json();
        const allMeals: Meal[] = [];

        (data as DayData[]).forEach((day) => {
          if (day.canteenId.toString() === id) {
            day.meals?.forEach((meal) => {
              allMeals.push({
                ID: meal.ID ?? meal.id ?? null,
                name: meal.name,
                category: meal.category,
                prices: meal.prices,
                date: day.date,
                canteenId: day.canteenId,
              });
            });
          }
        });

        setMeals(allMeals);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(allMeals));
      } catch (error) {
        console.error("Fehler beim Laden:", error);
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          setMeals(JSON.parse(cached));
          Alert.alert(
            "Offline",
            "Es wird ein gespeicherter Speiseplan angezeigt."
          );
        } else {
          Alert.alert(
            "Fehler",
            "Konnte Speiseplan nicht laden und keine gespeicherten Daten gefunden."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSpeiseplan();
  }, [id]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem("mealFavorites");
        const favMeals: Meal[] = stored ? JSON.parse(stored) : [];
        setFavorites(favMeals.map((m) => m.ID!));
      } catch (e) {
        console.error("Fehler beim Laden der Favoriten:", e);
      }
    };
    loadFavorites();
  }, []);

  const handleAddFavorite = async (meal: Meal) => {
    try {
      const stored = await AsyncStorage.getItem("mealFavorites");
      let favMeals: Meal[] = stored ? JSON.parse(stored) : [];

      const exists = favMeals.some((m) => m.ID === meal.ID);

      if (exists) {
        favMeals = favMeals.filter((m) => m.ID !== meal.ID);
        Alert.alert(
          "Entfernt",
          `"${meal.name}" wurde aus den Favoriten entfernt.`
        );
      } else {
        favMeals.push(meal);
        Alert.alert(
          "Hinzugefügt",
          `"${meal.name}" wurde zu den Favoriten hinzugefügt.`
        );
      }

      await AsyncStorage.setItem("mealFavorites", JSON.stringify(favMeals));

      // Update just the list of favorite IDs for quick access
      setFavorites(favMeals.map((m) => m.ID!));
    } catch (error) {
      console.error("Fehler beim Speichern der Favoriten", error);
    }
  };

  const renderItem = ({ item }: { item: Meal }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>{item.name || "Kein Name"}</Text>
        <TouchableOpacity onPress={() => handleAddFavorite(item)}>
          <Ionicons
            name={favorites.includes(item.ID ?? -1) ? "heart" : "heart-outline"}
            size={24}
            color={favorites.includes(item.ID ?? -1) ? "#17D171" : "#ccc"}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.category}>{item.category || "Unbekannt"}</Text>
      <Text style={styles.date}>📅 {item.date}</Text>

      {item.prices?.length ? (
        item.prices.map((price, idx) => (
          <Text key={idx} style={styles.priceLine}>
            💰 <Text style={styles.priceType}>{price.priceType}</Text>:{" "}
            <Text style={styles.price}>{price.price} €</Text>
          </Text>
        ))
      ) : (
        <Text style={styles.noPrice}>Keine Preisinformationen.</Text>
      )}

      <View style={{ marginTop: 8 }}>
        <MealRating mealId={item.ID ?? 0} mealName={item.name} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={{ marginTop: 10 }}>Lade Speiseplan...</Text>
      </View>
    );
  }

  if (meals.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="restaurant-outline" size={50} color="#ccc" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>
          Heute ist kein Speiseplan verfügbar.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speiseplan für Mensa {id}</Text>

      <FlatList
        data={meals}
        keyExtractor={(item, index) => item.ID?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 48,
    backgroundColor: "#f9f9f9",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34495e",
    flexShrink: 1,
  },
  category: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#7f8c8d",
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: "#95a5a6",
    marginBottom: 8,
  },
  priceLine: {
    fontSize: 14,
    marginBottom: 2,
    color: "#2c3e50",
  },
  price: {
    fontWeight: "bold",
    color: "#27ae60",
  },
  priceType: {
    fontWeight: "500",
  },
  noPrice: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
=======
import MealRating from '../(tabs)/MealRating';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Pressable,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Price = {
    priceType: string;
    price: number;
};

type Meal = {
    ID?: number;
    name?: string;
    category?: string;
    date: string;
    canteenId: number;
    prices?: Price[];
};

type DayData = {
    date: string;
    canteenId: number;
    meals?: Meal[];
};

const API_KEY = 'eQqAIq+kKLDkHKJOQK99V4H/DWmFdkyBzvvL1ceWBGHjKTpoEITV/KVTsPa7NV10FHpEqZd78KMb/RAoihGylyXLkIs6hvU9ZnfdwltTt7l/CRJmgu6LA/PRH+9X5EH0F+N2/b6dO0AudBO4hjtRLVUg2aygxKvvpVAv0YaVQc9Sz1/crbpPTEImpoDYlrDPYBUZUjNgA88mJtc43f73Begxdm6EDPDTLQUWsPVqdzB5OM8Eci/nXx8SwYQxwM64I86otLkZ0SQilDoUmfnHREXT5MLrOcG8S914HH6OWYqNPSCPsQZClmhyYTrbLj79AfF5PozRA66w5JK8d/Sd+A==';

export default function MensaDetailScreen() {
    const { id } = useLocalSearchParams();
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpeiseplan = async () => {
            const today = new Date().toISOString().split('T')[0];
            const cacheKey = `meals_${today}_canteen_${id}`;

            try {
                const url = `https://mensa.gregorflachs.de/api/v1/menue?loadingtype=complete&startdate=${today}&enddate=${today}`;
                const response = await fetch(url, {
                    headers: {
                        'X-API-KEY': API_KEY,
                        Accept: 'application/json',
                    },
                });

                if (!response.ok) throw new Error(`HTTP Fehler: ${response.status}`);

                const data = await response.json();
                const allMeals: Meal[] = [];

                (data as DayData[]).forEach((day) => {
                    if (day.canteenId.toString() === id) {
                        day.meals?.forEach((meal) => {
                            allMeals.push({
                                ID: meal.ID ?? meal.id ?? null,
                                name: meal.name,
                                category: meal.category,
                                prices: meal.prices,
                                date: day.date,
                                canteenId: day.canteenId,
                            });
                        });
                    }
                });

                setMeals(allMeals);
                await AsyncStorage.setItem(cacheKey, JSON.stringify(allMeals));
            } catch (error) {
                console.error('Fehler beim Laden:', error);
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) {
                    setMeals(JSON.parse(cached));
                    Alert.alert('Offline', 'Es wird ein gespeicherter Speiseplan angezeigt.');
                } else {
                    Alert.alert('Fehler', 'Konnte Speiseplan nicht laden und keine gespeicherten Daten gefunden.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSpeiseplan();
    }, [id]);

    const handleAddFavorite = async (meal: Meal) => {
        try {
            const key = 'mealFavorites';
            const existing = await AsyncStorage.getItem(key);
            let mealList: Meal[] = existing ? JSON.parse(existing) : [];

            const alreadyExists = mealList.some((m) => m.ID === meal.ID);
            if (!alreadyExists) {
                mealList.push(meal);
                await AsyncStorage.setItem(key, JSON.stringify(mealList));
                Alert.alert('Hinzugefügt', `"${meal.name}" wurde zu deinen Favoriten hinzugefügt.`);
            } else {
                Alert.alert('Schon vorhanden', `"${meal.name}" ist bereits in deinen Favoriten.`);
            }
        } catch (error) {
            console.error('Fehler beim Speichern', error);
        }
    };

    const renderItem = ({ item }: { item: Meal }) => (
        <View style={styles.card}>
            <Text style={styles.name}>{item.name || 'Kein Name'}</Text>
            <Text>Kategorie: {item.category || 'Unbekannt'}</Text>
            <Text>Datum: {item.date}</Text>

            {item.prices?.length ? (
                item.prices.map((price, idx) => (
                    <Text key={idx}>
                        Preis ({price.priceType}): {price.price} €
                    </Text>
                ))
            ) : (
                <Text>Keine Preisinformationen.</Text>
            )}

            <Pressable
                style={styles.favButton}
                onPress={() => handleAddFavorite(item)}
            >
                <Text style={styles.favButtonText}>⭐ Zu Favoriten</Text>
            </Pressable>

            {item.ID && <MealRating mealId={item.ID} mealName={item.name} />}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2ecc71" />
                <Text>Lade Speiseplan...</Text>
            </View>
        );
    }

    if (meals.length === 0) {
        return (
            <View style={styles.center}>
                <Text>Keine Mahlzeiten für diese Mensa gefunden.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Speiseplan für Mensa {id}</Text>
            <FlatList
                data={meals}
                keyExtractor={(item, index) => item.ID?.toString() || index.toString()}
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
    card: {
        backgroundColor: '#f2f2f2',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    favButton: {
        backgroundColor: '#39e297',
        marginTop: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    favButtonText: {
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
    },
>>>>>>> 9293565d1c65379824e6d12413f7cd9823d9fd90
});
