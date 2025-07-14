import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Button,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

type Canteen = {
  id: number;
  name: string;
  address?: {
    street: string;
    city: string;
    zipcode: string;
  };
};

type Meal = {
  ID: number;
  name: string;
  category?: string;
  date?: string;
  canteenId?: number;
};

export default function FavoritenScreen() {
  const router = useRouter();
  const [favoriteMensen, setFavoriteMensen] = useState<Canteen[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"mensen" | "meals">("mensen");

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const mensaListRaw = await AsyncStorage.getItem("mensaList");
      const mensaFavoritesRaw = await AsyncStorage.getItem("mensaFavorites");
      const mealFavoritesRaw = await AsyncStorage.getItem("mealFavorites");

      const mensaFavorites: number[] = mensaFavoritesRaw
        ? JSON.parse(mensaFavoritesRaw)
        : [];

      const allMensen: Canteen[] = mensaListRaw
        ? JSON.parse(mensaListRaw)
        : [];
      const selectedMensen = allMensen.filter((m) =>
        mensaFavorites.includes(m.id)
      );
      setFavoriteMensen(selectedMensen);

      const selectedMeals: Meal[] = mealFavoritesRaw
        ? JSON.parse(mealFavoritesRaw)
        : [];
      setFavoriteMeals(selectedMeals);
    } catch (error) {
      console.error("Fehler beim Laden der Favoriten:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="green" />
        <Text style={{ marginTop: 10 }}>Lade Favoriten...</Text>
      </View>
    );
  }

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <Pressable
        style={[
          styles.tabButton,
          activeTab === "mensen" && styles.activeTab,
        ]}
        onPress={() => setActiveTab("mensen")}
      >
        <Text style={styles.tabText}>💚 Mensen</Text>
      </Pressable>
      <Pressable
        style={[
          styles.tabButton,
          activeTab === "meals" && styles.activeTab,
        ]}
        onPress={() => setActiveTab("meals")}
      >
        <Text style={styles.tabText}>💚 Gerichte</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="🔄 AKTUALISIEREN" onPress={loadFavorites} />
      {renderTabButtons()}

      {activeTab === "mensen" ? (
        favoriteMensen.length === 0 ? (
          <Text style={styles.empty}>Keine Mensen als Favorit markiert.</Text>
        ) : (
          <FlatList
            data={favoriteMensen}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => router.push(`/mensa/${item.id}`)}
              >
                <Text style={styles.name}>{item.name}</Text>
                {item.address && (
                  <Text style={styles.subtext}>
                    {item.address.street}, {item.address.zipcode}{" "}
                    {item.address.city}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        )
      ) : favoriteMeals.length === 0 ? (
        <Text style={styles.empty}>Keine Gerichte als Favorit markiert.</Text>
      ) : (
        <FlatList
          data={favoriteMeals}
          keyExtractor={(item, index) =>
            item.ID ? item.ID.toString() : index.toString()
          }
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.name}>{item.name || "Kein Name"}</Text>
              <Text style={styles.subtext}>
                Kategorie: {item.category || "Keine Angabe"}
              </Text>
              <Text style={styles.subtext}>
                Datum: {item.date || "Unbekannt"} | Mensa ID: {item.canteenId}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
    gap: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#eee",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#a6e4a6",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  item: {
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtext: {
    fontSize: 14,
    color: "#555",
  },
  empty: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#888",
    marginTop: 20,
    textAlign: "center",
  },
});
