import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useChessColors, useChessStyles, useChessTheme } from "../../../constants/ChessThemeProvider";
import { useLanguage } from "../../providers/LanguageProvider";
import { createUser } from "../../services/api";
import { auth } from "../../services/firebaseConfig";

export default function Register() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      color: chessColors.success,
      textAlign: 'center',
    },
    input: {
      ...chessStyles.input,
      width: "100%",
      marginBottom: chessTheme.spacing.md,
    },
    button: {
      ...chessStyles.buttonPrimary,
      backgroundColor: chessColors.success,
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

  const handleRegister = async () => {
    // ✅ Enhanced validation
    if (!email || !password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
      return;
    }
    
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    try {
      // 1. Tạo user trên Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Gửi lên backend để tạo user trong MongoDB
      const username = email.split("@")[0]; // tạm lấy username từ email
      await createUser(email, username);

      Alert.alert("Thành công", "Đăng ký thành công! Hãy đăng nhập.");
      navigation.navigate("Login" as never);
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      let errorMessage = "Đã xảy ra lỗi";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email đã được sử dụng";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email không hợp lệ";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Mật khẩu quá yếu (cần ít nhất 6 ký tự)";
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Đăng ký email/password chưa được kích hoạt";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Lỗi đăng ký", errorMessage);
    }
  };

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Create Account</Text>

      <TextInput
        style={dynamicStyles.input}
        placeholder={t('auth', 'email')}
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={chessColors.textTertiary}
      />

      <TextInput
        style={dynamicStyles.input}
        placeholder={t('auth', 'password')}
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        placeholderTextColor={chessColors.textTertiary}
      />

      <TextInput
        style={dynamicStyles.input}
        placeholder={t('auth', 'confirmPassword')}
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        secureTextEntry
        placeholderTextColor={chessColors.textTertiary}
      />

      <TouchableOpacity style={dynamicStyles.button} onPress={handleRegister}>
        <Text style={dynamicStyles.buttonText}>{t('auth', 'register')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login" as never)}>
        <Text style={dynamicStyles.link}>{t('auth', 'hasAccount')}</Text>
      </TouchableOpacity>
    </View>
  );
}


