import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useLanguage } from "../../providers/LanguageProvider";
import { searchUsers as searchUsersAPI, sendFriendRequest } from "../../services/api";
import { auth } from "../../services/firebaseConfig";

type User = {
  email: string;
  name: string;
  elo: number;
  onlineStatus: "online" | "offline" | "away" | "busy";
  lastSeen: string;
  profilePicture?: string;
  relationshipStatus: "friends" | "pending" | "none";
};

export default function AddFriends({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLanguage();
  const themedStyles = useThemedStyles();
  
  const userEmail = auth.currentUser?.email || "";

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      searchUsers(query);
    }, 500); // 500ms delay
    
    setDebounceTimeout(timeout);
  };

  const searchUsers = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      console.log("🔍 Searching users:", query);
      
      const response = await searchUsersAPI(query, userEmail, 20);
      const usersData = response.data || [];
      
      console.log("🔍 Raw search response:", usersData);
      
      // Transform API data to match our User type
      const transformedUsers: User[] = usersData.map((user: any) => ({
        email: user.email,
        name: user.name || user.email.split('@')[0],
        elo: user.elo || 1200,
        onlineStatus: user.onlineStatus || "offline",
        lastSeen: user.lastSeen || new Date().toISOString(),
        profilePicture: user.profilePicture,
        relationshipStatus: user.relationshipStatus || "none"
      }));
      
      setSearchResults(transformedUsers);
      console.log("✅ Search results:", transformedUsers.length);
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert(t('common', 'error'), t('friends', 'errorSearchUsers'));
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequestToUser = async (user: User) => {
    try {
      console.log("📤 Sending friend request to:", user.email);
      
      const response = await sendFriendRequest(userEmail, user.email, `Hi ${user.name}! Let's be chess friends!`);
      console.log("📤 Friend request response:", response);
      
      Alert.alert(
        t('friends', 'requestSent'),
        t('friends', 'requestSentMessage').replace('{name}', user.name),
        [{ text: t('common', 'ok') }]
      );
      
      // Update the user's relationship status in search results
      setSearchResults(results =>
        results.map(result =>
          result.email === user.email
            ? { ...result, relationshipStatus: "pending" as const }
            : result
        )
      );
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert(t('common', 'error'), t('friends', 'errorSendRequest'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "#4CAF50";
      case "away": return "#FF9800";
      case "busy": return "#F44336";
      default: return "#9E9E9E";
    }
  };

  const getRelationshipButtonConfig = (status: string) => {
    switch (status) {
      case "friends":
        return {
          text: "Friends",
          icon: "checkmark-circle",
          color: "#4CAF50",
          disabled: true
        };
      case "pending":
        return {
          text: "Pending",
          icon: "time",
          color: "#FF9800",
          disabled: true
        };
      default:
        return {
          text: "Add Friend",
          icon: "person-add",
          color: "#2196F3",
          disabled: false
        };
    }
  };

  const renderUserItem = ({ item: user }: { item: User }) => {
    const buttonConfig = getRelationshipButtonConfig(user.relationshipStatus);
    
    return (
      <View style={[styles.userCard, themedStyles.card]}>
        <View style={styles.userInfo}>
          {/* Profile Picture Placeholder */}
          <View style={[styles.avatar, themedStyles.card]}>
            <Text style={[styles.avatarText, themedStyles.text]}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, themedStyles.text]}>{user.name}</Text>
              <View style={styles.statusIndicator}>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: getStatusColor(user.onlineStatus) }
                  ]} 
                />
              </View>
            </View>
            
            <Text style={[styles.userEmail, themedStyles.textSecondary]}>
              {user.email}
            </Text>
            
            <Text style={[styles.userElo, themedStyles.textSecondary]}>
              Rating: {user.elo}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.relationshipButton,
            { backgroundColor: buttonConfig.color },
            buttonConfig.disabled && styles.disabledButton
          ]}
          onPress={() => !buttonConfig.disabled && sendFriendRequestToUser(user)}
          disabled={buttonConfig.disabled}
        >
          <Ionicons name={buttonConfig.icon as any} size={16} color="#fff" />
          <Text style={styles.relationshipButtonText}>{buttonConfig.text}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (searchQuery.trim().length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={80} color={themedStyles.textSecondary.color} />
          <Text style={[styles.emptyTitle, themedStyles.text]}>Find Chess Players</Text>
          <Text style={[styles.emptyMessage, themedStyles.textSecondary]}>
            Search by email or name to find other players and add them as friends!
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0 && !searching) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={80} color={themedStyles.textSecondary.color} />
          <Text style={[styles.emptyTitle, themedStyles.text]}>No Results</Text>
          <Text style={[styles.emptyMessage, themedStyles.textSecondary]}>
            No users found matching "{searchQuery}". Try a different search term.
          </Text>
        </View>
      );
    }

    return null;
  };

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
        <Text style={[styles.headerTitle, themedStyles.text]}>Add Friends</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, themedStyles.input, themedStyles.border]}>
          <Ionicons name="search" size={20} color={themedStyles.textSecondary.color} />
          <TextInput
            style={[styles.searchInput, themedStyles.text]}
            placeholder="Search by email or name..."
            placeholderTextColor={themedStyles.textSecondary.color}
            value={searchQuery}
            onChangeText={handleSearchQueryChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={themedStyles.textSecondary.color} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      <FlatList
        data={searchResults}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.email}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  userCard: {
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
  userInfo: {
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
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
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
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userElo: {
    fontSize: 14,
  },
  relationshipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  relationshipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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