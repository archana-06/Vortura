import React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native"

interface CustomButtonProps {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: "primary" | "secondary" | "danger"
}

export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: CustomButtonProps) {
  const getButtonStyle = () => {
    if (variant === "secondary") return styles.secondaryButton
    if (variant === "danger") return styles.dangerButton
    return styles.primaryButton
  }

  const getTextStyle = () => {
    if (variant === "secondary") return styles.secondaryText
    if (variant === "danger") return styles.dangerText
    return styles.primaryText
  }

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? "#06b6d4" : "#ffffff"} />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  primaryButton: {
    backgroundColor: "#0ea5e9",
  },
  secondaryButton: {
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  dangerButton: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
  },
  primaryText: {
    color: "#ffffff",
  },
  secondaryText: {
    color: "#06b6d4",
  },
  dangerText: {
    color: "#f87171",
  },
})
