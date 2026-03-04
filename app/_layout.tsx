import { ActionSheetProvider } from "@expo/react-native-action-sheet"
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { CountryModalProvider } from "react-native-country-picker-modal"
import "react-native-reanimated"
import ToastManager from "toastify-react-native"

import { useColorScheme } from "@/hooks/useColorScheme"

const queryClient = new QueryClient()

export default function RootLayout() {
    const colorScheme = useColorScheme()
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    })

    if (!loaded) {
        return null
    }

    return (
        <ActionSheetProvider>
            <QueryClientProvider client={queryClient}>
                <ToastManager />
                <CountryModalProvider>
                    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="index" options={{ headerShown: false }} />
                            <Stack.Screen name="login" options={{ headerShown: false }} />
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="+not-found" />
                            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
                            <Stack.Screen name="bug-report" />
                        </Stack>
                        <StatusBar style="dark" />
                    </ThemeProvider>
                </CountryModalProvider>
            </QueryClientProvider>
        </ActionSheetProvider>
    )
}
