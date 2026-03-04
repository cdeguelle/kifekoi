import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Location from "expo-location"
import { useEffect, useState } from "react"
import { Toast } from "toastify-react-native"

export const useLocation = () => {
    const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null)
    const [lastLocationStored, setLastLocationStored] = useState<Location.LocationObjectCoords | null>(null)

    useEffect(() => {
        ;(async () => {
            const lastLocation = await AsyncStorage.getItem("lastLocation")
            if (lastLocation) {
                setLastLocationStored(JSON.parse(lastLocation))
            }

            let { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
                Toast.error("Permission de localisation refusée")
                return
            }

            const servicesEnabled = await Location.hasServicesEnabledAsync()
            if (!servicesEnabled) {
                Toast.error("Activez la localisation sur votre appareil")
                return
            }

            try {
                let loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                })
                await AsyncStorage.setItem("lastLocation", JSON.stringify(loc.coords))
                setLocation(loc.coords)
            } catch {
                const lastKnown = await Location.getLastKnownPositionAsync()
                if (lastKnown) {
                    await AsyncStorage.setItem("lastLocation", JSON.stringify(lastKnown.coords))
                    setLocation(lastKnown.coords)
                } else {
                    Toast.error("Impossible de récupérer la localisation")
                }
            }
        })()
    }, [])

    return { location, lastLocationStored }
}
