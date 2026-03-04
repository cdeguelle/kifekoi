import { cancelParticipationToEvent, getEvent, participateToEvent } from "@/api/event"
import ColoredLabel from "@/components/ColoredLabel"
import { Colors } from "@/constants/Colors"
import { useGetToken } from "@/hooks/useGetToken"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { router, useLocalSearchParams } from "expo-router"
import React, { useMemo } from "react"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const queryClient = useQueryClient()
    const { decodedToken } = useGetToken()

    const { data: event, isLoading } = useQuery({
        queryKey: ["event", id],
        queryFn: () => getEvent(id),
    })

    const participateMutation = useMutation({
        mutationFn: () => participateToEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["event", id] })
            queryClient.invalidateQueries({ queryKey: ["events"] })
        },
    })

    const cancelParticipationMutation = useMutation({
        mutationFn: () => cancelParticipationToEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["event", id] })
        },
    })

    const isParticipating = useMemo(() => event?.participants.some((participant) => participant.id === decodedToken?.userId), [event, decodedToken])
    const isEventOwner = useMemo(() => event?.ownerId === decodedToken?.userId, [event, decodedToken])

    const handleAvatarPress = (userId: string) => {
        if (userId === decodedToken?.userId) {
            router.push(`/profile`)
        } else {
            router.push(`/user/${userId}`)
        }
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    if (!event) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Événement non trouvé</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image source={{ uri: event.coverImage }} style={styles.coverImage} resizeMode="cover" />

                <View style={styles.contentContainer}>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{event.type}</Text>
                    </View>

                    <Text style={styles.title}>{event.title}</Text>

                    <Text style={styles.date}>
                        Du {new Date(event.startDate).toLocaleDateString("fr-FR")} au {new Date(event.endDate).toLocaleDateString("fr-FR")}
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{event.description}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Lieu</Text>
                        <Text style={styles.location}>
                            {event.address?.number} {event.address?.street}, {event.address?.city} {event.address?.postal_code}, {event.address?.country}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Participants ({event.participants.length})</Text>
                        <View style={styles.participantsContainer}>
                            {event.participants.length <= 3
                                ? event.participants.map((participant) => (
                                      <TouchableOpacity style={styles.participant} key={participant.id} onPress={() => handleAvatarPress(participant.id)}>
                                          <Image source={{ uri: participant.avatar }} style={styles.participantAvatar} />
                                          <Text style={styles.participantName}>
                                              {participant.firstname} {participant.lastname.charAt(0)}.
                                          </Text>
                                      </TouchableOpacity>
                                  ))
                                : event.participants.slice(0, 3).map((participant, index) => (
                                      <TouchableOpacity
                                          style={[styles.participantStacked, { left: index * 22 }]}
                                          key={participant.id}
                                          onPress={() => handleAvatarPress(participant.id)}
                                      >
                                          <Image source={{ uri: participant.avatar }} style={styles.participantAvatar} />
                                      </TouchableOpacity>
                                  ))}
                            {event.participants.length > 3 && (
                                <TouchableOpacity style={[styles.participantsIndicator, { left: 3 * 22 }]} onPress={() => router.push(`/modal?id=${id}&type=event-participants`)}>
                                    <Text style={styles.participantsIndicatorText}>+{event.participants.length - 3}</Text>
                                </TouchableOpacity>
                            )}
                            {event.participants.length === 0 && (
                                <View style={styles.emptyParticipant}>
                                    <ColoredLabel text="Aucun participant pour l'instant" textStyle={{ fontSize: 12, color: "#6B8F87", fontWeight: "400" }} />
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.messagesButton} onPress={() => router.push(`/modal?id=${id}&type=chat`)}>
                        <Text style={styles.messagesButtonText}>💬 Consulter les messages</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={isEventOwner ? styles.updateButton : isParticipating ? styles.cancelButton : styles.participateButton}
                    onPress={() =>
                        isEventOwner ? router.push(`/create-event?id=${id}&type=update`) : isParticipating ? cancelParticipationMutation.mutate() : participateMutation.mutate()
                    }
                    disabled={participateMutation.isPending || cancelParticipationMutation.isPending}
                >
                    {participateMutation.isPending || cancelParticipationMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.footerButtonText}>{isEventOwner ? "Modifier l'événement" : isParticipating ? "Ne plus participer" : "Participer à l'événement"}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0FBF8",
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.background,
    },
    backButton: {
        alignSelf: "flex-start",
    },
    backButtonText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
    },
    errorText: {
        fontSize: 16,
        color: Colors.error,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    coverImage: {
        width: "100%",
        height: 250,
    },
    contentContainer: {
        padding: 16,
        gap: 16,
    },
    typeBadge: {
        alignSelf: "flex-start",
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    typeBadgeText: {
        fontSize: 12,
        color: Colors.primaryDark,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1A2E2A",
        letterSpacing: -0.5,
    },
    date: {
        fontSize: 14,
        color: "#6B8F87",
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: "#C8EDE4",
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#00A87A",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: "#1A2E2A",
    },
    location: {
        fontSize: 15,
        color: "#1A2E2A",
    },
    participantsContainer: {
        flexDirection: "row",
        gap: 12,
        minHeight: 48,
        alignItems: "center",
    },
    participant: {
        alignItems: "center",
        gap: 4,
    },
    participantStacked: {
        position: "absolute",
        top: 0,
        borderWidth: 2,
        borderColor: "#fff",
        borderRadius: 16,
    },
    participantAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#C8EDE4",
    },
    participantName: {
        fontSize: 10,
        color: "#6B8F87",
        fontWeight: "500",
    },
    participantsIndicator: {
        position: "absolute",
        backgroundColor: "#E0FBF4",
        borderWidth: 2,
        borderColor: "#C8EDE4",
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    participantsIndicatorText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#00A87A",
    },
    emptyParticipant: {
        width: "100%",
        alignItems: "center",
        paddingVertical: 8,
    },
    messagesButton: {
        backgroundColor: "#1A2E2A",
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    messagesButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#C8EDE4",
        backgroundColor: "#F0FBF8",
    },
    participateButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    updateButton: {
        backgroundColor: Colors.accent,
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: Colors.error,
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    footerButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: "700",
    },
})
