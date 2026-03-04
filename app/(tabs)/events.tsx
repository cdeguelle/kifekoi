import { EventResponse, getEvents } from "@/api/event"
import { EventItem } from "@/components/ui/EventItem"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useGetToken } from "@/hooks/useGetToken"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { useQuery } from "@tanstack/react-query"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function EventsScreen() {
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredEvents, setFilteredEvents] = useState<EventResponse[]>([])
    const [filteredBy, setFilteredBy] = useState<"all" | "my" | "going">("all")
    const { showActionSheetWithOptions } = useActionSheet()
    const { decodedToken } = useGetToken()

    const { data, isLoading } = useQuery({
        queryKey: ["events"],
        queryFn: getEvents,
    })

    useEffect(() => {
        const filterEvents = (searchQuery: string) => {
            if (!searchQuery.trim()) {
                setFilteredEvents(data ?? [])
                return
            }

            const query = searchQuery.toLowerCase()
            const filtered = data?.filter(
                (event) => event.title.toLowerCase().includes(query) || event.description.toLowerCase().includes(query) || event.type.toLowerCase().includes(query)
            )
            setFilteredEvents(filtered ?? [])
        }
        filterEvents(searchQuery)
    }, [searchQuery, data])

    useEffect(() => {
        if (filteredBy === "my") {
            setFilteredEvents(data?.filter((event) => event.ownerId === decodedToken?.userId) ?? [])
        } else if (filteredBy === "going") {
            setFilteredEvents(data?.filter((event) => event.participants.some((participant) => participant.id === decodedToken?.userId)) ?? [])
        } else {
            setFilteredEvents(data ?? [])
        }
    }, [filteredBy, data, decodedToken])

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00C896" />
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.screenTitle}>Événements</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un événement..."
                    placeholderTextColor="#6B8F87"
                    onChangeText={(text) => setSearchQuery(text)}
                />
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() =>
                        showActionSheetWithOptions(
                            {
                                title: "Filtrer par",
                                options: ["Tous", "Mes événements", "J'y vais"],
                                cancelButtonIndex: 0,
                            },
                            (index) => {
                                if (index === 0) {
                                    setFilteredBy("all")
                                } else if (index === 1) {
                                    setFilteredBy("my")
                                } else if (index === 2) {
                                    setFilteredBy("going")
                                }
                            }
                        )
                    }
                >
                    <IconSymbol name="line.3.horizontal.decrease.circle.fill" size={28} color="#00C896" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={searchQuery.length > 0 || filteredBy !== "all" ? filteredEvents : data}
                renderItem={EventItem}
                keyExtractor={(item) => item.slug}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0FBF8",
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0FBF8",
    },
    screenTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1A2E2A",
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    searchContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 13,
        borderRadius: 14,
        fontSize: 15,
        borderWidth: 1.5,
        borderColor: "#C8EDE4",
        color: "#1A2E2A",
    },
    filterButton: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "#C8EDE4",
    },
    listContainer: {
        paddingBottom: 32,
    },
})
