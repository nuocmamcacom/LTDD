import { useNavigation } from "@react-navigation/native";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useChessColors, useChessStyles, useChessTheme } from "../../../constants/ChessThemeProvider";
import { useLanguage } from "../../providers/LanguageProvider";
import { auth } from "../../services/firebaseConfig";

export default function ForgotPassword() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const { t } = useLanguage();
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: chessColors.background,
      padding: chessTheme.spacing.lg,
    },
    title: {
      ...chessStyles.textTitle,
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: chessTheme.spacing.xxl,
      color: chessColors.warning,
      textAlign: 'center',
    },
    input: {
      ...chessStyles.input,
      width: "100%",
      marginBottom: chessTheme.spacing.md,
    },
    button: {
      ...chessStyles.buttonPrimary,
      backgroundColor: chessColors.warning,
      width: "100%",
      marginBottom: chessTheme.spacing.sm,
    },
    buttonText: {
      ...chessStyles.buttonText,
      fontSize: 18,
      fontWeight: '600',
    },
    link: {
      ...chessStyles.textLink,
      marginTop: chessTheme.spacing.sm,
      fontSize: 16,
      textAlign: 'center',
    },
  });

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Thành công", "Đã gửi email reset mật khẩu!");
      navigation.navigate("Login" as never);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>{t('auth', 'forgotPassword')}</Text>

      <TextInput
        style={dynamicStyles.input}
        placeholder={t('auth', 'enterEmail')}
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={chessColors.textTertiary}
      />

      <TouchableOpacity style={dynamicStyles.button} onPress={handleReset}>
        <Text style={dynamicStyles.buttonText}>{t('auth', 'sendRequest')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login" as never)}>
        <Text style={dynamicStyles.link}>{t('auth', 'backToLogin')}</Text>
      </TouchableOpacity>
    </View>
  );
}


