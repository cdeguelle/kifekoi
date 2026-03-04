import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native"

interface CustomInputProps extends TextInputProps {
    iconRight?: React.ReactNode
    iconLeft?: React.ReactNode
    iconStyle?: StyleProp<ViewStyle>
    inputStyle?: StyleProp<TextStyle>
    containerStyle?: StyleProp<ViewStyle>
    error?: string
}

export default function CustomInput(props: CustomInputProps) {
    const { error, containerStyle, inputStyle, iconLeft, iconRight, ...textInputProps } = props

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.inputContainer}>
                {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
                <TextInput {...textInputProps} style={[styles.input, error && styles.inputError, inputStyle]} />
                {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
    },
    inputContainer: {
        position: "relative",
    },
    input: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1.5,
        borderColor: "#C8EDE4",
        color: "#1A2E2A",
    },
    inputError: {
        borderColor: "#FF3B30",
        backgroundColor: "#FFF5F5",
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 13,
        marginTop: 5,
        marginLeft: 5,
    },
    iconLeft: {
        position: "absolute",
        left: 12,
        top: 14,
        zIndex: 1,
    },
    iconRight: {
        position: "absolute",
        right: 12,
        top: 14,
        zIndex: 1,
    },
})
