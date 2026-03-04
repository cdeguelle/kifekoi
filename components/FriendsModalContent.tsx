import { createConversation, getConversationByUserId } from "@/api/conversation"
import { getFriends } from "@/api/user"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { router } from "expo-router"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function FriendsModalContent() {
    const queryClient = useQueryClient()

    const { data: friends, isLoading } = useQuery({
        queryKey: ["friends"],
        queryFn: () => getFriends(),
    })

    const createConversationMutation = useMutation({
        mutationFn: (friendId: string) => createConversation(friendId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["conversation", data.id] })
        },
    })

    const handleOpenConversation = async (friendId: string) => {
        const conversation = await getConversationByUserId(friendId)
        if (conversation) {
            router.push(`/modal?id=${friendId}&type=chat-user`)
        } else {
            createConversationMutation.mutate(friendId)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mes amis</Text>
            {isLoading ? (
                <ActivityIndicator size="small" color="#00C896" />
            ) : friends && friends.length > 0 ? (
                <ScrollView contentContainerStyle={styles.list}>
                    {friends.map((friend) => (
                        <View style={styles.friendRow} key={friend.id}>
                            <View style={styles.friendInfo}>
                                <Image source={{ uri: friend.avatar ?? "" }} style={styles.avatar} />
                                <View>
                                    <Text style={styles.friendName}>
                                        {friend.firstname} {friend.lastname}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.chatButton} onPress={() => handleOpenConversation(friend.id)}>
                                <IconSymbol name="bubble.left" size={18} color="#00C896" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <Text style={styles.emptyText}>Aucun ami trouvé</Text>
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
    list: {
        gap: 12,
        paddingBottom: 32,
    },
    friendRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: "#C8EDE4",
        shadowColor: "#00C896",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    friendInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#C8EDE4",
        borderWidth: 2,
        borderColor: "#fff",
    },
    friendName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1A2E2A",
    },
    chatButton: {
        backgroundColor: "#E0FBF4",
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#C8EDE4",
    },
    emptyText: {
        textAlign: "center",
        color: "#6B8F87",
        fontSize: 15,
        marginTop: 40,
    },
})
