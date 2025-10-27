import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { ActivityIndicator, StatusBar, Text, View } from "react-native";
import BanNotification from "../components/BanNotification";
import { theme } from "../constants/theme";
import AdminPanel from "../screens/Admin/AdminPanel";

import { useAppState } from "../hooks/useAppState";
import { useAuth } from "../hooks/useAuth";
import { useBanStatus } from "../hooks/useBanStatus";
import AIGameBoard from "../screens/AI/AIGameBoard";
import AIOpponents from "../screens/AI/AIOpponents";
import Dashboard from "../screens/Dashboard/Dashboard";
import AddFriends from "../screens/Friends/AddFriends";
import FriendRequests from "../screens/Friends/FriendRequests";
import FriendsList from "../screens/Friends/FriendsList";
import GameRoom from "../screens/Game/GameRoom";
import HomeScreen from "../screens/Home/HomeScreen";
import History from "../screens/Profile/History";
import Profile from "../screens/Profile/Profile"; // dùng path tương đối cho chắc
import Settings from "../screens/Profile/Settings";
import PuzzlesDashboard from "../screens/Puzzles/PuzzlesDashboard";
import PuzzleSolve from "../screens/Puzzles/PuzzleSolve";
import { friendsManager } from "../services/friendsManager";
import AuthNavigation from "./AuthNavigation";

const Stack = createNativeStackNavigator();

export default function MainNavigation() {
  const { user, isSessionReady } = useAuth();
  const { banInfo, loading: banLoading, isBanned } = useBanStatus();
  useAppState(); // Initialize app state monitoring for friends

  // Debug logging for ban status
  React.useEffect(() => {
    console.log('🔍 [MainNavigation] Ban status update:', {
      isBanned,
      banInfo,
      user: user?.email || 'No user'
    });
  }, [isBanned, banInfo, user?.email]);

  // Handle user changes for Friends manager
  useEffect(() => {
    if (user && user.email && isSessionReady) {
      console.log("🔄 User logged in, reinitializing Friends manager:", user.email);
      friendsManager.reinitialize();
    } else if (!user) {
      console.log("🔄 User logged out, cleaning up Friends manager");
      friendsManager.cleanup();
    }
  }, [user?.email, isSessionReady]);

  // Show loading while Firebase auth is initializing or session is being established, or while checking ban status
  if (user === undefined || (user && !isSessionReady) || (user && banLoading)) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: theme.colors.background 
      }}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ 
          marginTop: 10, 
          ...theme.typography.body,
          color: theme.colors.textSecondary,
        }}>
          {user ? 'Establishing secure session...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.backgroundSecondary,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.accent,
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: 'normal',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System',
              fontWeight: 'bold',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '900',
            },
          },
        }}
      >
        {user ? (
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.backgroundSecondary,
              },
              headerTintColor: theme.colors.text,
              headerTitleStyle: {
                ...theme.typography.h3,
              },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: "Chess Online",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Dashboard"
              component={Dashboard}
              options={{ title: "Rooms" }}
            />
            <Stack.Screen
              name="GameRoom"
              component={GameRoom}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PuzzlesDashboard"
              component={PuzzlesDashboard}
              options={{ title: "Puzzles" }}
            />
            <Stack.Screen
              name="PuzzleSolve"
              component={PuzzleSolve}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Profile"
              component={Profile}
              options={{ title: "Player Profile" }}
            />
            <Stack.Screen
              name="History"
              component={History}
              options={{ title: "Match History" }}
            />
            <Stack.Screen
              name="Settings"
              component={Settings}
              options={{ title: "Settings" }}
            />
            <Stack.Screen
              name="AIOpponents"
              component={AIOpponents}
              options={{ title: "AI Opponents" }}
            />
            <Stack.Screen
              name="AIGameBoard"
              component={AIGameBoard}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FriendsList"
              component={FriendsList}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddFriends"
              component={AddFriends}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FriendRequests"
              component={FriendRequests}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AdminPanel"
              component={AdminPanel}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        ) : (
          <AuthNavigation />
        )}
      </NavigationContainer>
      
      {/* Ban Notification Overlay - Only show for authenticated users */}
      {user && (
        <BanNotification
          visible={isBanned && !!user}
          banInfo={banInfo}
          onClose={() => {
            console.log('🔔 Ban notification onClose called');
            console.log('🔔 Current user:', user?.email || 'No user');
            console.log('🔔 Ban status:', { isBanned, banInfo });
          }}
        />
      )}
    </View>
  );
}