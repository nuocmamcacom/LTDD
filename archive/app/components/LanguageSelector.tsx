import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';
import { useLanguage } from '../providers/LanguageProvider';

interface LanguageSelectorProps {
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { language, setLanguage, t } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
    { code: 'vi' as const, name: 'Tiếng Việt', flag: '🇻🇳' },
  ];

  const handleLanguageChange = async (languageCode: 'en' | 'vi') => {
    try {
      await setLanguage(languageCode);
      setModalVisible(false);
      Alert.alert(
        t('common', 'success'),
        t('settings', 'languageChanged')
      );
    } catch (error) {
      Alert.alert(
        t('common', 'error'),
        'Failed to change language'
      );
    }
  };

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <>
      <TouchableOpacity
        style={[styles.languageButton, style]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.flagText}>{currentLanguage?.flag}</Text>
        <Text style={styles.languageText}>
          {currentLanguage?.code.toUpperCase()}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('settings', 'selectLanguage')}
            </Text>

            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.selectedLanguage
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={styles.flagIcon}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  language === lang.code && styles.selectedLanguageName
                ]}>
                  {lang.name}
                </Text>
                {language === lang.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>
                {t('common', 'cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  languageButton: {
    ...theme.components.button,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundCard,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 70,
  },
  flagText: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  languageText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '80%',
    maxWidth: 300,
    ...theme.shadows.large,
  },
  modalTitle: {
    ...theme.typography.h3,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundCard,
  },
  selectedLanguage: {
    backgroundColor: theme.colors.primary,
  },
  flagIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  languageName: {
    ...theme.typography.body,
    flex: 1,
    color: theme.colors.text,
  },
  selectedLanguageName: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  cancelButton: {
    ...theme.components.button,
    backgroundColor: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  cancelButtonText: {
    ...theme.typography.button,
  },
});