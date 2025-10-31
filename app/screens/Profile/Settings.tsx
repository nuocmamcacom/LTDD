import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useChessColors, useChessStyles, useChessTheme } from '../../../constants/ChessThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../providers/LanguageProvider';
import { auth } from '../../services/firebaseConfig';
import sessionManager from '../../services/sessionManager';
import { soundManager } from '../../services/soundManager';

export default function Settings() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useChessTheme();
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isSoundEnabled());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(soundManager.getVolume());

  const handleLanguageToggle = () => {
    const newLanguage = language === 'en' ? 'vi' : 'en';
    setLanguage(newLanguage);
    Alert.alert(
      t('settings', 'languageChanged'),
      t('settings', 'languageChangedDescription'),
      [{ text: t('common', 'ok') }]
    );
  };

  const handleThemeToggle = async () => {
    await toggleTheme();
    Alert.alert(
      t('settings', 'themeChanged'),
      t('settings', 'themeChangedDescription'),
      [{ text: t('common', 'ok') }]
    );
  };

  const handleSoundToggle = async (value: boolean) => {
    setSoundEnabled(value);
    await soundManager.setSoundEnabled(value);
    
    if (value) {
      // Play a test sound when enabling
      await soundManager.playTestSound();
    }
  };

  const handleVolumeChange = async (volume: number) => {
    const newVolume = Math.max(0, Math.min(1, volume));
    setSoundVolume(newVolume);
    await soundManager.setVolume(newVolume);
    // Play test sound at new volume
    await soundManager.playTestSound();
  };

  const handleLogout = async () => {
    Alert.alert(
      t('settings', 'logout'),
      t('settings', 'logoutConfirmation'),
      [
        {
          text: t('common', 'cancel'),
          style: 'cancel'
        },
        {
          text: t('settings', 'logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Set offline status before logout
              const { friendsManager } = require('../../services/friendsManager');
              await friendsManager.updateOnlineStatus('offline');
              
              // Disconnect socket and cleanup
              friendsManager.disconnect();
              
              // End session first
              await sessionManager.endSession();
              
              // Sign out from Firebase
              await signOut(auth);
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert(t('common', 'error'), t('settings', 'logoutError'));
            }
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      t('settings', 'clearCache'),
      t('settings', 'clearCacheDescription'),
      [
        {
          text: t('common', 'cancel'),
          style: 'cancel'
        },
        {
          text: t('settings', 'clear'),
          style: 'destructive',
          onPress: () => {
            // Clear cache logic here
            Alert.alert(t('common', 'success'), t('settings', 'cacheCleared'));
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement, 
    showArrow = true 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity 
      style={[
        chessStyles.card, 
        styles.settingItem,
        { 
          backgroundColor: chessColors.backgroundSecondary,
          borderBottomColor: chessColors.border 
        }
      ]} 
      onPress={onPress} 
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color={chessColors.primary} />
        <View style={styles.settingText}>
          <Text style={[chessStyles.textPrimary, styles.settingTitle]}>{title}</Text>
          {subtitle && <Text style={[chessStyles.textSecondary, styles.settingSubtitle]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showArrow && !rightElement && (
          <Ionicons name="chevron-forward" size={20} color={chessColors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const VolumeSlider = () => (
    <View style={styles.volumeContainer}>
      <Text style={[chessStyles.textSecondary, styles.volumeLabel]}>{Math.round(soundVolume * 100)}%</Text>
      <View style={styles.volumeButtons}>
        <TouchableOpacity
          style={[styles.volumeButton, { backgroundColor: chessColors.border }]}
          onPress={() => handleVolumeChange(Math.max(0, soundVolume - 0.1))}
        >
          <Ionicons name="remove" size={16} color={chessColors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.volumeButton, { backgroundColor: chessColors.border }]}
          onPress={() => handleVolumeChange(Math.min(1, soundVolume + 0.1))}
        >
          <Ionicons name="add" size={16} color={chessColors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={[chessStyles.container]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: chessColors.primary }]}>
        <Text style={[chessStyles.textTitle, styles.headerTitle, { color: chessColors.textInverse }]}>{t('settings', 'settings')}</Text>
        <Text style={[chessStyles.textSecondary, styles.headerSubtitle, { color: chessColors.textInverse }]}>
          {t('settings', 'welcomeBack')} {user?.email}
        </Text>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={[chessStyles.textSecondary, styles.sectionTitle]}>{t('settings', 'language')}</Text>
        <SettingItem
          icon="language"
          title={t('settings', 'appLanguage')}
          subtitle={language === 'en' ? 'English' : 'Tiếng Việt'}
          onPress={handleLanguageToggle}
          rightElement={
            <View style={styles.languageToggle}>
              <Text style={[
                language === 'en' ? styles.activeLanguage : styles.inactiveLanguage,
                { color: language === 'en' ? chessColors.primary : chessColors.textSecondary }
              ]}>
                EN
              </Text>
              <Text style={[styles.languageSeparator, { color: chessColors.textSecondary }]}>|</Text>
              <Text style={[
                language === 'vi' ? styles.activeLanguage : styles.inactiveLanguage,
                { color: language === 'vi' ? chessColors.primary : chessColors.textSecondary }
              ]}>
                VI
              </Text>
            </View>
          }
        />
      </View>

      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={[chessStyles.textSecondary, styles.sectionTitle]}>{t('settings', 'theme')}</Text>
        <SettingItem
          icon={!isDark ? 'sunny' : 'moon'}
          title={t('settings', 'colorTheme')}
          subtitle={!isDark ? t('settings', 'lightMode') : t('settings', 'darkMode')}
          onPress={handleThemeToggle}
          rightElement={
            <View style={styles.languageToggle}>
              <Text style={[
                !isDark ? styles.activeLanguage : styles.inactiveLanguage,
                { color: !isDark ? chessColors.primary : chessColors.textSecondary }
              ]}>
                {t('settings', 'light')}
              </Text>
              <Text style={[styles.languageSeparator, { color: chessColors.textSecondary }]}>|</Text>
              <Text style={[
                isDark ? styles.activeLanguage : styles.inactiveLanguage,
                { color: isDark ? chessColors.primary : chessColors.textSecondary }
              ]}>
                {t('settings', 'dark')}
              </Text>
            </View>
          }
        />
      </View>

      {/* Sound Section */}
      <View style={styles.section}>
        <Text style={[chessStyles.textSecondary, styles.sectionTitle]}>{t('settings', 'sound')}</Text>
        <SettingItem
          icon="volume-high"
          title={t('settings', 'soundEffects')}
          subtitle={soundEnabled ? t('settings', 'enabled') : t('settings', 'disabled')}
          rightElement={
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: chessColors.border, true: chessColors.primary }}
              thumbColor={soundEnabled ? chessColors.textInverse : chessColors.backgroundTertiary}
            />
          }
          showArrow={false}
        />
        
        {soundEnabled && (
          <SettingItem
            icon="musical-notes"
            title={t('settings', 'volume')}
            subtitle={`${Math.round(soundVolume * 100)}%`}
            rightElement={<VolumeSlider />}
            showArrow={false}
          />
        )}
      </View>

      {/* Display Section */}
      <View style={styles.section}>
        <Text style={[chessStyles.textSecondary, styles.sectionTitle]}>{t('settings', 'display')}</Text>
        <SettingItem
          icon="notifications"
          title={t('settings', 'notifications')}
          subtitle={notificationsEnabled ? t('settings', 'enabled') : t('settings', 'disabled')}
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: chessColors.border, true: chessColors.primary }}
              thumbColor={notificationsEnabled ? chessColors.textInverse : chessColors.backgroundTertiary}
            />
          }
          showArrow={false}
        />
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[chessStyles.textSecondary, styles.sectionTitle]}>{t('settings', 'account')}</Text>
        <SettingItem
          icon="person"
          title={t('settings', 'profile')}
          subtitle={t('settings', 'viewEditProfile')}
          onPress={() => {
            // Navigate to profile screen
            Alert.alert(t('common', 'info'), t('settings', 'profileComingSoon'));
          }}
        />
        <SettingItem
          icon="trash"
          title={t('settings', 'clearCache')}
          subtitle={t('settings', 'clearCacheSubtitle')}
          onPress={handleClearCache}
        />
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <SettingItem
          icon="log-out"
          title={t('settings', 'logout')}
          subtitle={t('settings', 'logoutSubtitle')}
          onPress={handleLogout}
          rightElement={null}
          showArrow={false}
        />
      </View>

      {/* Version Info */}
      <View style={styles.footer}>
        <Text style={[chessStyles.textSecondary, styles.footerText]}>Chess Online v1.0.0</Text>
        <Text style={[chessStyles.textSecondary, styles.footerText]}>
          {t('settings', 'madeWith')} ❤️ {t('settings', 'byDeveloper')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: 'normal',
    opacity: 0.8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    marginBottom: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  activeLanguage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inactiveLanguage: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageSeparator: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  volumeLabel: {
    fontSize: 14,
    fontWeight: 'normal',
    minWidth: 35,
    textAlign: 'center',
    marginRight: 8,
  },
  volumeButtons: {
    flexDirection: 'row',
  },
  volumeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'center',
    marginBottom: 4,
  },
});