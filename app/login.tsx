import { login } from "@/api/auth"
import CustomInput from "@/components/ui/CustomInput"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"
import { Link, router } from "expo-router"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Toast } from "toastify-react-native"
import * as yup from "yup"

const schema = yup.object({
    email: yup.string().required("L'email est requis").email("Format d'email invalide"),
    password: yup.string().required("Le mot de passe est requis").min(6, "Le mot de passe doit contenir au moins 6 caractères"),
})

type FormData = {
    email: string
    password: string
}

export default function LoginScreen() {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const loginMutation = useMutation({
        mutationFn: (data: FormData) => login({ email: data.email, password: data.password }),
        onSuccess: () => {
            router.replace("/(tabs)")
        },
        onError: () => {
            Toast.error("Email ou mot de passe incorrect")
        },
    })

    const onSubmit = async (data: FormData) => {
        loginMutation.mutate(data)
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <View style={styles.content}>
                <Image source={require("@/assets/images/kifekoi_logo.png")} style={styles.logo} />
                <Text style={styles.title}>Bienvenue 👋</Text>
                <Text style={styles.subtitle}>Connecte-toi pour voir les événements</Text>

                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                placeholder="Email"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput placeholder="Mot de passe" value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry error={errors.password?.message} />
                        )}
                    />

                    <TouchableOpacity style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
                        <Text style={styles.buttonText}>{isSubmitting ? "Connexion..." : "Se connecter"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Link href="/">
                            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                        </Link>
                        <Link href="/register">
                            <Text style={styles.forgotPasswordText}>Créer un compte</Text>
                        </Link>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0FBF8",
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 110,
        height: 110,
        marginBottom: 12,
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        marginBottom: 8,
        color: "#1A2E2A",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: "#6B8F87",
        marginBottom: 32,
    },
    form: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#00C896",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 5,
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
        marginTop: 20,
        alignItems: "center",
        gap: 12,
    },
    forgotPasswordText: {
        color: "#00A87A",
        fontSize: 15,
        fontWeight: "500",
    },
})
