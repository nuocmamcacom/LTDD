import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useChessColors, useChessStyles, useChessTheme } from '../../../constants/ChessThemeProvider';
import { auth } from '../../services/firebaseConfig';

const API_URL = 'http://localhost:5000'; // Force localhost for debugging
console.log('🔧 [AdminPanel] API_URL:', API_URL, 'process.env.API_URL:', process.env.API_URL);

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  elo: number;
  matchesPlayed: number;
  wins: number;
  onlineStatus: string;
  lastSeen: string;
  isBanned: boolean;
  bannedBy?: string;
  bannedAt?: string;
  banReason?: string;
  friendsCount: number;
}

interface AdminStats {
  totalUsers: number;
  bannedUsers: number;
  adminUsers: number;
  onlineUsers: number;
  activeUsers: number;
}

export default function AdminPanel({ navigation }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'user' });
  const [banReason, setBanReason] = useState('');
  
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();
  const adminEmail = auth.currentUser?.email || '';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadUsers(), loadStats()]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users?adminEmail=${adminEmail}`);
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data);
      } else {
        throw new Error(data.error || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      throw error;
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/stats?adminEmail=${adminEmail}`);
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        throw new Error(data.error || 'Failed to load stats');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      throw error;
    }
  };

  const createUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users?adminEmail=${adminEmail}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'User created successfully');
        setNewUser({ email: '', name: '', role: 'user' });
        setCreateModalVisible(false);
        loadData();
      } else {
        Alert.alert('Error', data.error || 'Failed to create user');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create user');
    }
  };

  const banUser = async (userId: string, action: 'ban' | 'unban') => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/ban?adminEmail=${adminEmail}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: banReason })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', data.message);
        setBanReason('');
        setModalVisible(false);
        loadData();
      } else {
        Alert.alert('Error', data.error || `Failed to ${action} user`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} user`);
    }
  };

  const deleteUser = async (userId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/api/admin/users/${userId}?adminEmail=${adminEmail}`, {
                method: 'DELETE'
              });
              
              if (response.ok) {
                Alert.alert('Success', 'User deleted successfully');
                setModalVisible(false);
                loadData();
              } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to delete user');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { 
        backgroundColor: chessColors.cardBackground, 
        borderColor: chessColors.cardBorder 
      }]}
      onPress={() => {
        setSelectedUser(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.userInfo}>
        <Text style={[styles.userEmail, { color: chessColors.text }]}>{item.email}</Text>
        <Text style={[styles.userName, { color: chessColors.textSecondary }]}>{item.name}</Text>
        <View style={styles.userStats}>
          <Text style={[styles.statText, { color: chessColors.textSecondary }]}>
            ELO: {item.elo} | Matches: {item.matchesPlayed} | Friends: {item.friendsCount}
          </Text>
        </View>
      </View>
      <View style={styles.userStatus}>
        {item.role === 'admin' && (
          <View style={[styles.badge, { backgroundColor: chessColors.primary }]}>
            <Text style={styles.badgeText}>ADMIN</Text>
          </View>
        )}
        {item.isBanned && (
          <View style={[styles.badge, { backgroundColor: chessColors.error }]}>
            <Text style={styles.badgeText}>BANNED</Text>
          </View>
        )}
        <View style={[
          styles.statusDot,
          { backgroundColor: item.onlineStatus === 'online' ? chessColors.success : chessColors.textTertiary }
        ]} />
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={[styles.statsContainer, { 
        backgroundColor: chessColors.cardBackground, 
        borderColor: chessColors.cardBorder 
      }]}>
        <Text style={[styles.sectionTitle, { color: chessColors.text }]}>📊 System Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: chessColors.primary }]}>{stats.totalUsers}</Text>
            <Text style={[styles.statLabel, { color: chessColors.textSecondary }]}>Total Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: chessColors.success }]}>{stats.onlineUsers}</Text>
            <Text style={[styles.statLabel, { color: chessColors.textSecondary }]}>Online</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: chessColors.error }]}>{stats.bannedUsers}</Text>
            <Text style={[styles.statLabel, { color: chessColors.textSecondary }]}>Banned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: chessColors.warning }]}>{stats.adminUsers}</Text>
            <Text style={[styles.statLabel, { color: chessColors.textSecondary }]}>Admins</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: chessColors.background }]}>
        <ActivityIndicator size="large" color={chessColors.primary} />
        <Text style={[styles.loadingText, { color: chessColors.text }]}>Loading admin panel...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: chessColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: chessColors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👑 Admin Panel</Text>
        <TouchableOpacity onPress={() => setCreateModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderStats()}

        {/* Users List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: chessColors.text }]}>👥 Users ({users.length})</Text>
            <TouchableOpacity onPress={loadData}>
              <Ionicons name="refresh" size={20} color={chessColors.primary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* User Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: chessColors.background }]}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: chessColors.text }]}>
                    Manage User
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={chessColors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <Text style={[styles.userDetailText, { color: chessColors.text }]}>
                    📧 Email: {selectedUser.email}
                  </Text>
                  <Text style={[styles.userDetailText, { color: chessColors.text }]}>
                    👤 Name: {selectedUser.name}
                  </Text>
                  <Text style={[styles.userDetailText, { color: chessColors.text }]}>
                    🏆 ELO: {selectedUser.elo}
                  </Text>
                  <Text style={[styles.userDetailText, { color: chessColors.text }]}>
                    🎮 Matches: {selectedUser.matchesPlayed} (Won: {selectedUser.wins})
                  </Text>
                  <Text style={[styles.userDetailText, { color: chessColors.text }]}>
                    👥 Friends: {selectedUser.friendsCount}
                  </Text>
                  <Text style={[styles.userDetailText, { color: chessColors.text }]}>
                    🔧 Role: {selectedUser.role.toUpperCase()}
                  </Text>
                  <Text style={[styles.userDetailText, { color: chessColors.text }]}>
                    📶 Status: {selectedUser.onlineStatus}
                  </Text>

                  {selectedUser.isBanned && (
                    <View style={styles.banInfo}>
                      <Text style={[styles.banText, { color: chessColors.error }]}>
                        🚫 Banned by: {selectedUser.bannedBy}
                      </Text>
                      <Text style={[styles.banText, { color: chessColors.error }]}>
                        📅 Banned at: {new Date(selectedUser.bannedAt!).toLocaleString()}
                      </Text>
                      <Text style={[styles.banText, { color: chessColors.error }]}>
                        📝 Reason: {selectedUser.banReason}
                      </Text>
                    </View>
                  )}

                  {!selectedUser.isBanned && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: chessColors.text }]}>Ban Reason:</Text>
                      <TextInput
                        style={[styles.textInput, { 
                          backgroundColor: chessColors.backgroundSecondary,
                          color: chessColors.text,
                          borderColor: chessColors.border
                        }]}
                        value={banReason}
                        onChangeText={setBanReason}
                        placeholder="Enter ban reason..."
                        placeholderTextColor={chessColors.textSecondary}
                        multiline
                      />
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalActions}>
                  {selectedUser.isBanned ? (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: chessColors.success }]}
                      onPress={() => banUser(selectedUser._id, 'unban')}
                    >
                      <Text style={styles.actionButtonText}>✅ Unban User</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: chessColors.error }]}
                      onPress={() => banUser(selectedUser._id, 'ban')}
                      disabled={!banReason.trim()}
                    >
                      <Text style={styles.actionButtonText}>🚫 Ban User</Text>
                    </TouchableOpacity>
                  )}
                  
                  {selectedUser.role !== 'admin' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: chessColors.error }]}
                      onPress={() => deleteUser(selectedUser._id)}
                    >
                      <Text style={styles.actionButtonText}>🗑️ Delete User</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Create User Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: chessColors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: chessColors.text }]}>
                Create New User
              </Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color={chessColors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: chessColors.text }]}>Email:</Text>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: chessColors.backgroundSecondary,
                    color: chessColors.text,
                    borderColor: chessColors.border
                  }]}
                  value={newUser.email}
                  onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                  placeholder="user@example.com"
                  placeholderTextColor={chessColors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: chessColors.text }]}>Name:</Text>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: chessColors.backgroundSecondary,
                    color: chessColors.text,
                    borderColor: chessColors.border
                  }]}
                  value={newUser.name}
                  onChangeText={(text) => setNewUser({ ...newUser, name: text })}
                  placeholder="User's display name"
                  placeholderTextColor={chessColors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: chessColors.text }]}>Role:</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      { backgroundColor: newUser.role === 'user' ? chessColors.primary : chessColors.backgroundSecondary }
                    ]}
                    onPress={() => setNewUser({ ...newUser, role: 'user' })}
                  >
                    <Text style={[styles.roleButtonText, { color: newUser.role === 'user' ? chessColors.textInverse : chessColors.text }]}>
                      User
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      { backgroundColor: newUser.role === 'admin' ? chessColors.primary : chessColors.backgroundSecondary }
                    ]}
                    onPress={() => setNewUser({ ...newUser, role: 'admin' })}
                  >
                    <Text style={[styles.roleButtonText, { color: newUser.role === 'admin' ? chessColors.textInverse : chessColors.text }]}>
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: chessColors.primary }]}
                onPress={createUser}
                disabled={!newUser.email.trim()}
              >
                <Text style={styles.actionButtonText}>✅ Create User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    marginTop: 2,
  },
  userStats: {
    marginTop: 5,
  },
  statText: {
    fontSize: 12,
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
  },
  userDetailText: {
    fontSize: 14,
    marginBottom: 8,
  },
  banInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
  },
  banText: {
    fontSize: 12,
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});