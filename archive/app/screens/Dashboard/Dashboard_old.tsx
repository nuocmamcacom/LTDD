import { theme } from "@/app/constants/theme";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ApiConfigModal } from "../../components/ApiConfigModal";
import { useApiConfig } from "../../hooks/useApiConfig";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useLanguage } from "../../providers/LanguageProvider";
import { createRoom, deleteRoom, getRooms, joinRoom } from "../../services/api";
import { auth } from "../../services/firebaseConfig";
import { getSocket } from "../../services/socket";

type Room = {
  _id: string;
  roomId: string;
  hostEmail: string;
  members: string[];
  status: "waiting" | "playing" | "finished";
  createdAt: string;
  updatedAt: string;
};

export default function Dashboard({ navigation }: any) {
  console.log('🏠 Dashboard component mounted');
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomCode, setRoomCode] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null); // Track which room is being deleted
  const [configVisible, setConfigVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  
  const { isConnected, isLoading: apiLoading, apiUrl, updateApiUrl } = useApiConfig();
  const { t } = useLanguage();
  const themedStyles = useThemedStyles();
  
  const email = auth.currentUser?.email || "";

  const fetchRooms = async () => {
    console.log('🔄 Fetching rooms...');
    setLoadingList(true);
    try {
      const res = await getRooms();
      console.log('✅ Rooms fetched:', res.data?.length || 0, 'rooms');
      setRooms(res.data || []);
    } catch (err: any) {
      console.error('❌ Error fetching rooms:', err);
      Alert.alert(t('dashboard', 'error'), t('dashboard', 'unableToLoadRoomList'));
    } finally {
      setLoadingList(false);
    }
  };

  const handleCreateRoom = async () => {
    console.log('🏗️ Creating room...');
    if (!email) {
      return Alert.alert(t('dashboard', 'notLoggedIn'), t('dashboard', 'pleaseLogInAgainToCreateRoom'));
    }
    const roomId = Math.random().toString(36).slice(2, 8);
    console.log('🏗️ Generated room ID:', roomId);
    setCreating(true);
    try {
      await createRoom(roomId, email);
      console.log('✅ Room created successfully');
      await fetchRooms();
      navigation.navigate("GameRoom", { roomId });
    } catch (err: any) {
      console.error('❌ Error creating room:', err);
      Alert.alert(t('dashboard', 'error'), t('dashboard', 'unableToCreateRoom'));
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    console.log('🚪 Joining room...');
    if (!email) {
      return Alert.alert(t('dashboard', 'notLoggedIn'), t('dashboard', 'pleaseLogInAgainToJoinRoom'));
    }
    const targetRoomId = roomCode.trim();
    if (!targetRoomId) {
      return Alert.alert(t('dashboard', 'invalid'), t('dashboard', 'pleaseEnterRoomCode'));
    }
    console.log('🚪 Joining room:', targetRoomId);
    setJoining(true);
    try {
      await joinRoom(targetRoomId, email);
      console.log('✅ Room joined successfully');
      await fetchRooms();
      navigation.navigate("GameRoom", { roomId: targetRoomId });
    } catch (err: any) {
      console.error('❌ Error joining room:', err);
      Alert.alert(t('dashboard', 'error'), t('dashboard', 'unableToJoinRoom'));
    } finally {
      setJoining(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    console.log("🗑️ Delete button pressed for room:", roomId);
    console.log("🗑️ Current user email:", email);
    
    if (!email) {
      return Alert.alert(t('dashboard', 'notLoggedIn'), t('dashboard', 'pleaseLogInAgainToDeleteRoom'));
    }
    
    console.log("🗑️ Showing confirmation dialog...");
    setRoomToDelete(roomId);
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    
    console.log("🗑️ Delete confirmed, starting process...");
    setDeleting(roomToDelete);
    setDeleteConfirmVisible(false);
    
    try {
      console.log("🗑️ Calling deleteRoom API...");
      await deleteRoom(roomToDelete, email);
      console.log("🗑️ API call successful");
      
      // Emit socket event to notify other users
      const socket = getSocket();
      if (socket.connected) {
        console.log("🗑️ Emitting socket event...");
        socket.emit("roomDeleted", { roomId: roomToDelete, deletedBy: email });
      } else {
        console.log("🗑️ Socket not connected");
      }
      
      console.log("🗑️ Refreshing room list...");
      await fetchRooms();
      Alert.alert(t('dashboard', 'success'), t('dashboard', 'roomDeletedSuccessfully'));
    } catch (err: any) {
      console.error("🗑️ Delete error:", err);
      console.error("🗑️ Error response:", err?.response?.data);
      const errorMsg = err?.response?.data?.error || t('dashboard', 'unableToDeleteRoom');
      Alert.alert(t('dashboard', 'error'), errorMsg);
    } finally {
      console.log("🗑️ Clearing deleting state");
      setDeleting(null);
      setRoomToDelete(null);
    }
  };

  useEffect(() => {
    console.log('🏠 Dashboard useEffect - mounting, fetching rooms...');
    fetchRooms();
    
    return () => {
      console.log('🏠 Dashboard useEffect - unmounting...');
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('dashboard', 'chessOnline')}</Text>
        <TouchableOpacity 
          style={[styles.configButton, { backgroundColor: theme.colors.backgroundCard }]}
          onPress={() => setConfigVisible(true)}
        >
          <Text style={[styles.configIcon, { color: theme.colors.text }]}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ApiConfigModal
        visible={configVisible}
        currentUrl={apiUrl || ""}
        onSave={updateApiUrl}
        onClose={() => setConfigVisible(false)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('dashboard', 'deleteRoom')}</Text>
            <Text style={styles.modalText}>
              {t('dashboard', 'areYouSureDeleteRoom')} {roomToDelete}?
            </Text>
            <Text style={[styles.modalText, { fontSize: 12, color: '#e74c3c', marginTop: 8 }]}>
              {t('dashboard', 'thisActionCannotBeUndone')}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#95a5a6" }]}
                onPress={() => {
                  console.log("🗑️ Delete cancelled");
                  setDeleteConfirmVisible(false);
                  setRoomToDelete(null);
                }}
              >
                <Text style={styles.modalButtonText}>{t('dashboard', 'cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#e74c3c" }]}
                onPress={confirmDeleteRoom}
                disabled={deleting === roomToDelete}
              >
                {deleting === roomToDelete ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>{t('dashboard', 'delete')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selectedRoom}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRoom && (
              <>
                <Text style={styles.modalTitle}>{t('dashboard', 'room')} {selectedRoom.roomId}</Text>
                <Text style={styles.modalText}>{t('dashboard', 'status')}: {selectedRoom.status}</Text>
                <Text style={styles.modalText}>
                  {t('dashboard', 'players')}: {selectedRoom.members?.length || 0}/2
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: "#95a5a6" }]}
                    onPress={() => setSelectedRoom(null)}
                  >
                    <Text style={styles.modalButtonText}>{t('dashboard', 'close')}</Text>
                  </TouchableOpacity>

                  {!selectedRoom.members.includes(email) && selectedRoom.members.length < 2 && (
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: "#27ae60" }]}
                      onPress={async () => {
                        try {
                          await joinRoom(selectedRoom.roomId, email);
                          await fetchRooms();
                          navigation.navigate("GameRoom", { roomId: selectedRoom.roomId });
                          setSelectedRoom(null);
                        } catch (err: any) {
                          Alert.alert(t('dashboard', 'error'), t('dashboard', 'unableToJoinRoom'));
                        }
                      }}
                    >
                      <Text style={styles.modalButtonText}>{t('dashboard', 'join')}</Text>
                    </TouchableOpacity>
                  )}

                  {selectedRoom.members.includes(email) && (
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: "#2563eb" }]}
                      onPress={() => {
                        navigation.navigate("GameRoom", { roomId: selectedRoom.roomId });
                        setSelectedRoom(null);
                      }}
                    >
                      <Text style={styles.modalButtonText}>{t('dashboard', 'enterRoom')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item._id?.toString() || item.roomId}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.roomItem, { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border }]}
            onPress={() => setSelectedRoom(item)}
          >
            <View style={styles.roomHeader}>
              <View style={styles.roomInfo}>
                <Text style={[styles.roomText, { color: theme.colors.text }]}>{t('dashboard', 'room')} {item.roomId}</Text>
                <Text style={[styles.roomStatus, { color: theme.colors.textSecondary }]}>
                  {t('dashboard', 'status')}: {item.status} • {item.members?.length || 0}/2 {t('dashboard', 'players')}
                </Text>
              </View>
              
              {/* Delete button for room host */}
              {item.hostEmail === email && (
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={(e) => {
                    console.log("🗑️ Delete button touched for room:", item.roomId);
                    console.log("🗑️ Event:", e.type);
                    e.stopPropagation(); // Prevent modal from opening
                    handleDeleteRoom(item.roomId);
                  }}
                  disabled={deleting === item.roomId}
                >
                  {deleting === item.roomId ? (
                    <ActivityIndicator size="small" color="#e74c3c" />
                  ) : (
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.badges}>
              {item.members.includes(email) && (
                <Text style={[styles.badge, { backgroundColor: "#27ae60", color: 'white' }]}>
                  {t('dashboard', 'yourRoom')}
                </Text>
              )}
              {item.hostEmail === email && (
                <Text style={[styles.badge, { backgroundColor: "#3498db", color: 'white' }]}>
                  {t('dashboard', 'host')}
                </Text>
              )}
              {item.members.length >= 2 && (
                <Text style={[styles.badge, { backgroundColor: "#e74c3c", color: 'white' }]}>
                  {t('dashboard', 'full')}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('dashboard', 'noRoomsAvailable')}</Text>}
        refreshing={loadingList}
        onRefresh={fetchRooms}
      />

      <TextInput
        style={styles.input}
        placeholder={t('dashboard', 'enterRoomCode')}
        value={roomCode}
        onChangeText={setRoomCode}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#3498db" }]}
        onPress={handleJoinRoom}
        disabled={joining}
      >
        {joining ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('dashboard', 'joinRoom')}</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#27ae60" }]}
        onPress={handleCreateRoom}
        disabled={creating}
      >
        {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('dashboard', 'createRoom')}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { 
    fontSize: 24,
    fontWeight: '600',
  },
  configButton: {
    ...theme.components.button,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundCard,
    minHeight: 'auto',
  },
  configIcon: { 
    fontSize: 18,
    color: theme.colors.text,
  },
  roomItem: {
    ...theme.components.card,
    marginVertical: theme.spacing.xs,
    ...theme.shadows.medium,
  },
  roomHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  roomInfo: {
    flex: 1,
  },
  roomText: { 
    ...theme.typography.h3,
    color: theme.colors.text 
  },
  roomStatus: { 
    ...theme.typography.caption,
    marginTop: theme.spacing.xs 
  },
  deleteButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    marginLeft: theme.spacing.md,
  },
  deleteIcon: {
    fontSize: 16,
    color: theme.colors.text,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    fontSize: 10,
    fontWeight: "600",
  },
  emptyText: {
    ...theme.typography.body,
    textAlign: "center",
    color: theme.colors.textMuted,
    marginTop: theme.spacing.lg,
    fontSize: 16,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    width: "85%",
    maxWidth: 320,
    ...theme.shadows.large,
    ...theme.shadows.large,
  },
  modalTitle: {
    ...theme.typography.h3,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  modalText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  modalButton: {
    ...theme.components.button,
    flex: 1,
  },
  modalButtonText: {
    ...theme.typography.button,
  },
  input: {
    ...theme.components.input,
    marginVertical: theme.spacing.sm,
  },
  button: {
    ...theme.components.button,
    marginVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.medium,
  },
  buttonText: { 
    ...theme.typography.button 
  },
});