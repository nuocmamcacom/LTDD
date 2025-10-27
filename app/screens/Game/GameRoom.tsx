import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useChessColors, useChessStyles, useChessTheme } from "../../../constants/ChessThemeProvider";
import { useLanguage } from "../../providers/LanguageProvider";
import { createMatch, finishMatch, getRoom } from "../../services/api";
import { auth } from "../../services/firebaseConfig";
import { getSocket } from "../../services/socket";
import GameBoard from "./GameBoard";

export default function GameRoom({ route, navigation }: any) {
  const { roomId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);
  const [remoteFen, setRemoteFen] = useState<string | null>(null);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [myReadyStatus, setMyReadyStatus] = useState(false);
  const [playersReady, setPlayersReady] = useState<string[]>([]);

  const me = auth.currentUser?.email || "guest@example.com";
  const { t } = useLanguage();
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();

  const handleEnterGame = () => {
    if (room && !myReadyStatus) {
      // Mark myself as ready
      setMyReadyStatus(true);
      const s = getSocket();
      s.emit("playerReady", { roomId, email: me });
      
      if (room.members.length >= 2) {
        Alert.alert("Ready to Play", "Waiting for opponent to join...");
      } else {
        Alert.alert("Ready to Play", "Waiting for another player to join the room...");
      }
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: chessColors.background,
      padding: chessTheme.spacing.md,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: chessColors.background,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: chessTheme.spacing.sm,
    },
    link: {
      ...chessStyles.textLink,
      fontWeight: "700",
    },
    title: {
      ...chessStyles.textTitle,
      fontSize: 18,
      fontWeight: '600',
    },
    sub: {
      ...chessStyles.textSecondary,
      textAlign: "center",
      marginBottom: chessTheme.spacing.sm,
    },
    enterButton: {
      ...chessStyles.buttonPrimary,
      backgroundColor: chessColors.success,
      marginVertical: chessTheme.spacing.md,
      paddingVertical: chessTheme.spacing.md,
      alignItems: 'center',
    },
    enterButtonText: {
      ...chessStyles.buttonText,
      fontSize: 18,
      fontWeight: '600',
    },
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await getRoom(roomId);
        setRoom(res.data);
        
        // Create match when room has 2 players
        if (res.data.members.length === 2 && !currentMatch) {
          await createGameMatch(res.data);
        }
      } catch (e: any) {
        console.error("❌ Failed to load room:", e?.response?.data);
        Alert.alert(t('game', 'error'), e?.response?.data?.error || t('game', 'couldNotLoadRoom'));
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  // Create match record
  const createGameMatch = async (roomData: any) => {
    try {
      const [whitePlayer, blackPlayer] = roomData.members;
      const matchData = {
        roomId: roomData.roomId,
        whitePlayer,
        blackPlayer,
        moves: [],
      };
      
      const response = await createMatch(matchData);
      setCurrentMatch(response.data);
      setGameStartTime(Date.now());
    } catch (error) {
      console.error("❌ Failed to create match:", error);
    }
  };

  useEffect(() => {
    const s = getSocket();
    console.log("🔌 Setting up socket for room:", roomId);
    console.log("🔌 Socket instance:", s);
    console.log("🔌 Socket connected:", s.connected);
    console.log("🔌 Socket ID:", s.id);
    
    if (!s.connected) {
      console.log("🔌 Socket not connected, connecting...");
      s.connect();
    } else {
      console.log("🔌 Socket already connected, joining room immediately");
      s.emit("joinRoom", { roomId, email: me });
    }

    const onConnect = () => {
      console.log("✅ Socket connected - joining room...");
      s.emit("joinRoom", { roomId, email: me });
      console.log("🚀 Emitted joinRoom:", { roomId, email: me });
      
      // Test socket communication
      s.emit("test_message", { from: me, roomId, message: "Mobile client connected" });
      console.log("🚀 Emitted test_message");
    };
    const onSystem = (msg: any) => {
      // Handle system messages if needed
    };
    const onMove = (payload: any) => {
      console.log("♟️ Socket move received:", payload);
      console.log("🔍 My email:", me, "Move from:", payload?.email);
      
      // Apply move if it's not from current player
      if (payload?.email !== me) {
        console.log("✅ Applying remote move FEN:", payload?.fen);
        setRemoteFen(payload?.fen ?? null);
      } else {
        console.log("🚫 Ignoring own move");
      }
    };
    const onRoomDeleted = (payload: any) => {
      Alert.alert(
        t('game', 'roomDeleted'), 
        `${t('game', 'roomDeletedByHostPrefix')} ${payload.roomId} ${t('game', 'roomDeletedByHostSuffix')}`,
        [{ text: t('game', 'ok'), onPress: () => navigation.goBack() }]
      );
    };

    const onPlayerReady = (payload: any) => {
      console.log("✅ Player ready:", payload.email);
      
      setPlayersReady(prev => {
        if (!prev.includes(payload.email)) {
          const newReady = [...prev, payload.email];
          
          // Start game when both players are ready
          if (newReady.length === 2) {
            setTimeout(() => {
              setGameStarted(true);
            }, 500);
          }
          
          return newReady;
        }
        return prev;
      });
    };

    const onConnectError = (error: any) => {
      console.error("❌ Socket connection error:", error);
    };
    
    const onDisconnect = (reason: any) => {
      // Handle disconnect if needed
    };

    const onTestResponse = (data: any) => {
      // Handle test response if needed
    };

    s.on("connect", onConnect);
    s.on("connect_error", onConnectError);
    s.on("disconnect", onDisconnect);
    s.on("system", onSystem);
    s.on("move", onMove);
    s.on("roomDeleted", onRoomDeleted);
    s.on("playerReady", onPlayerReady);
    s.on("test_response", onTestResponse);

    return () => {
      s.emit("leaveRoom", { roomId, email: me });
      s.off("connect", onConnect);
      s.off("connect_error", onConnectError);
      s.off("disconnect", onDisconnect);
      s.off("system", onSystem);
      s.off("move", onMove);
      s.off("roomDeleted", onRoomDeleted);
      s.off("playerReady", onPlayerReady);
      s.off("test_response", onTestResponse);
    };
  }, [roomId, me]);

  const myColor: "w" | "b" = room && me && room.hostEmail === me ? "w" : "b";

  // Debug color assignment
  React.useEffect(() => {
    if (room && me) {
      console.log("🎮 Color Assignment Debug:", {
        myEmail: me,
        hostEmail: room.hostEmail,
        members: room.members,
        assignedColor: myColor,
        isHost: room.hostEmail === me
      });
    }
  }, [room, me, myColor]);

  // Monitor players ready status - backup trigger
  React.useEffect(() => {
    if (playersReady.length === 2 && room?.members?.length === 2 && !gameStarted) {
      setTimeout(() => {
        setGameStarted(true);
      }, 1000);
    }
  }, [playersReady, room, gameStarted]);

  if (loading) {
    return (
      <View style={dynamicStyles.center}>
        <ActivityIndicator size="large" color={chessColors.primary} />
        <Text style={{ color: chessColors.text }}>{t('game', 'loadingRoom')} {roomId}…</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={dynamicStyles.link}>← {t('game', 'goBack')}</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>{t('game', 'room')} {roomId}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Only show status info when game hasn't started */}
      {!gameStarted && (
        <>
          <Text style={dynamicStyles.sub}>
            {t('game', 'youArePlaying')}: <Text style={{ fontWeight: "700", color: chessColors.text }}>{myColor === "w" ? t('game', 'white') : t('game', 'black')}</Text>
          </Text>

          {/* Show players status */}
          {room && (
            <View style={{ marginVertical: chessTheme.spacing.sm }}>
              <Text style={[dynamicStyles.sub, { color: chessColors.textSecondary, fontSize: 14 }]}>
                Players: {room.members.length}/2
              </Text>
              {room.members.map((member: string, index: number) => (
                <Text key={member} style={[dynamicStyles.sub, { 
                  color: playersReady.includes(member) ? chessColors.success : chessColors.textSecondary,
                  fontWeight: playersReady.includes(member) ? '600' : 'normal',
                  fontSize: 14
                }]}>
                  {playersReady.includes(member) ? "✅" : "⏳"} {member} {member === me ? "(You)" : ""}
                </Text>
              ))}
              {room.members.length < 2 && (
                <Text style={[dynamicStyles.sub, { color: chessColors.warning, fontSize: 14, fontStyle: 'italic' }]}>
                  Waiting for another player to join...
                </Text>
              )}
            </View>
          )}

          {!myReadyStatus ? (
            <TouchableOpacity 
              style={dynamicStyles.enterButton} 
              onPress={handleEnterGame}
            >
              <Text style={dynamicStyles.enterButtonText}>
                🎯 Enter Room
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[dynamicStyles.sub, { color: chessColors.warning, fontWeight: '600' }]}>
              ⏳ {t('game', 'waitingForOpponent')}...
            </Text>
          )}
        </>
      )}

      {gameStarted && (
        <GameBoard
        myColor={myColor}
        remoteFen={remoteFen}
        gameTimeMinutes={room?.timeControlMinutes || 10} // ⏱️ Use room's time control
        onMove={(san, fen) => {
          const s = getSocket();
          console.log("🚀 Emitting move:", { roomId, san, fen, email: me });
          s.emit("move", { roomId, san, fen, email: me });
          // Clear remoteFen to avoid re-applying
          setRemoteFen(null);
        }}
        onGameEnd={async (result) => {
          // Save match result to database
          if (currentMatch && gameStartTime) {
            try {
              const duration = Math.floor((Date.now() - gameStartTime) / 1000);
              await finishMatch(currentMatch._id, {
                winner: result.winner,
                endReason: result.reason,
                duration,
                whiteTimeLeft: 0, // TODO: Get actual time left
                blackTimeLeft: 0, // TODO: Get actual time left
              });
            } catch (error) {
              console.error("❌ Failed to save match result:", error);
            }
          }
          
          let message = "";
          if (result.winner === "draw") {
            message = `${t('game', 'drawGame')}! (${result.reason})`;
          } else if (result.reason === "timeout") {
            message = `${result.winner === "w" ? t('game', 'white') : t('game', 'black')} ${t('game', 'wins')}! (${t('game', 'timeout')})`;
          } else {
            message = `${result.winner === "w" ? t('game', 'white') : t('game', 'black')} ${t('game', 'wins')}! (${result.reason})`;
          }
          Alert.alert(t('game', 'gameOver'), message, [
            { text: t('game', 'ok'), onPress: () => navigation.goBack() }
          ]);
        }}
      />
      )}
    </View>
  );
}


