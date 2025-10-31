import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useChessColors, useChessStyles, useChessTheme } from "../../../constants/ChessThemeProvider";
import { useLanguage } from "../../providers/LanguageProvider";
import { getFriends, removeFriend as removeFriendAPI } from "../../services/api";
import { auth } from "../../services/firebaseConfig";
import { friendsManager } from "../../services/friendsManager";

type Friend = {
  email: string;
  name: string;
  elo: number;
  onlineStatus: "online" | "offline" | "away" | "busy";
  lastSeen: string;
  friendshipId: string;
  friendsSince: string;
  profilePicture?: string;
};

export default function FriendsList({ navigation }: any) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useLanguage();
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();
  
  const userEmail = auth.currentUser?.email || "";

  const loadFriends = useCallback(async () => {
    try {
      const response = await getFriends(userEmail);
      const friendsData = response.data || [];
      
      // Transform API data to match our Friend type
      const transformedFriends: Friend[] = friendsData.map((friend: any) => ({
        email: friend.email,
        name: friend.name || friend.email.split('@')[0],
        elo: friend.elo || 1200,
        onlineStatus: friend.onlineStatus || "offline",
        lastSeen: friend.lastSeen || new Date().toISOString(),
        friendshipId: friend.friendshipId,
        friendsSince: friend.friendsSince || new Date().toISOString(),
        profilePicture: friend.profilePicture
      }));
      
      setFriends(transformedFriends);
    } catch (error) {
      console.error("Error loading friends:", error);
      Alert.alert(t('common', 'error'), t('friends', 'errorLoadFriends'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userEmail]);

  useEffect(() => {
    loadFriends();
    
    // Initialize friends manager
    friendsManager.initialize();
    
    // Subscribe to friend updates
    const unsubscribe = friendsManager.subscribeToUpdates((update) => {
      if (update.type === "status_update" && update.friendEmail && update.status) {
        // Update friend's online status in real-time
        setFriends(currentFriends =>
          currentFriends.map(friend =>
            friend.email === update.friendEmail
              ? { ...friend, onlineStatus: update.status!, lastSeen: new Date().toISOString() }
              : friend
          )
        );
      } else if (update.type === "friend_request" || update.type === "request_accepted") {
        // Refresh friends list when new friend is added
        loadFriends();
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [loadFriends]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFriends();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "#4CAF50";
      case "away": return "#FF9800";
      case "busy": return "#F44336";
      default: return "#9E9E9E";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return "radio-button-on";
      case "away": return "time-outline";
      case "busy": return "do-not-disturb";
      default: return "radio-button-off";
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return lastSeenDate.toLocaleDateString();
  };

  const challengeFriend = (friend: Friend) => {
    Alert.alert(
      t('friends', 'challengeFriend'),
      t('friends', 'challengeMessage').replace('{name}', friend.name),
      [
        { text: t('common', 'cancel'), style: "cancel" },
        { 
          text: t('friends', 'challenge'), 
          onPress: () => {
            Alert.alert(t('friends', 'challengeSent'), t('friends', 'challengeSentMessage').replace('{name}', friend.name));
          }
        }
      ]
    );
  };

  const removeFriend = (friend: Friend) => {
    // For now, skip confirmation and go straight to removal for testing
    handleRemoveFriend(friend);
  };

  const handleRemoveFriend = async (friend: Friend) => {
    try {
      const response = await removeFriendAPI(userEmail, friend.email);
      
      setFriends(friends.filter(f => f.email !== friend.email));
    } catch (error) {
      console.error("❌ Error removing friend:", error);
      console.error("❌ Error details:", (error as any)?.response?.data || (error as any)?.message);
    }
  };

  const renderFriendItem = ({ item: friend }: { item: Friend }) => (
    <View style={[styles.friendCard, chessStyles.card]}>
      <View style={styles.friendInfo}>
        {/* Profile Picture Placeholder */}
        <View style={[styles.avatar, chessStyles.card]}>
          <Text style={[styles.avatarText, { color: chessColors.text }]}>
            {friend.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.friendDetails}>
          <View style={styles.nameRow}>
            <Text style={[styles.friendName, { color: chessColors.text }]}>{friend.name}</Text>
            <View style={styles.statusContainer}>
              <Ionicons 
                name={getStatusIcon(friend.onlineStatus) as any} 
                size={12} 
                color={getStatusColor(friend.onlineStatus)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(friend.onlineStatus) }]}>
                {friend.onlineStatus}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.friendElo, { color: chessColors.textSecondary }]}>
            {t('friends', 'rating').replace('{rating}', friend.elo.toString())}
          </Text>
          
          <Text style={[styles.lastSeen, { color: chessColors.textSecondary }]}>
            {friend.onlineStatus === "online" ? t('friends', 'online') : `${t('friends', 'lastSeen')}: ${formatLastSeen(friend.lastSeen)}`}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.challengeButton]}
          onPress={() => challengeFriend(friend)}
        >
          <Ionicons name="game-controller" size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => {
            removeFriend(friend);
          }}
        >
          <Ionicons name="person-remove" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={80} color={chessColors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: chessColors.text }]}>{t('friends', 'noFriends')}</Text>
      <Text style={[styles.emptyMessage, { color: chessColors.textSecondary }]}>
        {t('friends', 'noFriendsMessage')}
      </Text>
      <TouchableOpacity 
        style={[styles.addFriendsButton, chessStyles.buttonPrimary]}
        onPress={() => navigation.navigate('AddFriends')}
      >
        <Text style={[styles.addFriendsButtonText, chessStyles.buttonText]}>
          {t('friends', 'addFriends')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: chessColors.background }]}>
        <ActivityIndicator size="large" color={chessColors.primary} />
        <Text style={[styles.loadingText, { color: chessColors.text }]}>{t('friends', 'loadingFriends')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: chessColors.background }]}>
      {/* Header */}
      <View style={[styles.header, chessStyles.card]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={chessColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: chessColors.text }]}>{t('friends', 'title')}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('FriendRequests')}
            style={styles.headerButton}
          >
            <Ionicons name="person-add" size={24} color={chessColors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('AddFriends')}
            style={styles.headerButton}
          >
            <Ionicons name="search" size={24} color={chessColors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Friends Count */}
      <View style={styles.statsContainer}>
        <Text style={[styles.friendsCount, { color: chessColors.textSecondary }]}>
          {t('friends', 'friendsCount').replace('{count}', friends.length.toString())} • {t('friends', 'onlineCount').replace('{count}', friends.filter(f => f.onlineStatus === "online").length.toString())}
        </Text>
      </View>

      {/* Friends List */}
      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.email}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[chessColors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={friends.length === 0 ? styles.emptyListContainer : styles.listContainer}
      />
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
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  friendsCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyListContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  friendElo: {
    fontSize: 14,
    marginBottom: 2,
  },
  lastSeen: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  challengeButton: {
    backgroundColor: '#4CAF50',
  },
  removeButton: {
    backgroundColor: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  addFriendsButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addFriendsButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});