import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useChessColors, useChessStyles, useChessTheme } from "../../../constants/ChessThemeProvider";
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
  timeControlMinutes: number; // ⏱️ Game time control
  createdAt: string;
  updatedAt: string;
};

export default function Dashboard({ navigation }: any) {
  console.log('🏠 Dashboard component mounted');
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [selectedTimeControl, setSelectedTimeControl] = useState(10); // ⏱️ Default 10 minutes
  const { t } = useLanguage();
  const themedStyles = useThemedStyles();
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();
  
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
    console.log('🏗️ Creating room with time control:', selectedTimeControl, 'minutes');
    if (!email) {
      return Alert.alert(t('dashboard', 'notLoggedIn'), t('dashboard', 'pleaseLogInAgainToCreateRoom'));
    }
    const roomId = Math.random().toString(36).slice(2, 8);
    console.log('🏗️ Generated room ID:', roomId);
    setCreating(true);
    try {
      await createRoom(roomId, email, selectedTimeControl);
      console.log('✅ Room created successfully with', selectedTimeControl, 'minutes');
      await fetchRooms();
      navigation.navigate("GameRoom", { roomId });
    } catch (err: any) {
      console.error('❌ Error creating room:', err);
      Alert.alert(t('dashboard', 'error'), t('dashboard', 'unableToCreateRoom'));
    } finally {
      setCreating(false);
    }
  };



  const handleJoinRoom = async (roomId: string) => {
    console.log('🎯 Joining room:', roomId, 'with email:', email);
    if (!email) {
      return Alert.alert(t('dashboard', 'notLoggedIn'), t('dashboard', 'pleaseLogInAgain'));
    }
    
    try {
      const response = await joinRoom(roomId, email);
      console.log('✅ Successfully joined room:', response.data);
      
      await fetchRooms(); // Refresh room list
      setSelectedRoom(null); // Close modal
      navigation.navigate("GameRoom", { roomId });
      
    } catch (error: any) {
      console.error('❌ Error joining room:', error);
      const errorMessage = error?.response?.data?.error || error.message || 'Unable to join room';
      Alert.alert('Error', errorMessage);
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

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: chessColors.background,
      minHeight: '100%',
      padding: chessTheme.spacing.md,
    },
    header: {
      ...chessStyles.header,
      marginBottom: chessTheme.spacing.md,
    },
    title: {
      ...chessStyles.headerTitle,
      fontSize: 28,
      color: chessColors.text,
    },

    roomItem: {
      ...chessStyles.card,
      backgroundColor: chessColors.cardBackground,
      borderColor: chessColors.cardBorder,
      marginVertical: chessTheme.spacing.xs,
    },
    roomText: {
      ...chessStyles.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    roomStatus: {
      ...chessStyles.textTertiary,
      marginTop: chessTheme.spacing.xs,
    },
    deleteButton: {
      ...chessStyles.badge,
      ...chessStyles.badgeError,
      padding: chessTheme.spacing.sm,
      marginLeft: chessTheme.spacing.sm,
    },
    deleteIcon: {
      fontSize: 16,
      color: 'white',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      ...chessStyles.cardLarge,
      backgroundColor: chessColors.cardBackground,
      width: "85%",
      maxWidth: 320,
    },
    modalTitle: {
      ...chessStyles.textTitle,
      fontSize: 18,
      textAlign: "center",
      marginBottom: chessTheme.spacing.md,
    },
    modalText: {
      ...chessStyles.textSecondary,
      fontSize: 14,
      marginBottom: 8,
    },
    modalButtons: {
      flexDirection: "row",
      marginTop: 16,
      gap: 12,
    },
    modalButton: {
      ...chessStyles.buttonPrimary,
      flex: 1,
      padding: chessTheme.spacing.sm,
    },
    modalButtonText: {
      ...chessStyles.buttonText,
    },

    button: {
      ...chessStyles.buttonPrimary,
      padding: chessTheme.spacing.md,
      marginVertical: chessTheme.spacing.xs,
    },
    buttonText: {
      ...chessStyles.buttonText,
      fontSize: 16,
      fontWeight: '600',
    },
    emptyText: {
      textAlign: "center",
      color: themedStyles.theme.colors.textMuted,
      marginTop: 32,
      fontSize: 16,
    },
    // 📱 Scrollable Content for Web/Mobile
    scrollableContent: {
      flex: 1,
      minHeight: 300, // Reduced from 400
    },
    // ⏱️ Time Control Styles
    timeControlSection: {
      marginVertical: 12, // Reduced from 16 to 12
    },
    timeControlLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: themedStyles.theme.colors.text,
      marginBottom: 8, // Reduced from 12 to 8
      textAlign: 'center',
    },
    timeControlButtons: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      gap: 8,
    },
    timeControlButton: {
      flex: 1,
      paddingVertical: 10, // Reduced from 12 to 10
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: themedStyles.theme.colors.backgroundSecondary,
      borderWidth: 2,
      borderColor: themedStyles.theme.colors.border,
      alignItems: 'center',
    },
    timeControlButtonActive: {
      backgroundColor: chessColors.primary,
      borderColor: chessColors.primaryHover,
    },
    timeControlButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: themedStyles.theme.colors.text,
    },
    timeControlButtonTextActive: {
      color: 'white',
    },
  });

  return (
    <ScrollView 
      style={dynamicStyles.container} 
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>{t('dashboard', 'chessOnline')}</Text>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>{t('dashboard', 'deleteRoom')}</Text>
            <Text style={dynamicStyles.modalText}>
              {t('dashboard', 'areYouSureDeleteRoom')} {roomToDelete}?
            </Text>
            <Text style={[dynamicStyles.modalText, { fontSize: 12, color: chessColors.error, marginTop: 8 }]}>
              {t('dashboard', 'thisActionCannotBeUndone')}
            </Text>

            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, { backgroundColor: chessColors.textSecondary }]}
                onPress={() => {
                  console.log("🗑️ Delete cancelled");
                  setDeleteConfirmVisible(false);
                  setRoomToDelete(null);
                }}
              >
                <Text style={dynamicStyles.modalButtonText}>{t('dashboard', 'cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.modalButton, { backgroundColor: chessColors.error }]}
                onPress={confirmDeleteRoom}
                disabled={deleting === roomToDelete}
              >
                {deleting === roomToDelete ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={dynamicStyles.modalButtonText}>{t('dashboard', 'delete')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Room Details Modal */}
      <Modal
        visible={!!selectedRoom}
        transparent
        animationType="slide"
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            {selectedRoom && (
              <>
                <Text style={dynamicStyles.modalTitle}>{t('dashboard', 'room')} {selectedRoom.roomId}</Text>
                <Text style={dynamicStyles.modalText}>{t('dashboard', 'status')}: {selectedRoom.status}</Text>
                <Text style={dynamicStyles.modalText}>
                  {t('dashboard', 'players')}: {selectedRoom.members?.length || 0}/2
                </Text>

                <View style={dynamicStyles.modalButtons}>
                  <TouchableOpacity
                    style={[dynamicStyles.modalButton, { backgroundColor: chessColors.textSecondary }]}
                    onPress={() => setSelectedRoom(null)}
                  >
                    <Text style={dynamicStyles.modalButtonText}>{t('dashboard', 'close')}</Text>
                  </TouchableOpacity>

                  {/* Show Enter Room button for members, Join Room button for non-members */}
                  {selectedRoom.members.includes(email) ? (
                    <TouchableOpacity
                      style={[dynamicStyles.modalButton, { backgroundColor: chessColors.primary }]}
                      onPress={() => {
                        navigation.navigate("GameRoom", { roomId: selectedRoom.roomId });
                        setSelectedRoom(null);
                      }}
                    >
                      <Text style={dynamicStyles.modalButtonText}>{t('dashboard', 'enterRoom')}</Text>
                    </TouchableOpacity>
                  ) : selectedRoom.members.length < 2 ? (
                    <TouchableOpacity
                      style={[dynamicStyles.modalButton, { backgroundColor: chessColors.success }]}
                      onPress={() => {
                        handleJoinRoom(selectedRoom.roomId);
                      }}
                    >
                      <Text style={dynamicStyles.modalButtonText}>🎯 Join Room</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[dynamicStyles.modalButton, { backgroundColor: chessColors.error, opacity: 0.6 }]}
                      disabled={true}
                    >
                      <Text style={dynamicStyles.modalButtonText}>Room Full</Text>
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
            style={dynamicStyles.roomItem}
            onPress={() => setSelectedRoom(item)}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={dynamicStyles.roomText}>{t('dashboard', 'room')} {item.roomId}</Text>
                <Text style={dynamicStyles.roomStatus}>
                  {t('dashboard', 'status')}: {item.status} • {item.members?.length || 0}/2 {t('dashboard', 'players')}
                </Text>
              </View>
              
              {/* Delete button for room host */}
              {item.hostEmail === email && (
                <TouchableOpacity 
                  style={dynamicStyles.deleteButton}
                  onPress={(e) => {
                    console.log("🗑️ Delete button touched for room:", item.roomId);
                    e.stopPropagation();
                    handleDeleteRoom(item.roomId);
                  }}
                  disabled={deleting === item.roomId}
                >
                  {deleting === item.roomId ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={dynamicStyles.deleteIcon}>🗑️</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {item.members.includes(email) && (
                <Text style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: chessColors.success, color: chessColors.textInverse, fontSize: 10, fontWeight: "600" }}>
                  {t('dashboard', 'yourRoom')}
                </Text>
              )}
              {item.hostEmail === email && (
                <Text style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: chessColors.primary, color: chessColors.textInverse, fontSize: 10, fontWeight: "600" }}>
                  {t('dashboard', 'host')}
                </Text>
              )}
              {item.members.length >= 2 && (
                <Text style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: chessColors.error, color: chessColors.textInverse, fontSize: 10, fontWeight: "600" }}>
                  {t('dashboard', 'full')}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={dynamicStyles.emptyText}>{t('dashboard', 'noRoomsAvailable')}</Text>}
        refreshing={loadingList}
        onRefresh={fetchRooms}
        scrollEnabled={false}
      />



      {/* ⏱️ Time Control Selector */}
      <View style={dynamicStyles.timeControlSection}>
        <Text style={dynamicStyles.timeControlLabel}>Game Time</Text>
        <View style={dynamicStyles.timeControlButtons}>
          {[3, 5, 7, 10].map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                dynamicStyles.timeControlButton,
                selectedTimeControl === time && dynamicStyles.timeControlButtonActive
              ]}
              onPress={() => setSelectedTimeControl(time)}
            >
              <Text 
                style={[
                  dynamicStyles.timeControlButtonText,
                  selectedTimeControl === time && dynamicStyles.timeControlButtonTextActive
                ]}
              >
                {time}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[dynamicStyles.button, { backgroundColor: chessColors.success }]}
        onPress={handleCreateRoom}
        disabled={creating}
      >
        {creating ? <ActivityIndicator color={chessColors.textInverse} /> : <Text style={dynamicStyles.buttonText}>{t('dashboard', 'createRoom')}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}