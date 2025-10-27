import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useLanguage } from "../../providers/LanguageProvider";
import { cancelFriendRequest, getFriendRequests, respondToFriendRequest } from "../../services/api";
import { auth } from "../../services/firebaseConfig";

type FriendRequest = {
  _id: string;
  senderEmail: string;
  receiverEmail: string;
  senderName: string;
  senderElo: number;
  senderOnlineStatus: "online" | "offline" | "away" | "busy";
  message?: string;
  createdAt: string;
  status: "pending" | "accepted" | "declined";
};

type TabType = "received" | "sent";

export default function FriendRequests({ navigation }: any) {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("received");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const { t } = useLanguage();
  const themedStyles = useThemedStyles();
  
  const userEmail = auth.currentUser?.email || "";

  const loadRequests = useCallback(async () => {
    try {
      console.log("🔍 Loading friend requests for:", userEmail);
      
      // Load received requests
      console.log("📥 Fetching received requests...");
      const receivedResponse = await getFriendRequests(userEmail, "received");
      const receivedData = receivedResponse.data || [];
      console.log("📥 Raw received data:", receivedData);
      
      // Load sent requests
      console.log("📤 Fetching sent requests...");
      const sentResponse = await getFriendRequests(userEmail, "sent");
      const sentData = sentResponse.data || [];
      console.log("📤 Raw sent data:", sentData);
      
      // Transform received requests
      const transformedReceived: FriendRequest[] = receivedData.map((request: any) => ({
        _id: request._id,
        senderEmail: request.senderEmail,
        receiverEmail: request.receiverEmail,
        senderName: request.senderData?.name || request.senderData?.email?.split('@')[0] || request.senderEmail,
        senderElo: request.senderData?.elo || 1200,
        senderOnlineStatus: request.senderData?.onlineStatus || "offline",
        message: request.message,
        createdAt: request.createdAt,
        status: request.status
      }));
      
      // Transform sent requests
      const transformedSent: FriendRequest[] = sentData.map((request: any) => ({
        _id: request._id,
        senderEmail: request.senderEmail,
        receiverEmail: request.receiverEmail,
        senderName: request.receiverData?.name || request.receiverData?.email?.split('@')[0] || request.receiverEmail,
        senderElo: request.receiverData?.elo || 1200,
        senderOnlineStatus: request.receiverData?.onlineStatus || "offline",
        message: request.message,
        createdAt: request.createdAt,
        status: request.status
      }));
      
      setReceivedRequests(transformedReceived);
      setSentRequests(transformedSent);
      console.log("✅ Loaded requests:", { received: transformedReceived.length, sent: transformedSent.length });
    } catch (error) {
      console.error("Error loading friend requests:", error);
      Alert.alert(t('common', 'error'), t('friends', 'errorLoadRequests'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userEmail]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const respondToRequest = async (requestId: string, action: "accept" | "decline") => {
    setRespondingTo(requestId);
    try {
      console.log(`${action}ing friend request:`, requestId);
      
      await respondToFriendRequest(requestId, action, userEmail);
      
      // Update local state
      setReceivedRequests(requests =>
        requests.filter(req => req._id !== requestId)
      );
      
      Alert.alert(
        t('common', 'success'),
        t('friends', action === 'accept' ? 'requestAccepted' : 'requestDeclined'),
        [{ text: t('common', 'ok') }]
      );
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      Alert.alert(t('common', 'error'), t('friends', 'errorRespondRequest'));
    } finally {
      setRespondingTo(null);
    }
  };

  const cancelRequest = async (requestId: string) => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this friend request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🗑️ Cancelling friend request:", requestId);
              
              await cancelFriendRequest(requestId, userEmail);
              
              setSentRequests(requests =>
                requests.filter(req => req._id !== requestId)
              );
              
              Alert.alert(t('common', 'success'), t('friends', 'requestCancelled'));
            } catch (error) {
              console.error("Error cancelling friend request:", error);
              Alert.alert(t('common', 'error'), t('friends', 'errorCancelRequest'));
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "#4CAF50";
      case "away": return "#FF9800";
      case "busy": return "#F44336";
      default: return "#9E9E9E";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderReceivedRequest = ({ item: request }: { item: FriendRequest }) => (
    <View style={[styles.requestCard, themedStyles.card]}>
      <View style={styles.requestInfo}>
        {/* Profile Picture Placeholder */}
        <View style={[styles.avatar, themedStyles.card]}>
          <Text style={[styles.avatarText, themedStyles.text]}>
            {request.senderName.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.requestDetails}>
          <View style={styles.nameRow}>
            <Text style={[styles.senderName, themedStyles.text]}>{request.senderName}</Text>
            <View style={styles.statusIndicator}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor(request.senderOnlineStatus) }
                ]} 
              />
            </View>
          </View>
          
          <Text style={[styles.senderEmail, themedStyles.textSecondary]}>
            {request.senderEmail}
          </Text>
          
          <Text style={[styles.senderElo, themedStyles.textSecondary]}>
            Rating: {request.senderElo}
          </Text>
          
          {request.message && (
            <Text style={[styles.requestMessage, themedStyles.text]}>
              "{request.message}"
            </Text>
          )}
          
          <Text style={[styles.requestTime, themedStyles.textSecondary]}>
            {formatTimeAgo(request.createdAt)}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => respondToRequest(request._id, "accept")}
          disabled={respondingTo === request._id}
        >
          {respondingTo === request._id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark" size={18} color="#fff" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => respondToRequest(request._id, "decline")}
          disabled={respondingTo === request._id}
        >
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentRequest = ({ item: request }: { item: FriendRequest }) => (
    <View style={[styles.requestCard, themedStyles.card]}>
      <View style={styles.requestInfo}>
        {/* Profile Picture Placeholder */}
        <View style={[styles.avatar, themedStyles.card]}>
          <Text style={[styles.avatarText, themedStyles.text]}>
            {request.senderName.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.requestDetails}>
          <Text style={[styles.senderName, themedStyles.text]}>{request.senderName}</Text>
          <Text style={[styles.senderEmail, themedStyles.textSecondary]}>
            {request.receiverEmail}
          </Text>
          
          {request.message && (
            <Text style={[styles.requestMessage, themedStyles.text]}>
              Your message: "{request.message}"
            </Text>
          )}
          
          <Text style={[styles.requestTime, themedStyles.textSecondary]}>
            Sent {formatTimeAgo(request.createdAt)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.cancelButton]}
        onPress={() => cancelRequest(request._id)}
      >
        <Ionicons name="close-circle" size={24} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => {
    const isReceived = activeTab === "received";
    return (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name={isReceived ? "mail-outline" : "paper-plane-outline"} 
          size={80} 
          color={themedStyles.textSecondary.color} 
        />
        <Text style={[styles.emptyTitle, themedStyles.text]}>
          {isReceived ? "No Friend Requests" : "No Sent Requests"}
        </Text>
        <Text style={[styles.emptyMessage, themedStyles.textSecondary]}>
          {isReceived 
            ? "You don't have any pending friend requests."
            : "You haven't sent any friend requests yet."
          }
        </Text>
      </View>
    );
  };

  const currentRequests = activeTab === "received" ? receivedRequests : sentRequests;
  const renderItem = activeTab === "received" ? renderReceivedRequest : renderSentRequest;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, themedStyles.container]}>
        <ActivityIndicator size="large" color={themedStyles.button.backgroundColor} />
        <Text style={[styles.loadingText, themedStyles.text]}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, themedStyles.container]}>
      {/* Header */}
      <View style={[styles.header, themedStyles.card]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={themedStyles.text.color} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, themedStyles.text]}>Friend Requests</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab,
            activeTab === "received" && [styles.activeTab, themedStyles.button]
          ]}
          onPress={() => setActiveTab("received")}
        >
          <Text style={[
            styles.tabText,
            activeTab === "received" ? themedStyles.buttonText : themedStyles.text
          ]}>
            Received ({receivedRequests.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab,
            activeTab === "sent" && [styles.activeTab, themedStyles.button]
          ]}
          onPress={() => setActiveTab("sent")}
        >
          <Text style={[
            styles.tabText,
            activeTab === "sent" ? themedStyles.buttonText : themedStyles.text
          ]}>
            Sent ({sentRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Requests List */}
      <FlatList
        data={currentRequests}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themedStyles.button.backgroundColor]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={currentRequests.length === 0 ? styles.emptyListContainer : styles.listContainer}
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 32, // Balance the back button
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTab: {
    // Styling applied via themedStyles.button
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyListContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  requestCard: {
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
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  requestDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusIndicator: {
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  senderEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  senderElo: {
    fontSize: 14,
    marginBottom: 8,
  },
  requestMessage: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 20,
  },
  requestTime: {
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
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#F44336',
  },
  cancelButton: {
    padding: 8,
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
    lineHeight: 24,
  },
});