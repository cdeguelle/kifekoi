import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs"
import { Tabs } from "expo-router"
import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import { HapticTab } from "@/components/HapticTab"
import { IconSymbol } from "@/components/ui/IconSymbol"
import TabBarBackground from "@/components/ui/TabBarBackground"
import { Colors } from "@/constants/Colors"
import { SymbolViewProps } from "expo-symbols"

const makeTabButton = (iconName: SymbolViewProps["name"], label: string) => (props: BottomTabBarButtonProps) => {
    const focused = props.accessibilityState?.selected
    if (focused) {
        return (
            <TouchableOpacity onPress={props.onPress} style={styles.elevatedButtonContainer} activeOpacity={0.85}>
                <View style={styles.elevatedButtonCircle}>
                    <IconSymbol size={24} name={iconName} color="#fff" />
                </View>
                <Text style={styles.elevatedButtonLabel}>{label}</Text>
            </TouchableOpacity>
        )
    }
    return <HapticTab {...props} />
}

const ColoredLabel = ({ text, colors }: { text: string; colors: string[] }) => (
    <View style={{ flexDirection: "row" }}>
        {text.split("").map((letter, index) => (
            <Text key={index} style={{ color: colors[index % colors.length], fontSize: 10, fontWeight: "500" }}>
                {letter}
            </Text>
        ))}
    </View>
)

const styles = StyleSheet.create({
    elevatedButtonContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        top: -8,
    },
    elevatedButtonCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#00A87A",
        borderWidth: 3,
        borderColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#00C896",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    elevatedButtonLabel: {
        fontSize: 10,
        fontWeight: "600",
        color: "#fff",
        marginTop: 4,
        textAlign: "center",
    },
})

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarBackground: TabBarBackground,
                tabBarStyle: {
                    position: "absolute",
                    backgroundColor: Colors.primary,
                    borderTopWidth: 0,
                    elevation: 0,
                    overflow: "visible",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ focused }) => <IconSymbol size={28} name="house.fill" color={focused ? Colors.accent : "#FFFFFF"} />,
                    tabBarLabel: ({ focused }) => <ColoredLabel text="Home" colors={[focused ? Colors.accent : "#FFFFFF"]} />,
                    // tabBarButton: makeTabButton("house.fill", "Home"),
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    title: "Événements",
                    tabBarIcon: ({ focused }) => <IconSymbol size={28} name="calendar" color={focused ? Colors.accent : "#FFFFFF"} />,
                    tabBarLabel: ({ focused }) => <ColoredLabel text="Événements" colors={[focused ? Colors.accent : "#FFFFFF"]} />,
                    // tabBarButton: makeTabButton("calendar", "Événements"),
                }}
            />
            <Tabs.Screen
                name="create-event"
                options={{
                    title: "Créer",
                    tabBarIcon: ({ focused }) => <IconSymbol size={28} name="plus.circle.fill" color={focused ? Colors.accent : "#FFFFFF"} />,
                    tabBarLabel: ({ focused }) => <ColoredLabel text="Créer" colors={[focused ? Colors.accent : "#FFFFFF"]} />,
                    // tabBarButton: makeTabButton("plus.circle.fill", "Créer"),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ focused }) => <IconSymbol size={28} name="person.fill" color={focused ? Colors.accent : "#FFFFFF"} />,
                    tabBarLabel: ({ focused }) => <ColoredLabel text="Profil" colors={[focused ? Colors.accent : "#FFFFFF"]} />,
                    // tabBarButton: makeTabButton("person.fill", "Profil"),
                }}
            />
        </Tabs>
    )
}
