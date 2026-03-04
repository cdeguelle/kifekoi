import { RegisterCredentials, register as registerUser } from "@/api/auth"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { yupResolver } from "@hookform/resolvers/yup"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useMutation } from "@tanstack/react-query"
import { BlurView } from "expo-blur"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import React, { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import CountryPicker, { Country, CountryCode } from "react-native-country-picker-modal"
import { Toast } from "toastify-react-native"
import * as yup from "yup"

const schema = yup.object().shape({
    email: yup.string().email("Format d'email invalide").required("L'email est requise"),
    password: yup.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").required("Le mot de passe est requis"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Les mots de passe ne correspondent pas")
        .required("La confirmation du mot de passe est requise"),
    firstname: yup.string().required("Le prénom est requis"),
    lastname: yup.string().required("Le nom est requis"),
    bio: yup.string().required("La bio est requise"),
    nationality: yup.string().required("La nationalité est requise"),
    birthdate: yup.date().required("La date de naissance est requise"),
    avatar: yup.string().required("L'avatar est requise"),
})

type RegisterFormData = yup.InferType<typeof schema>

export default function RegisterScreen() {
    const [countryCode, setCountryCode] = useState<CountryCode>("FR")
    const [country, setCountry] = useState<Country | null>(null)
    const [countryPickerVisible, setCountryPickerVisible] = useState<boolean>(false)
    const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false)
    const { showActionSheetWithOptions } = useActionSheet()

    const registerMutation = useMutation({
        mutationFn: (data: RegisterCredentials) => registerUser(data),
        onSuccess: () => {
            Toast.success("Votre compte a été créé avec succès !")
            router.replace("/login")
            reset()
        },
        onError: () => {
            Toast.error("Une erreur est survenue lors de la création du compte")
        },
    })

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<RegisterFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            firstname: "",
            lastname: "",
            bio: "",
            nationality: "",
            birthdate: new Date(),
            avatar: "",
        },
    })

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== "granted") {
            alert("Désolé, nous avons besoin des permissions pour accéder à vos photos !")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        })

        if (!result.canceled) {
            setValue("avatar", `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`)
        }
    }

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()

        if (status !== "granted") {
            alert("Désolé, nous avons besoin des permissions pour accéder à votre caméra !")
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        })

        if (!result.canceled) {
            setValue("avatar", `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`)
        }
    }

    const showImagePickerOptions = () => {
        showActionSheetWithOptions(
            {
                options: ["Prendre une photo", "Choisir depuis la galerie", "Annuler"],
                cancelButtonIndex: 2,
                title: "Sélectionner une image",
            },
            (selectedIndex) => {
                switch (selectedIndex) {
                    case 0:
                        takePhoto()
                        break
                    case 1:
                        pickImage()
                        break
                }
            },
        )
    }

    const onSelect = (country: Country) => {
        setCountryCode(country.cca2)
        setCountry(country)
    }

    const onSubmit = (data: RegisterFormData) => {
        registerMutation.mutate(data)
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={"height"} style={styles.container}>
                {Platform.OS === "ios" && (
                    <BlurView intensity={20} tint="light" style={styles.header}>
                        <Image source={require("@/assets/images/KifekoiLogoNoBg.png")} style={styles.logo} />
                        <Text style={styles.title}>Créer un compte</Text>
                    </BlurView>
                )}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {Platform.OS === "android" && (
                        <View style={styles.headerAndroid}>
                            <Image source={require("@/assets/images/KifekoiLogoNoBg.png")} style={styles.logo} />
                            <Text style={styles.title}>Créer un compte</Text>
                        </View>
                    )}
                    <View style={styles.content}>
                        <View style={styles.form}>
                            <Controller
                                control={control}
                                name="email"
                                rules={{
                                    required: "L'email est requis",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "Format d'email invalide",
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, errors.email && styles.inputError]}
                                        placeholder="Email"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                )}
                            />
                            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

                            <Controller
                                control={control}
                                name="password"
                                rules={{
                                    required: "Le mot de passe est requis",
                                    minLength: {
                                        value: 6,
                                        message: "Le mot de passe doit contenir au moins 6 caractères",
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, errors.password && styles.inputError]}
                                        placeholder="Mot de passe"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        secureTextEntry
                                    />
                                )}
                            />
                            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

                            <Controller
                                control={control}
                                name="confirmPassword"
                                rules={{
                                    required: "La confirmation du mot de passe est requise",
                                    minLength: {
                                        value: 6,
                                        message: "Le mot de passe doit contenir au moins 6 caractères",
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, errors.confirmPassword && styles.inputError]}
                                        placeholder="Confirmer le mot de passe"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        secureTextEntry
                                    />
                                )}
                            />
                            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}

                            <Controller
                                control={control}
                                name="firstname"
                                rules={{ required: "Le prénom est requis" }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, errors.firstname && styles.inputError]}
                                        placeholder="Prénom"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.firstname && <Text style={styles.errorText}>{errors.firstname.message}</Text>}

                            <Controller
                                control={control}
                                name="lastname"
                                rules={{ required: "Le nom est requis" }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, errors.lastname && styles.inputError]}
                                        placeholder="Nom"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                )}
                            />
                            {errors.lastname && <Text style={styles.errorText}>{errors.lastname.message}</Text>}

                            <Controller
                                control={control}
                                name="bio"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Bio"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        multiline
                                        numberOfLines={3}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="nationality"
                                render={({ field: { onChange, value = countryCode } }) => (
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.preventDefault()
                                            setCountryPickerVisible(true)
                                        }}
                                        style={[styles.input, { flexDirection: "row", alignItems: "center", gap: 10 }, errors.nationality && styles.inputError]}
                                    >
                                        {value === "" && <Text style={{ color: "#666", opacity: value ? 1 : 0.5 }}>Sélectionner une nationalité</Text>}
                                        <CountryPicker
                                            {...{
                                                countryCode,
                                                withFilter: true,
                                                withFlag: true,
                                                withCountryNameButton: value === "" ? false : true,
                                                withAlphaFilter: false,
                                                withCallingCode: false,
                                                withEmoji: true,
                                                onSelect: (country) => {
                                                    onSelect(country)
                                                    onChange(country.cca2)
                                                },
                                            }}
                                            visible={countryPickerVisible}
                                            withFlagButton={!!country?.flag}
                                        />
                                    </TouchableOpacity>
                                )}
                            />

                            <Controller
                                control={control}
                                name="birthdate"
                                render={({ field: { onChange, value } }) => {
                                    return Platform.OS === "ios" ? (
                                        <View style={styles.inputDate}>
                                            <Text style={styles.label}>Date de naissance</Text>
                                            <DateTimePicker value={value} mode="date" onChange={(_, date) => date && onChange(date)} />
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={styles.inputDate} onPress={() => setDatePickerVisible(true)}>
                                            <Text style={styles.label}>Date de naissance</Text>
                                            <Text style={styles.dateText}>{value.toLocaleDateString("fr-FR")}</Text>
                                            {datePickerVisible && (
                                                <DateTimePicker
                                                    value={value}
                                                    onChange={(_, date) => {
                                                        setDatePickerVisible(false)
                                                        date && onChange(date)
                                                    }}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    )
                                }}
                            />

                            <Controller
                                control={control}
                                name="avatar"
                                render={({ field: { value } }) => (
                                    <TouchableOpacity style={styles.imagePickerContainer} onPress={showImagePickerOptions}>
                                        {value ? (
                                            <Image source={{ uri: value }} style={styles.avatar} />
                                        ) : (
                                            <View style={styles.avatarPlaceholder}>
                                                <Text style={styles.avatarPlaceholderText}>Appuyez pour sélectionner une image</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, registerMutation.isPending && styles.buttonDisabled]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={registerMutation.isPending}
                    >
                        <Text style={styles.buttonText}>{registerMutation.isPending ? "Création en cours..." : "Créer un compte"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push("/login")}>
                        <Text style={styles.forgotPasswordText}>Déjà un compte ? Connectez-vous</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0FBF8",
        paddingBottom: Platform.OS === "android" ? 20 : 0,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: Platform.OS === "android" ? 0 : 200,
    },
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        marginBottom: 24,
        color: "#1A2E2A",
        letterSpacing: -0.5,
    },
    form: {
        width: "100%",
        maxWidth: 400,
    },
    input: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        fontSize: 15,
        borderWidth: 1.5,
        borderColor: "#C8EDE4",
        color: "#1A2E2A",
    },
    inputError: {
        borderColor: "#FF3B30",
        backgroundColor: "#FFF5F5",
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 12,
        marginBottom: 8,
        marginTop: -8,
    },
    button: {
        backgroundColor: "#00C896",
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: "#A0C9BF",
    },
    buttonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    forgotPassword: {
        marginTop: 16,
        alignItems: "center",
    },
    forgotPasswordText: {
        color: "#00A87A",
        fontSize: 15,
        fontWeight: "500",
    },
    footer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    imagePickerContainer: {
        width: "100%",
        height: 180,
        backgroundColor: "#E0FBF4",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: "#C8EDE4",
        borderStyle: "dashed",
    },
    avatar: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    avatarPlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        gap: 8,
    },
    avatarPlaceholderText: {
        color: "#6B8F87",
        textAlign: "center",
        fontSize: 14,
        fontWeight: "500",
    },
    inputDate: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        fontSize: 15,
        borderWidth: 1.5,
        borderColor: "#C8EDE4",
        alignItems: "center",
        gap: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    label: {
        color: "#6B8F87",
        fontSize: 15,
    },
    dateText: {
        color: "#1A2E2A",
        fontSize: 15,
        fontWeight: "600",
    },
    headerAndroid: {
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 50,
    },
})
