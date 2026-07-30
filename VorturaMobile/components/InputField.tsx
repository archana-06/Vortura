import React from "react"
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native"

interface InputFieldProps extends TextInputProps {
  label?: string
  error?: string
}

export default function InputField({ label, error, ...props }: InputFieldProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#64748b"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: "100%",
  },
  label: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#08172d",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.25)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Platform",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#f87171",
    fontSize: 11,
    marginTop: 4,
  },
})
