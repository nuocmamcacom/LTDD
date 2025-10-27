import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getTheme } from '../constants/theme';
import { useTheme } from '../providers/ThemeProvider';
import { auth } from '../services/firebaseConfig';

interface BanNotificationProps {
  visible: boolean;
  banInfo: {
    isBanned: boolean;
    bannedBy?: string;
    bannedAt?: string;
    banReason?: string;
  };
  onClose?: () => void;
}

export default function BanNotification({ visible, banInfo, onClose }: BanNotificationProps) {
  const { theme: themeMode } = useTheme();
  const theme = getTheme(themeMode);

  const handleLogoutPress = async () => {
    console.log('🔥 SIGN OUT BUTTON PRESSED!');
    try {
      console.log('🚪 Logging out banned user...');
      await auth.signOut();
      console.log('✅ Logout successful, closing notification...');
      onClose?.();
    } catch (error) {
      console.error('❌ Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      onClose?.();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const formatBanDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (!visible || !banInfo.isBanned) {
    return null;
  }

  return (
    <View 
      style={[
        styles.overlay, 
        { 
          display: visible ? 'flex' : 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999
        }
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: '#e74c3c' }]}>
            <View style={styles.headerContent}>
              <Ionicons name="ban" size={32} color="#fff" />
              <Text style={styles.headerTitle}>Account Banned</Text>
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={24} color="#e74c3c" />
              <Text style={[styles.warningText, { color: theme.colors.text }]}>
                Your account has been banned from Chess Online
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  🚫 Status:
                </Text>
                <Text style={[styles.detailValue, { color: '#e74c3c' }]}>
                  BANNED
                </Text>
              </View>

              {banInfo.bannedBy && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    👮 Banned by:
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {banInfo.bannedBy}
                  </Text>
                </View>
              )}

              {banInfo.bannedAt && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    📅 Banned on:
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {formatBanDate(banInfo.bannedAt)}
                  </Text>
                </View>
              )}

              {banInfo.banReason && (
                <View style={styles.reasonContainer}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    📝 Reason:
                  </Text>
                  <View style={[styles.reasonBox, { 
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border 
                  }]}>
                    <Text style={[styles.reasonText, { color: theme.colors.text }]}>
                      {banInfo.banReason}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={[styles.infoBox, { 
              backgroundColor: 'rgba(241, 196, 15, 0.1)',
              borderColor: '#f1c40f' 
            }]}>
              <Ionicons name="information-circle" size={20} color="#f1c40f" />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                If you believe this ban was issued in error, please contact the administrators 
                for review and assistance.
              </Text>
            </View>

            <View style={[styles.contactBox, { 
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border 
            }]}>
              <Text style={[styles.contactTitle, { color: theme.colors.text }]}>
                📧 Contact Support:
              </Text>
              <Text style={[styles.contactEmail, { color: theme.colors.primary }]}>
                support@chess-online.com
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: '#e74c3c' }]}
              onPress={handleLogoutPress}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 9999,
  },
  container: {
    width: '100%',
    maxWidth: 450,
    maxHeight: '85%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  warningText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  reasonContainer: {
    marginTop: 8,
  },
  reasonBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 10,
  },
  contactBox: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    minHeight: 56,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});