import { EventResponse, EventType, getByTypes } from "@/api/event"
import { acceptFriendRequest, cancelFriendRequest, getPendingFriendRequests, getSentFriendRequests } from "@/api/user"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useGetToken } from "@/hooks/useGetToken"
import { useLocation } from "@/hooks/useLocation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BlurView } from "expo-blur"
import { Checkbox } from "expo-checkbox"
import { router } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import MapView, { Callout, Marker } from "react-native-maps"
import Modal from "react-native-modal"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Toast } from "toastify-react-native"

export default function HomeScreen() {
    const insets = useSafeAreaInsets()
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null)
    const [isEventModalVisible, setIsEventModalVisible] = useState(false)
    const [isTypeModalVisible, setIsTypeModalVisible] = useState(false)
    const [types, setTypes] = useState<EventType[]>(Object.values(EventType))
    const { decodedToken } = useGetToken()
    const queryClient = useQueryClient()
    const { location, lastLocationStored } = useLocation()

    const { data: events, isLoading } = useQuery({
        queryKey: ["eventsByType"],
        queryFn: () => getByTypes(types),
        enabled: !!types.length,
    })

    const { data: pendingFriendRequests, isLoading: isPendingFriendRequestsLoading } = useQuery({
        queryKey: ["pendingFriendRequests"],
        queryFn: () => getPendingFriendRequests(),
        enabled: !!decodedToken?.userId,
    })

    const { data: sentFriendRequests, isLoading: isSentFriendRequestsLoading } = useQuery({
        queryKey: ["sentFriendRequests"],
        queryFn: () => getSentFriendRequests(),
        enabled: !!decodedToken?.userId,
    })

    const { mutate: cancelFriendRequestMutation, isPending: isCancellingFriendRequest } = useMutation({
        mutationFn: (requestId: string) => cancelFriendRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] })
            queryClient.invalidateQueries({ queryKey: ["pendingFriendRequests"] })
            queryClient.invalidateQueries({ queryKey: ["friends"] })
            Toast.success("Invitation acceptée avec succès !")
        },
    })

    const { mutate: acceptFriendRequestMutation, isPending: isAcceptingFriendRequest } = useMutation({
        mutationFn: (requestId: string) => acceptFriendRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pendingFriendRequests"] })
            queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] })
            queryClient.invalidateQueries({ queryKey: ["friends"] })
            Toast.success("Invitation annulée avec succès !")
        },
    })

    const handleNotificationPress = () => {
        setIsModalVisible(true)
    }

    const handleTypePress = () => {
        setIsTypeModalVisible(true)
    }

    const applyFilters = () => {
        queryClient.invalidateQueries({ queryKey: ["eventsByType"] })
        setIsTypeModalVisible(false)
    }

    if (location === null && lastLocationStored === null) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Récupération de votre position...</Text>
            </ThemedView>
        )
    }

    if (isLoading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Chargement des événements...</Text>
            </ThemedView>
        )
    }

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
            <View style={[styles.headerContainer, { top: insets.top + 16 }]}>
                <BlurView style={styles.header} intensity={75} tint="light">
                    <TouchableOpacity onPress={handleNotificationPress}>
                        <IconSymbol name="envelope" size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                </BlurView>
                <BlurView style={styles.header} intensity={75} tint="light">
                    <TouchableOpacity onPress={handleTypePress}>
                        <IconSymbol name="list.bullet.rectangle" size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                </BlurView>
            </View>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 48.8566,
                    longitude: 2.3522,
                    latitudeDelta: 0.12,
                    longitudeDelta: 0.08,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {events &&
                    events.length > 0 &&
                    events
                        .filter((event) => event.address && event.address.latitude && event.address.longitude)
                        .map((event) => (
                            <Marker
                                key={event.id}
                                coordinate={{
                                    latitude: event.address.latitude,
                                    longitude: event.address.longitude,
                                }}
                                onPress={() => {
                                    if (Platform.OS === "android") {
                                        setSelectedEvent(event)
                                        setIsEventModalVisible(true)
                                    }
                                }}
                                onCalloutPress={() => router.push(`/event/${event.id}`)}
                            >
                                {Platform.OS === "ios" && (
                                    <Callout style={styles.callout} tooltip>
                                        <View style={styles.calloutContent}>
                                            <Image source={{ uri: event.coverImage }} style={styles.coverImage} />
                                            <Text>{event.title}</Text>
                                            <Text numberOfLines={3} ellipsizeMode="tail" style={styles.description}>
                                                {event.description}
                                            </Text>
                                        </View>
                                    </Callout>
                                )}
                            </Marker>
                        ))}
            </MapView>
            <Modal isVisible={isModalVisible} onBackdropPress={() => setIsModalVisible(false)}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Invitations</Text>
                    {isPendingFriendRequestsLoading || (isSentFriendRequestsLoading && <ActivityIndicator size="small" />)}
                    <View style={styles.modalSection}>
                        <Text style={styles.modalSubtitle}>En attente</Text>
                        {pendingFriendRequests &&
                            pendingFriendRequests.length > 0 &&
                            pendingFriendRequests.map((request) => (
                                <View key={request.id} style={styles.modalItem}>
                                    <View style={styles.modalItemContent}>
                                        {request.sender.avatar && <Image source={{ uri: request.sender.avatar }} style={styles.modalItemAvatar} />}
                                        <Text>
                                            {request.sender.firstname} {request.sender.lastname}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => acceptFriendRequestMutation(request.id)}>
                                        {isAcceptingFriendRequest ? <ActivityIndicator size="small" /> : <IconSymbol name="person.fill.checkmark" size={24} color="green" />}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        {pendingFriendRequests && pendingFriendRequests.length === 0 && <Text>Aucune invitation en attente</Text>}
                    </View>
                    <View style={styles.modalSection}>
                        <Text style={styles.modalSubtitle}>Envoyées</Text>
                        {sentFriendRequests &&
                            sentFriendRequests.length > 0 &&
                            sentFriendRequests.map((request) => (
                                <View key={request.id} style={styles.modalItem}>
                                    <View style={styles.modalItemContent}>
                                        {request.receiver.avatar && <Image source={{ uri: request.receiver.avatar }} style={styles.modalItemAvatar} />}
                                        <Text>
                                            {request.receiver.firstname} {request.receiver.lastname}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => cancelFriendRequestMutation(request.id)}>
                                        {isCancellingFriendRequest ? <ActivityIndicator size="small" /> : <IconSymbol name="person.fill.xmark" size={24} color="red" />}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        {sentFriendRequests && sentFriendRequests.length === 0 && <Text>Aucune invitation envoyée</Text>}
                    </View>
                </View>
            </Modal>
            <Modal isVisible={isTypeModalVisible} onBackdropPress={() => setIsTypeModalVisible(false)}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Filtrer par type</Text>
                    {Object.values(EventType).map((type) => (
                        <View key={type} style={styles.modalItem}>
                            <Checkbox value={types.includes(type)} onValueChange={() => setTypes(types.includes(type) ? types.filter((t) => t !== type) : [...types, type])} />
                            <Text>{type}</Text>
                        </View>
                    ))}
                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={() => setTypes(Object.values(EventType))} style={[styles.modalButton, { backgroundColor: "#eee", flex: 1 }]}>
                            <Text style={{ color: "black" }}>Réinitialiser</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={applyFilters} style={[styles.modalButton, { backgroundColor: "#00C896", flex: 1 }]}>
                            <Text style={{ color: "white" }}>Appliquer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal isVisible={isEventModalVisible} onBackdropPress={() => setIsEventModalVisible(false)}>
                <View style={styles.modalContent}>
                    {selectedEvent && (
                        <>
                            <Image source={{ uri: selectedEvent.coverImage }} style={styles.coverImage} />
                            <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                            <Text style={styles.description}>{selectedEvent.description}</Text>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity onPress={() => setIsEventModalVisible(false)} style={[styles.modalButton, { backgroundColor: "#eee", flex: 1 }]}>
                                    <Text style={{ color: "black" }}>Fermer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsEventModalVisible(false)
                                        router.push(`/event/${selectedEvent.id}`)
                                    }}
                                    style={[styles.modalButton, { backgroundColor: "#00C896", flex: 1 }]}
                                >
                                    <Text style={{ color: "white" }}>Voir détails</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </Modal>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: "column",
        gap: 10,
        position: "absolute",
        left: 16,
        zIndex: 1,
    },
    header: {
        padding: 16,
        zIndex: 1,
        borderRadius: 50,
        overflow: "hidden",
        backgroundColor: Colors.light.background,
    },
    map: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    coverImage: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
        borderRadius: 16,
        alignSelf: "center",
    },
    callout: {
        position: "relative",
        backgroundColor: "white",
        borderRadius: 16,
        maxWidth: 220,
        maxHeight: 300,
    },
    calloutContent: {
        padding: 10,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 8,
    },
    description: {
        fontSize: 12,
        color: "gray",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignSelf: "center",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexDirection: "column",
        gap: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    modalSubtitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    modalSection: {
        flexDirection: "column",
        gap: 10,
    },
    modalItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        gap: 10,
    },
    modalItemAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    modalItemContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        gap: 10,
    },
    modalButton: {
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
})
