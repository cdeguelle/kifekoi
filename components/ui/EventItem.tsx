import { EventResponse } from "@/api/event"
import { Colors } from "@/constants/Colors"
import { router } from "expo-router"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const EventCard = ({ item, onPress }: { item: EventResponse; onPress: () => void }) => (
    <TouchableOpacity style={styles.eventItem} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.imageContainer}>
            <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
            <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{item.type}</Text>
            </View>
        </View>
        <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <View style={styles.dateRow}>
                <Text style={styles.eventDate}>
                    📅 {new Date(item.startDate).toLocaleDateString("fr-FR")} — {new Date(item.endDate).toLocaleDateString("fr-FR")}
                </Text>
            </View>
            <Text style={styles.eventDescription} numberOfLines={2}>
                {item.description}
            </Text>
        </View>
    </TouchableOpacity>
)

export const EventItem = ({ item }: { item: EventResponse }) => (
    <EventCard item={item} onPress={() => router.push(`/event/${item.id}`)} />
)

export const ModalEventItem = ({ item }: { item: EventResponse }) => (
    <EventCard item={item} onPress={() => { router.back(); router.push(`/event/${item.id}`) }} />
)

const styles = StyleSheet.create({
    eventItem: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 4,
        overflow: "hidden",
    },
    imageContainer: {
        position: "relative",
    },
    coverImage: {
        width: "100%",
        height: 160,
    },
    typeBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    typeBadgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    eventContent: {
        padding: 14,
        gap: 6,
    },
    eventTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: Colors.text,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    eventDate: {
        fontSize: 13,
        color: Colors.textMuted,
    },
    eventDescription: {
        fontSize: 14,
        color: Colors.textMuted,
        lineHeight: 20,
    },
})
