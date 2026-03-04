import { getEventsByUserId } from "@/api/event"
import { ModalEventItem } from "@/components/ui/EventItem"
import { useQuery } from "@tanstack/react-query"
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native"

export default function MyEvents() {
    const { data: events, isLoading } = useQuery({
        queryKey: ["events"],
        queryFn: () => getEventsByUserId(),
    })

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mes événements</Text>
            {isLoading ? (
                <ActivityIndicator size="small" color="#00C896" />
            ) : events && events.length > 0 ? (
                <FlatList data={events} renderItem={ModalEventItem} keyExtractor={(item) => item.slug} contentContainerStyle={styles.listContainer} />
            ) : (
                <Text style={styles.emptyText}>Aucun événement trouvé</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0FBF8",
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#1A2E2A",
        marginVertical: 20,
        textAlign: "center",
        letterSpacing: -0.5,
    },
    emptyText: {
        textAlign: "center",
        color: "#6B8F87",
        fontSize: 15,
        marginTop: 40,
    },
    listContainer: {
        paddingBottom: 32,
        gap: 12,
    },
})
