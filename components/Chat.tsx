import { getEventById } from "@/api/event"
import { addReaction, createMessage, getMessagesByEventId, Message, MessageReaction, MessageReactionType, updateMessage } from "@/api/message"
import CustomInput from "@/components/ui/CustomInput"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { useGetToken } from "@/hooks/useGetToken"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Modal from "react-native-modal"

export default function Chat({ eventId }: { eventId: string }) {
    const { decodedToken } = useGetToken()
    const [message, setMessage] = useState("")
    const [updatingMessage, setUpdatingMessage] = useState<Message | null>(null)
    const [updateModaleVisible, setUpdateModaleVisible] = useState(false)
    const [visibleDateMessageId, setVisibleDateMessageId] = useState<string | null>(null)
    const [messageReactions, setMessageReactions] = useState<MessageReaction[]>([])
    const [reactionsModaleVisible, setReactionsModaleVisible] = useState(false)
    const [selectReactionModaleVisible, setSelectReactionModaleVisible] = useState(false)
    const queryClient = useQueryClient()

    const { data: event, isLoading: eventLoading } = useQuery({
        queryKey: ["event", eventId],
        queryFn: () => getEventById(eventId),
    })

    const { data: messages, isLoading: messagesLoading } = useQuery({
        queryKey: ["messages", eventId],
        queryFn: () => getMessagesByEventId(eventId),
    })

    const createMessageMutation = useMutation({
        mutationFn: () => createMessage({ eventId, userId: decodedToken?.userId!, content: message }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", eventId] })
            setMessage("")
        },
    })

    const updateMessageMutation = useMutation({
        mutationFn: (msg: Message) => updateMessage(msg.id, msg.content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", eventId] })
            setUpdateModaleVisible(false)
        },
    })

    const addReactionMutation = useMutation({
        mutationFn: ({ messageId, type }: { messageId: string; type: MessageReactionType }) => addReaction(messageId, decodedToken?.userId!, type),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", eventId] }),
    })

    const handleMessagePress = (msg: Message) => {
        setUpdatingMessage(msg)
        setUpdateModaleVisible(true)
    }

    const showMessageDate = (messageId: string) => {
        setVisibleDateMessageId(visibleDateMessageId === messageId ? null : messageId)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{event?.title}</Text>

            <ScrollView style={styles.messagesScroll} contentContainerStyle={styles.messagesContent}>
                {messagesLoading || eventLoading ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                ) : messages && messages.length > 0 ? (
                    messages
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map((msg) => (
                            <View style={styles.messageContainer} key={msg.id}>
                                <View style={msg.userId === decodedToken?.userId ? styles.myMessageRow : styles.otherMessageRow}>
                                    {msg.userId !== decodedToken?.userId && <Image source={{ uri: msg.user.avatar }} style={styles.messageAvatar} />}
                                    <TouchableOpacity
                                        style={msg.userId === decodedToken?.userId ? styles.myMessage : styles.otherMessage}
                                        onLongPress={() => {
                                            if (msg.userId === decodedToken?.userId) {
                                                handleMessagePress(msg)
                                            } else {
                                                setSelectReactionModaleVisible(true)
                                                setUpdatingMessage(msg)
                                            }
                                        }}
                                        onPress={() => showMessageDate(msg.id)}
                                    >
                                        <Text style={msg.userId === decodedToken?.userId ? styles.myMessageText : styles.otherMessageText}>{msg.content}</Text>
                                        <TouchableOpacity
                                            style={styles.reactionsContainer}
                                            onPress={() => {
                                                setMessageReactions(msg.reactions)
                                                setReactionsModaleVisible(true)
                                            }}
                                        >
                                            {msg.reactions.length > 0 && (
                                                <Text style={styles.reactionBadge}>
                                                    {Array.from(new Set(msg.reactions.map((r) => r.type))).map((type) => (
                                                        <Text key={type}>{type === MessageReactionType.LIKE ? "👍" : type === MessageReactionType.DISLIKE ? "👎" : "💖"} </Text>
                                                    ))}
                                                    {msg.reactions.length - Array.from(new Set(msg.reactions.map((r) => r.type))).length > 0 && (
                                                        <Text>{`+${msg.reactions.length - Array.from(new Set(msg.reactions.map((r) => r.type))).length}`}</Text>
                                                    )}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                    {msg.userId === decodedToken?.userId && <Image source={{ uri: msg.user.avatar }} style={styles.messageAvatar} />}
                                </View>
                                {visibleDateMessageId === msg.id && (
                                    <Text
                                        style={[
                                            styles.messageDate,
                                            msg.userId === decodedToken?.userId ? { alignSelf: "flex-end", marginRight: 46 } : { alignSelf: "flex-start", marginLeft: 46 },
                                        ]}
                                    >
                                        {new Date(msg.createdAt).toLocaleString("fr-FR")}
                                    </Text>
                                )}
                            </View>
                        ))
                ) : (
                    <View style={styles.emptyMessages}>
                        <Text style={styles.emptyMessagesText}>Aucun message pour l'instant</Text>
                    </View>
                )}
            </ScrollView>

            <CustomInput
                iconRight={
                    <TouchableOpacity onPress={() => createMessageMutation.mutate()}>
                        <IconSymbol name="paperplane" size={22} color={Colors.primary} />
                    </TouchableOpacity>
                }
                placeholder="Écrivez votre message..."
                value={message}
                onChangeText={setMessage}
                containerStyle={styles.inputContainer}
            />

            <Modal isVisible={updateModaleVisible} onBackdropPress={() => setUpdateModaleVisible(false)}>
                <View style={styles.modal}>
                    <Text style={styles.modalTitle}>Modifier le message</Text>
                    <CustomInput
                        placeholder="Nouveau contenu..."
                        value={updatingMessage?.content}
                        onChangeText={(text) => setUpdatingMessage({ ...updatingMessage!, content: text })}
                        iconRight={
                            <TouchableOpacity onPress={() => updateMessageMutation.mutate(updatingMessage!)}>
                                <IconSymbol name="paperplane" size={22} color={Colors.primary} />
                            </TouchableOpacity>
                        }
                    />
                </View>
            </Modal>

            <Modal isVisible={reactionsModaleVisible} onBackdropPress={() => setReactionsModaleVisible(false)}>
                <View style={styles.modal}>
                    <Text style={styles.modalTitle}>Réactions</Text>
                    <View style={styles.reactionList}>
                        {messageReactions.map((reaction) => (
                            <View style={styles.reactionItem} key={reaction.id}>
                                <View style={styles.reactionItemInfo}>
                                    <Image source={{ uri: reaction.sender.avatar }} style={styles.reactionAvatar} />
                                    <Text style={styles.reactionSenderName}>
                                        {reaction.sender.firstname} {reaction.sender.lastname.charAt(0).toUpperCase()}.
                                    </Text>
                                </View>
                                <Text>{reaction.type === MessageReactionType.LIKE ? "👍" : reaction.type === MessageReactionType.DISLIKE ? "👎" : "💖"}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Modal>

            <Modal isVisible={selectReactionModaleVisible} onBackdropPress={() => setSelectReactionModaleVisible(false)}>
                <View style={styles.modal}>
                    <Text style={styles.modalTitle}>Réagir</Text>
                    <View style={styles.selectReactionRow}>
                        {Object.values(MessageReactionType).map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => {
                                    addReactionMutation.mutate({ messageId: updatingMessage!.id, type })
                                    setSelectReactionModaleVisible(false)
                                }}
                                style={styles.reactionButton}
                            >
                                <Text style={styles.reactionEmoji}>{type === MessageReactionType.LIKE ? "👍" : type === MessageReactionType.DISLIKE ? "👎" : "💖"}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
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
        fontSize: 20,
        fontWeight: "800",
        color: "#1A2E2A",
        marginVertical: 20,
        letterSpacing: -0.3,
    },
    messagesScroll: {
        flex: 1,
    },
    messagesContent: {
        gap: 8,
        paddingBottom: 8,
    },
    messageContainer: {
        gap: 2,
    },
    myMessageRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        gap: 6,
    },
    otherMessageRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "flex-start",
        gap: 6,
    },
    myMessage: {
        backgroundColor: "#00C896",
        padding: 10,
        borderRadius: 14,
        borderBottomRightRadius: 4,
        maxWidth: "75%",
    },
    otherMessage: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 14,
        borderBottomLeftRadius: 4,
        maxWidth: "75%",
        borderWidth: 1,
        borderColor: "#C8EDE4",
    },
    myMessageText: {
        color: "#fff",
        fontSize: 14,
    },
    otherMessageText: {
        color: "#1A2E2A",
        fontSize: 14,
    },
    messageAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#C8EDE4",
    },
    messageDate: {
        fontSize: 10,
        color: "#6B8F87",
        marginTop: 2,
    },
    reactionsContainer: {
        position: "absolute",
        bottom: -12,
        right: 8,
    },
    reactionBadge: {
        backgroundColor: "#E0FBF4",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        fontSize: 12,
        borderWidth: 1,
        borderColor: "#C8EDE4",
    },
    emptyMessages: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyMessagesText: {
        fontSize: 15,
        color: "#6B8F87",
    },
    inputContainer: {
        marginTop: 8,
        backgroundColor: "#fff",
        borderRadius: 14,
        borderColor: "#C8EDE4",
    },
    modal: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        gap: 16,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1A2E2A",
    },
    reactionList: {
        gap: 10,
    },
    reactionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    reactionItemInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    reactionAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    reactionSenderName: {
        fontSize: 14,
        color: "#1A2E2A",
        fontWeight: "500",
    },
    selectReactionRow: {
        flexDirection: "row",
        gap: 12,
        justifyContent: "center",
    },
    reactionButton: {
        backgroundColor: "#E0FBF4",
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#C8EDE4",
    },
    reactionEmoji: {
        fontSize: 24,
    },
})
