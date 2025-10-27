import React, { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  currentUrl: string;
  onSave: (url: string) => void;
  onClose: () => void;
};

export function ApiConfigModal({ visible, currentUrl, onSave, onClose }: Props) {
  const [url, setUrl] = useState(currentUrl);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>⚙️ Cấu hình API</Text>
          
          <Text style={styles.label}>API URL:</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="http://your-ip:5000"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <View style={styles.info}>
            <Text style={styles.hint}>• Web/iOS: http://localhost:5000</Text>
            <Text style={styles.hint}>• Android: http://10.0.2.2:5000</Text>
            <Text style={styles.hint}>• Device: http://your-pc-ip:5000</Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => {
                onSave(url);
                onClose();
              }}>
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                Lưu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 15,
    color: "#666",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  info: {
    marginTop: 12,
    marginBottom: 16,
  },
  hint: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
  },
  buttonText: {
    fontSize: 15,
    color: "#333",
  },
  primaryButtonText: {
    color: "white",
  },
});