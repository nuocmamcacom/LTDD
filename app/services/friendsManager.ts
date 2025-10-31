import { Alert } from "react-native";
import { getFriends, updateOnlineStatus } from "./api";
import { auth } from "./firebaseConfig";
import { getSocket, joinUserRoom, subscribeToFriendUpdates, unsubscribeFromFriendUpdates, updateUserOnlineStatus } from "./socket";

type OnlineStatus = "online" | "offline" | "away" | "busy";

type FriendUpdate = {
  type: "status_update" | "friend_request" | "request_accepted";
  friendEmail?: string;
  status?: OnlineStatus;
  requestId?: string;
  senderName?: string;
};

class FriendsManager {
  private socket: any = null;
  private userEmail: string = "";
  private isConnected: boolean = false;
  private friendUpdateCallbacks: ((update: FriendUpdate) => void)[] = [];

  // Initialize friends manager
  initialize() {
    this.userEmail = auth.currentUser?.email || "";
    if (!this.userEmail) {
      console.warn("⚠️ No user email found, Friends manager not initialized");
      return;
    }

    // If already connected to a different user, cleanup first
    if (this.isConnected && this.userEmail !== auth.currentUser?.email) {
      this.cleanup();
    }

    this.socket = getSocket();
    if (this.socket) {
      this.connectSocket();
    }
  }

  // Reinitialize for new user login
  reinitialize() {
    this.cleanup();
    this.initialize();
  }

  // Connect to socket and set up event listeners
  private connectSocket() {
    if (!this.socket || this.isConnected) return;

    this.socket.connect();
    
    this.socket.on("connect", () => {
      this.isConnected = true;
      
      // Join user's personal room for notifications
      joinUserRoom(this.userEmail);
      
      // Set initial online status
      this.updateOnlineStatus("online");
      
      // Subscribe to friend updates
      subscribeToFriendUpdates(this.userEmail, this.handleFriendUpdate);
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error: any) => {
      console.error("❌ Friends socket connection error:", error);
    });
  }

  // Handle incoming friend updates
  private handleFriendUpdate = (data: any) => {
    let update: FriendUpdate;
    
    if (data.friendEmail && data.status) {
      // Friend online status update
      update = {
        type: "status_update",
        friendEmail: data.friendEmail,
        status: data.status
      };
    } else if (data.senderEmail && data.requestId) {
      // Friend request received
      update = {
        type: "friend_request",
        friendEmail: data.senderEmail,
        requestId: data.requestId,
        senderName: data.senderName
      };
      
      // Show notification
      Alert.alert(
        "New Friend Request",
        `${data.senderName || data.senderEmail} sent you a friend request!`,
        [
          { text: "Later", style: "cancel" },
          { text: "View", onPress: () => this.notifyFriendRequestReceived(data) }
        ]
      );
    } else if (data.type === "request_accepted") {
      // Friend request accepted
      update = {
        type: "request_accepted",
        friendEmail: data.friendEmail,
        senderName: data.friendName
      };
      
      Alert.alert(
        "Friend Request Accepted!",
        `${data.friendName || data.friendEmail} accepted your friend request!`,
        [{ text: "Great!" }]
      );
    } else {
      console.warn("⚠️ Unknown friend update type:", data);
      return;
    }

    // Notify all subscribers
    this.friendUpdateCallbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error("Error in friend update callback:", error);
      }
    });
  };

  // Update user's online status
  updateOnlineStatus(status: OnlineStatus) {
    if (!this.userEmail) return;
    
    // Update via Socket.IO for real-time
    if (this.isConnected) {
      updateUserOnlineStatus(this.userEmail, status);
    }
    
    // Also update via API for persistence
    updateOnlineStatus(this.userEmail, status).catch(error => {
      console.error("Error updating online status:", error);
    });
  }

  // Subscribe to friend updates
  subscribeToUpdates(callback: (update: FriendUpdate) => void) {
    this.friendUpdateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.friendUpdateCallbacks = this.friendUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  // Get friends list with fresh data
  async getFriendsList() {
    if (!this.userEmail) return [];
    
    try {
      const response = await getFriends(this.userEmail);
      return response.data || [];
    } catch (error) {
      console.error("Error loading friends:", error);
      throw error;
    }
  }

  // Handle app state changes
  handleAppStateChange(nextAppState: string) {
    if (!this.userEmail) return;

    if (nextAppState === "active") {
      // App became active
      this.updateOnlineStatus("online");
      if (!this.isConnected && this.socket) {
        this.connectSocket();
      }
    } else if (nextAppState === "background") {
      // App went to background
      this.updateOnlineStatus("away");
    } else if (nextAppState === "inactive") {
      // App became inactive
      this.updateOnlineStatus("away");
    }
  }

  // Disconnect socket and cleanup connections
  disconnect() {
    if (this.socket && this.isConnected) {
      unsubscribeFromFriendUpdates(this.handleFriendUpdate);
      this.socket.disconnect();
    }
    
    this.isConnected = false;
  }

  // Clean up when user logs out
  cleanup() {
    if (this.userEmail) {
      this.updateOnlineStatus("offline");
    }
    
    this.disconnect();
    
    this.userEmail = "";
    this.friendUpdateCallbacks = [];
  }

  // Helper to notify about friend request navigation
  private notifyFriendRequestReceived(data: any) {
    // This could trigger navigation to FriendRequests screen
  }

  // Get connection status
  get connectionStatus() {
    return {
      isConnected: this.isConnected,
      userEmail: this.userEmail,
      hasSocket: !!this.socket
    };
  }
}

// Export singleton instance
export const friendsManager = new FriendsManager();