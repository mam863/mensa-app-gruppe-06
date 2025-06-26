import React, { useEffect, useState } from 'react';
import { Text, ScrollView, Alert } from 'react-native';
import { saveData, loadData } from '../../hooks/useStorage';
import { useInternetStatus } from '../../hooks/useInternetStatus';

// API-Konstanten
const API_URL = 'https://mensa.gregorflachs.de/api/v1/canteen?loadingtype=complete';
const API_KEY = 'oQtJbCh2JMfR5uyzxob/tPI0uvtRVlSbEz4B6HRBy0t/9gWL+/7JnXqmMxG6QUJQUTrYpU0Qaw5caMl84+QU9NF5OkSovRT5g/3c8R/RGjKI9AyrJeUgYzCi7lG+LdZQTsGNeoBb0UE7rp+Z/AWR3jzeWJajiK6tS8P3z7W9jrg2iB5ZdoFqiWAAKje5aFwW4gA8RsDQxyvhSXxE1ceqJZd0xA9LhBKTbQsKwsTKxXf4hglPNpz6fECodjCX3uY3ixwIu1aT+UXc9bn4Rj530/WUg07P/p2eYbi75WYPOy5eFNKwh63Cuj8QuoXz5HmZJbQIoaPNV4ujn9e3NRb3Fg==';

export default function MenuScreen() {
    const [menu, setMenu] = useState<string | null>(null);
    const isConnected = useInternetStatus();

    useEffect(() => {
        if (isConnected === null) return;

        const fetchMenu = async () => {
            if (isConnected) {
                try {
                    const res = await fetch(API_URL, {
                        headers: {
                            'X-API-Key': API_KEY
                        }
                    });
                    if (!res.ok) throw new Error("Serverfehler");

                    const json = await res.json();

                    // 📅 Aktuelles Datum im Format YYYY-MM-DD
                    const today = new Date().toISOString().split("T")[0];

                    // 🔍 Mensa auswählen (z. B. Aachen Mitte – anpassen!)
                    const mensa = json.find((c: any) => c.canteen_name === "Mensa Aachen Mitte");

                    if (!mensa) throw new Error("Mensa nicht gefunden");

                    const dayPlan = mensa.dates.find((d: any) => d.date === today);

                    if (!dayPlan) throw new Error("Kein Plan für heute");

                    const data = JSON.stringify(dayPlan);
                    setMenu(data);
                    await saveData("menuData", data);

                } catch (e) {
                    console.error("Fehler beim Laden aus dem Internet:", e);
                    Alert.alert(
                        "Fehler beim Laden",
                        "Aktuelle Daten konnten nicht geladen werden. Es wird versucht, gespeicherte Daten anzuzeigen."
                    );
                    try {
                        const cached = await loadData("menuData");
                        if (cached) {
                            setMenu(cached);
                            Alert.alert("Hinweis", "Es wurden gespeicherte Daten angezeigt.");
                        } else {
                            setMenu(null);
                            Alert.alert("Keine Daten", "Es sind keine gespeicherten Daten vorhanden.");
                        }
                    } catch (storageError) {
                        console.error("Speicherfehler:", storageError);
                        Alert.alert("Speicherfehler", "Lokale Daten konnten nicht geladen werden.");
                    }
                }
            } else {
                Alert.alert("Offline", "Keine Internetverbindung. Es wird versucht, gespeicherte Daten zu laden.");
                try {
                    const cached = await loadData("menuData");
                    if (cached) {
                        setMenu(cached);
                    } else {
                        setMenu(null);
                        Alert.alert("Keine Daten", "Es sind keine gespeicherten Daten vorhanden.");
                    }
                } catch (storageError) {
                    console.error("Speicherfehler:", storageError);
                    Alert.alert("Speicherfehler", "Lokale Daten konnten nicht geladen werden.");
                }
            }
        };

        fetchMenu();
    }, [isConnected]);

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text>
                {menu ? JSON.stringify(JSON.parse(menu), null, 2) : "Keine Daten verfügbar"}
            </Text>
        </ScrollView>
    );
}
