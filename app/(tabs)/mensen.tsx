import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MensenScreen() {
  const router = useRouter();
  const [mensen, setMensen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);

  const API_URL =
    "https://mensa.gregorflachs.de/api/v1/canteen?loadingtype=complete";
  const API_KEY =
    "eQqAIq+kKLDkHKJOQK99V4H/DWmFdkyBzvvL1ceWBGHjKTpoEITV/KVTsPa7NV10FHpEqZd78KMb/RAoihGylyXLkIs6hvU9ZnfdwltTt7l/CRJmgu6LA/PRH+9X5EH0F+N2/b6dO0AudBO4hjtRLVUg2aygxKvvpVAv0YaVQc9Sz1/crbpPTEImpoDYlrDPYBUZUjNgA88mJtc43f73Begxdm6EDPDTLQUWsPVqdzB5OM8Eci/nXx8SwYQxwM64I86otLkZ0SQilDoUmfnHREXT5MLrOcG8S914HH6OWYqNPSCPsQZClmhyYTrbLj79AfF5PozRA66w5JK8d/Sd+A==";

  useEffect(() => {
    const initialize = async () => {
      await fetchMensen();
      await loadFavorites();
      setLoading(false);
    };
    initialize();
  }, []);

  const loadFavorites = async () => {
    const stored = await AsyncStorage.getItem("mensaFavorites");
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  };

  const toggleFavorite = async (id: number) => {
    const isAlreadyFavorite = favorites.includes(id);
    const updatedFavorites = isAlreadyFavorite
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];

    setFavorites(updatedFavorites);
    await AsyncStorage.setItem(
      "mensaFavorites",
      JSON.stringify(updatedFavorites)
    );

    Alert.alert(
      "Favoriten aktualisiert",
      isAlreadyFavorite
        ? "Mensa wurde aus Favoriten entfernt."
        : "Mensa wurde zu Favoriten hinzugefügt."
    );
  };

  const fetchMensen = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        const response = await fetch(API_URL, {
          headers: { "X-API-KEY": API_KEY, Accept: "application/json" },
        });

        if (!response.ok) throw new Error(`HTTP Fehler: ${response.status}`);
        const data = await response.json();
        setMensen(data);
        await AsyncStorage.setItem("mensaList", JSON.stringify(data));
      } else {
        const cached = await AsyncStorage.getItem("mensaList");
        if (cached) {
          setMensen(JSON.parse(cached));
        } else {
          Alert.alert("Offline", "Keine gespeicherten Mensen verfügbar.");
        }
      }
    } catch (error) {
      console.error("Fehler beim Laden:", error);
      Alert.alert("Fehler", "Konnte Mensen nicht laden.");
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const todayOpeningHours = () => {
      const jsToCustomDay = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
      const todayKey = jsToCustomDay[new Date().getDay()];
      const today = item.businessDays?.find((day: any) => day.day === todayKey);

      if (!today || !today.businessHours?.length) return "Heute: 10:00–22:00";

      const hours = today.businessHours
        .map((h: any) => `${h.openAt}–${h.closeAt}`)
        .join(", ");
      return `Heute geöffnet: ${hours}`;
    };

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push(`/mensa/${item.id}`)}
      >
        <View style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
            <Ionicons
              name={favorites.includes(item.id) ? "heart" : "heart-outline"}
              size={22}
              color={favorites.includes(item.id) ? "#17D171" : "#aaa"}
            />
          </TouchableOpacity>
        </View>

        {item.address && (
          <Text style={styles.address}>
            {item.address.street || ""}, {item.address.zipcode || ""}{" "}
            {item.address.city || ""}
          </Text>
        )}

        <Text style={styles.hours}>{todayOpeningHours()}</Text>
        {item.businesshourtype && (
          <Text style={styles.subInfo}>{item.businesshourtype}</Text>
        )}

        <Text style={styles.hours}>
          Öffnungszeiten:{" "}
          {item.businessDays?.length > 0
            ? item.businessDays
                .map(
                  (day: any) =>
                    `${day.day}: ${
                      day.businesshours?.length
                        ? day.businesshours
                            .map(
                              (hour: any) => `${hour.openAt}–${hour.closeAt}`
                            )
                            .join(", ")
                        : "Keine Zeiten"
                    }`
                )
                .join(" | ")
            : "Keine Öffnungszeiten verfügbar"}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={{ marginTop: 12, fontSize: 15, color: "#666" }}>
          Mensen werden geladen...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽 Mensen in Berlin</Text>

      {mensen.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: "#999", fontSize: 16 }}>
            Keine Mensen gefunden.
          </Text>
        </View>
      ) : (
        <FlatList
          data={mensen}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 52,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
  hours: {
    fontSize: 13,
    color: "#444",
    marginTop: 6,
  },
  subInfo: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
