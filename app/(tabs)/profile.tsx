import { logout } from "@/api/auth"
import { getProfile } from "@/api/user"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import CountryPicker, { CountryCode } from "react-native-country-picker-modal"

export default function ProfileScreen() {
    const { data, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
    })

    if (isLoading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </ThemedView>
        )
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.headerBanner}>
                <TouchableOpacity
                    onPress={() => {
                        logout()
                        router.replace("/login")
                    }}
                    style={styles.logoutButton}
                >
                    <IconSymbol name="power" size={18} color="#fff" />
                    <Text style={styles.logoutButtonText}>Déconnexion</Text>
                </TouchableOpacity>
                <Text style={styles.headerName}>
                    {data?.firstname} {data?.lastname}
                </Text>
            </View>
            <View style={styles.avatarWrapper}>
                <Image source={{ uri: data?.avatar ?? "" }} style={styles.avatar} />
            </View>
            <ScrollView style={styles.scrollView}>
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.fieldLabel}>Prénom</Text>
                        <TextInput style={styles.input} value={data?.firstname} editable={false} />
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.fieldLabel}>Nom</Text>
                        <TextInput style={styles.input} value={data?.lastname} editable={false} />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.fieldLabel}>Nationalité</Text>
                        <View style={[styles.input, { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7 }]}>
                            <CountryPicker
                                {...{
                                    countryCode: data?.nationality as CountryCode,
                                    withFilter: true,
                                    withFlag: true,
                                    withCountryNameButton: true,
                                    withAlphaFilter: false,
                                    withCallingCode: false,
                                    withCurrencyButton: false,
                                    withEmoji: true,
                                }}
                                visible={false}
                                withFlagButton={!!data?.nationality}
                                disableNativeModal={true}
                            />
                        </View>
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.fieldLabel}>Date de naissance</Text>
                        <TextInput style={styles.input} value={data?.birthdate ? new Date(data.birthdate).toLocaleDateString() : ""} editable={false} />
                    </View>
                </View>
                <View style={[styles.column, { width: "100%" }]}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <TextInput style={styles.input} value={data?.email} editable={false} />
                </View>
                <View style={styles.textArea}>
                    <Text style={styles.fieldLabel}>Bio</Text>
                    <TextInput style={styles.input} multiline={true} numberOfLines={4} value={data?.bio ?? undefined} editable={false} />
                </View>
                <View style={styles.divider} />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.friendsButton} onPress={() => router.push(`/modal?type=friends`)}>
                        <Text style={styles.friendsButtonText}>Mes amis</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.friendsButton} onPress={() => router.push(`/modal?type=my-events`)}>
                        <Text style={styles.friendsButtonText}>Mes évènements</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />
                <View style={styles.supportSection}>
                    <Text style={styles.sectionTitle}>Support & Aide</Text>
                    <TouchableOpacity style={styles.bugReportButton} onPress={() => router.push("/bug-report")}>
                        <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#FF9500" />
                        <Text style={styles.bugReportButtonText}>Signaler un problème</Text>
                        <IconSymbol name="chevron.right" size={16} color="#666" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0FBF8",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0FBF8",
    },
    headerBanner: {
        backgroundColor: "#00C896",
        height: 140,
        paddingHorizontal: 20,
        paddingTop: 50,
        justifyContent: "flex-end",
        paddingBottom: 16,
    },
    headerName: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        letterSpacing: -0.3,
    },
    logoutButton: {
        position: "absolute",
        top: 50,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    logoutButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    avatarWrapper: {
        alignItems: "center",
        marginTop: -44,
        marginBottom: 8,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 3,
        borderColor: "#fff",
        backgroundColor: "#C8EDE4",
    },
    scrollView: {
        backgroundColor: "#F0FBF8",
        paddingTop: 8,
        paddingHorizontal: 16,
        marginBottom: 100,
    },
    input: {
        backgroundColor: "#fff",
        padding: 13,
        borderRadius: 12,
        marginBottom: 12,
        fontSize: 15,
        borderWidth: 1.5,
        borderColor: "#C8EDE4",
        color: "#1A2E2A",
    },
    row: {
        flexDirection: "row",
        gap: 10,
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    column: {
        flexDirection: "column",
        gap: 6,
        width: "45%",
    },
    textArea: {
        flexDirection: "column",
        gap: 6,
        width: "100%",
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6B8F87",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    friendsButton: {
        backgroundColor: "#00C896",
        padding: 14,
        borderRadius: 14,
        width: "45%",
        alignItems: "center",
    },
    friendsButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    divider: {
        height: 1,
        backgroundColor: "#C8EDE4",
        marginVertical: 8,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        width: "100%",
        marginBottom: 20,
    },
    supportSection: {
        width: "100%",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
        color: "#1A2E2A",
    },
    bugReportButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "#C8EDE4",
    },
    bugReportButtonText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: "#1A2E2A",
        fontWeight: "500",
    },
})
