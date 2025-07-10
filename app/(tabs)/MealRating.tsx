import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';

type MealRatingProps = {
    mealId: number;
    mealName?: string;
};

type Rating = {
    id: number;
    mealId: number;
    rating: number;
    comment?: string;
};

const API_KEY = 'eQqAIq+kKLDkHKJOQK99V4H/DWmFdkyBzvvL1ceWBGHjKTpoEITV/KVTsPa7NV10FHpEqZd78KMb/RAoihGylyXLkIs6hvU9ZnfdwltTt7l/CRJmgu6LA/PRH+9X5EH0F+N2/b6dO0AudBO4hjtRLVUg2aygxKvvpVAv0YaVQc9Sz1/crbpPTEImpoDYlrDPYBUZUjNgA88mJtc43f73Begxdm6EDPDTLQUWsPVqdzB5OM8Eci/nXx8SwYQxwM64I86otLkZ0SQilDoUmfnHREXT5MLrOcG8S914HH6OWYqNPSCPsQZClmhyYTrbLj79AfF5PozRA66w5JK8d/Sd+A==';

export default function MealRating({ mealId, mealName }: MealRatingProps) {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadRatings();
    }, []);

    async function loadRatings() {
        setLoading(true);
        try {
            const res = await fetch(`https://mensa.gregorflachs.de/api/v1/mealreview?mealId=${mealId}`, {
                headers: { 'X-API-KEY': API_KEY }
            });
            const data = await res.json();
            setRatings(Array.isArray(data) ? data : []);
        } catch (err) {
            setRatings([]);
        } finally {
            setLoading(false);
        }
    }

    function calcAverage(ratingsArr: Rating[]) {
        if (!ratingsArr.length) return "-";
        const avg = ratingsArr.reduce((s, r) => s + r.rating, 0) / ratingsArr.length;
        return avg.toFixed(1);
    }

    async function handleSubmit() {
        if (!myRating) {
            Alert.alert("Fehler", "Bitte wähle eine Bewertung (Sterne) aus.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('https://mensa.gregorflachs.de/api/v1/mealreview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': API_KEY
                },
                body: JSON.stringify({
                    mealId,
                    rating: myRating,
                    comment: myComment
                })
            });
            if (!res.ok) {
                const err = await res.text();
                throw new Error(err);
            }
            setShowModal(false);
            setMyRating(0);
            setMyComment('');
            await loadRatings();
            Alert.alert("Erfolg", "Danke für deine Bewertung!");
        } catch (err: any) {
            Alert.alert("Fehler", err.message || "Bewertung konnte nicht gespeichert werden.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View style={styles.ratingBox}>
            <Text style={styles.avgRating}>⭐ {calcAverage(ratings)} ({ratings.length} Bewertungen)</Text>
            <TouchableOpacity style={styles.button} onPress={() => setShowModal(true)}>
                <Text style={styles.buttonText}>Bewerten</Text>
            </TouchableOpacity>

            {/* Letzte Kommentare */}
            {ratings.length > 0 && (
                <View style={styles.commentsBox}>
                    <Text style={styles.commentsLabel}>Letzte Kommentare:</Text>
                    {ratings.slice(-3).reverse().map((r, i) =>
                        !!r.comment && <Text key={i} style={styles.comment}>– {r.comment}</Text>
                    )}
                </View>
            )}

            {/* Modal für Bewertung */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Bewerte "{mealName || ''}"</Text>
                        <Text style={styles.label}>Wie viele Sterne?</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map(n =>
                                <TouchableOpacity key={n} onPress={() => setMyRating(n)}>
                                    <Text style={n <= myRating ? styles.goldStar : styles.greyStar}>★</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Kommentar (optional)"
                            value={myComment}
                            onChangeText={setMyComment}
                            multiline
                        />
                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={[styles.button, styles.modalBtn]} onPress={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={styles.buttonText}>Absenden</Text>
                                }
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setShowModal(false)}>
                                <Text style={styles.buttonText}>Abbrechen</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    ratingBox: {
        marginTop: 6,
        marginBottom: 10,
    },
    avgRating: {
        fontSize: 15,
        marginBottom: 2,
    },
    button: {
        backgroundColor: '#17D171',
        borderRadius: 7,
        paddingVertical: 6,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    commentsBox: {
        marginTop: 5,
    },
    commentsLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    comment: {
        fontSize: 13,
        color: '#222',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 24,
        minWidth: 260,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
        textAlign: 'center',
    },
    label: {
        marginBottom: 6,
        textAlign: 'center',
    },
    starsRow: {
        flexDirection: 'row',
        marginBottom: 8,
        justifyContent: 'center',
    },
    goldStar: {
        fontSize: 30,
        color: '#FFC300',
        marginHorizontal: 2,
    },
    greyStar: {
        fontSize: 30,
        color: '#ddd',
        marginHorizontal: 2,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        minHeight: 40,
        marginBottom: 2,
        backgroundColor: '#fafafa',
        textAlignVertical: 'top',
    },
    modalBtnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalBtn: {
        flex: 1,
        marginRight: 6,
        backgroundColor: '#17D171',
    },
    cancelBtn: {
        flex: 1,
        marginLeft: 6,
        backgroundColor: '#bbb',
    },
});
