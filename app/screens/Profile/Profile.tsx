import { signOut } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useChessColors, useChessStyles, useChessTheme } from "../../../constants/ChessThemeProvider";
import { useLanguage } from "../../providers/LanguageProvider";
import { getUserByEmail, updateUserName } from "../../services/api";
import { auth } from "../../services/firebaseConfig";

export default function Profile({ navigation }: any) {
  const user = auth.currentUser;
  const email = user?.email || "";
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [name, setName] = useState("");
  const [elo, setElo] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [wins, setWins] = useState<number>(0);
  
  const { t } = useLanguage();
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: chessColors.background,
      padding: chessTheme.spacing.md,
    },
    scrollContainer: {
      flexGrow: 1,
      backgroundColor: chessColors.background,
    },
    title: {
      ...chessStyles.textTitle,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: chessTheme.spacing.md,
    },
    card: {
      ...chessStyles.card,
      marginBottom: chessTheme.spacing.sm,
    },
    sectionTitle: {
      ...chessStyles.textSubtitle,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: chessTheme.spacing.sm,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: chessTheme.spacing.xs,
    },
    statLabel: {
      ...chessStyles.textSecondary,
      fontSize: 14,
    },
    statValue: {
      ...chessStyles.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    input: {
      ...chessStyles.input,
      marginTop: chessTheme.spacing.xs,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: chessTheme.spacing.sm,
      marginTop: chessTheme.spacing.md,
    },
    button: {
      flex: 1,
      padding: chessTheme.spacing.md,
      borderRadius: chessTheme.borderRadius.md,
      alignItems: 'center',
    },
    saveButton: {
      backgroundColor: chessColors.success,
    },
    logoutButton: {
      backgroundColor: chessColors.error,
    },
    buttonText: {
      ...chessStyles.buttonText,
      fontWeight: '600',
    },
  });

  const fetchProfile = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await getUserByEmail(email);
      const u = res.data;
      setName(u?.name ?? email.split("@")[0]);
      setElo(u?.elo ?? 1000);
      setMatches(u?.matchesPlayed ?? 0);
      setWins(u?.wins ?? 0);
    } catch (e: any) {
      Alert.alert(t('profile', 'error'), e?.response?.data?.error || t('profile', 'failedLoadProfile'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [email]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [email]);

  const handleSave = async () => {
    try {
      await updateUserName(email, name.trim());
      Alert.alert(t('profile', 'success'), t('profile', 'nameUpdated'));
    } catch (e: any) {
      Alert.alert(t('profile', 'error'), e?.response?.data?.error || t('profile', 'failedUpdateName'));
    }
  };

  const handleLogout = async () => {
    try {
      // Set offline status before logout
      const { friendsManager } = require('../../services/friendsManager');
      await friendsManager.updateOnlineStatus('offline');
      
      // Disconnect socket and cleanup
      friendsManager.disconnect();
      
      await signOut(auth);
      // MainNavigation sẽ tự chuyển về Auth stack
    } catch (error) {
      console.error('❌ Logout error:', error);
      await signOut(auth); // Fallback logout even if status update fails
    }
  };

  if (!email) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: chessColors.text }}>{t('profile', 'notLoggedIn')}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={chessColors.primary} />
        <Text style={{ marginTop: 8, color: chessColors.text }}>{t('profile', 'loadingProfile')}…</Text>
      </View>
    );
  }

  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;

  return (
    <ScrollView style={dynamicStyles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={dynamicStyles.title}>{t('profile', 'title')}</Text>

      <View style={dynamicStyles.card}>
        <Text style={{ fontSize: 14, color: chessColors.textSecondary, marginTop: chessTheme.spacing.sm }}>{t('profile', 'email')}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: chessColors.text, marginTop: chessTheme.spacing.xs }}>{email}</Text>

        <Text style={{ fontSize: 14, color: chessColors.textSecondary, marginTop: chessTheme.spacing.sm }}>{t('profile', 'displayName')}</Text>
        <TextInput
          style={dynamicStyles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('profile', 'displayName')}
          placeholderTextColor={chessColors.textTertiary}
        />

        <View style={dynamicStyles.buttonContainer}>
          <TouchableOpacity style={[dynamicStyles.button, dynamicStyles.saveButton]} onPress={handleSave}>
            <Text style={dynamicStyles.buttonText}>{t('profile', 'updateName')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={dynamicStyles.card}>
        <Text style={dynamicStyles.sectionTitle}>{t('profile', 'statistics')}</Text>
        <View style={dynamicStyles.statRow}>
          <Text style={dynamicStyles.statLabel}>{t('profile', 'rating')}</Text>
          <Text style={dynamicStyles.statValue}>{elo}</Text>
        </View>
        <View style={dynamicStyles.statRow}>
          <Text style={dynamicStyles.statLabel}>{t('profile', 'matchesPlayed')}</Text>
          <Text style={dynamicStyles.statValue}>{matches}</Text>
        </View>
        <View style={dynamicStyles.statRow}>
          <Text style={dynamicStyles.statLabel}>{t('profile', 'wins')}</Text>
          <Text style={dynamicStyles.statValue}>{wins}</Text>
        </View>
        <View style={dynamicStyles.statRow}>
          <Text style={dynamicStyles.statLabel}>{t('profile', 'winRate')}</Text>
          <Text style={dynamicStyles.statValue}>{winRate}%</Text>
        </View>
        
        <TouchableOpacity 
          style={[dynamicStyles.button, { backgroundColor: chessColors.info, marginTop: chessTheme.spacing.md }]} 
          onPress={() => navigation.navigate("History")}
        >
          <Text style={dynamicStyles.buttonText}>{t('profile', 'viewMatchHistory')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[dynamicStyles.button, dynamicStyles.logoutButton]} onPress={handleLogout}>
        <Text style={dynamicStyles.buttonText}>{t('profile', 'signOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


