import axios from "axios";

// This will be set by the ApiProvider
let currentApiUrl = "http://localhost:5000/api";

export function setApiUrl(url: string) {
  if (!url) {
    console.warn("❌ Attempted to set empty API URL");
    return;
  }
  // Validate URL format
  try {
    new URL(url); // This will throw if URL is invalid
    currentApiUrl = url;
  } catch (e) {
    console.error("❌ Invalid API URL:", url);
  }
}

export const getRooms = async () => {
  return axios.get(`${currentApiUrl}/rooms`);
};

export const getRoom = async (roomId: string) => {
  return axios.get(`${currentApiUrl}/rooms/${roomId}`);
};

export const createRoom = async (roomId: string, hostEmail: string, timeControlMinutes: number = 10) => {
  return axios.post(`${currentApiUrl}/rooms`, { roomId, hostEmail, timeControlMinutes });
};

export const joinRoom = async (roomId: string, email: string) => {
  return axios.patch(`${currentApiUrl}/rooms/${roomId}/join`, { email });
};

export const deleteRoom = async (roomId: string, email: string) => {
  return axios.delete(`${currentApiUrl}/rooms/${roomId}`, { data: { email } });
};

export const getUserByEmail = (email: string) => {
  return axios.get(`${currentApiUrl}/users/${encodeURIComponent(email)}`);
};

export const createUser = (email: string, name: string) => {
  return axios.post(`${currentApiUrl}/users`, { email, name });
};

export const updateUserName = (email: string, name: string) => {
  return axios.patch(`${currentApiUrl}/users/${encodeURIComponent(email)}`, { name });
};

// ✅ Match API endpoints
export const createMatch = (matchData: any) => {
  return axios.post(`${currentApiUrl}/matches`, matchData);
};

export const finishMatch = (matchId: string, result: any) => {
  return axios.patch(`${currentApiUrl}/matches/${matchId}/finish`, result);
};

export const addMoveToMatch = (matchId: string, move: { san: string, fen: string }) => {
  return axios.patch(`${currentApiUrl}/matches/${matchId}/move`, move);
};

export const getUserMatches = (email: string) => {
  return axios.get(`${currentApiUrl}/matches/user/${encodeURIComponent(email)}`);
};

export const getAllMatches = () => {
  return axios.get(`${currentApiUrl}/matches`);
};

// ✅ Session API endpoints
export const startSession = (email: string, deviceInfo: string) => {
  return axios.post(`${currentApiUrl}/session/start`, { email, deviceInfo });
};

export const validateSession = (email: string, sessionId: string) => {
  return axios.post(`${currentApiUrl}/session/validate`, { email, sessionId });
};

export const endSession = (email: string, sessionId: string) => {
  return axios.post(`${currentApiUrl}/session/end`, { email, sessionId });
};

// ✅ Puzzle API endpoints
export const getRandomPuzzle = (userEmail: string, difficulty?: string, theme?: string) => {
  const params = new URLSearchParams({ userEmail });
  if (difficulty) params.append('difficulty', difficulty);
  if (theme) params.append('theme', theme);
  
  return axios.get(`${currentApiUrl}/puzzles/random?${params.toString()}`);
};

export const getPuzzleById = (puzzleId: string) => {
  return axios.get(`${currentApiUrl}/puzzles/${puzzleId}`);
};

export const submitPuzzleAttempt = (attemptData: {
  userEmail: string;
  puzzleId: string;
  solved: boolean;
  timeSpent: number;
  movesPlayed: string[];
  hintsUsed?: number;
}) => {
  return axios.post(`${currentApiUrl}/puzzles/attempt`, attemptData);
};

export const getUserPuzzleStats = (userEmail: string) => {
  return axios.get(`${currentApiUrl}/puzzles/stats/${encodeURIComponent(userEmail)}`);
};

export const getPuzzleThemes = () => {
  return axios.get(`${currentApiUrl}/puzzles/meta/themes`);
};

// ✅ Friends API endpoints
export const getFriends = (userEmail: string) => {
  return axios.get(`${currentApiUrl}/friends`, { params: { userEmail } });
};

export const searchUsers = (query: string, userEmail: string, limit = 20) => {
  return axios.get(`${currentApiUrl}/friends/search`, { 
    params: { query, userEmail, limit } 
  });
};

export const sendFriendRequest = (senderEmail: string, receiverEmail: string, message?: string) => {
  return axios.post(`${currentApiUrl}/friends/request`, { senderEmail, receiverEmail, message });
};

export const getFriendRequests = (userEmail: string, type: "received" | "sent" = "received") => {
  return axios.get(`${currentApiUrl}/friends/requests`, { params: { userEmail, type } });
};

export const respondToFriendRequest = (requestId: string, action: "accept" | "decline", userEmail: string) => {
  return axios.patch(`${currentApiUrl}/friends/request/${requestId}`, { action, userEmail });
};

export const removeFriend = (userEmail: string, friendEmail: string) => {
  return axios.delete(`${currentApiUrl}/friends/${friendEmail}`, { data: { userEmail } });
};

export const cancelFriendRequest = (requestId: string, userEmail: string) => {
  return axios.delete(`${currentApiUrl}/friends/request/${requestId}`, { data: { userEmail } });
};

export const updateOnlineStatus = (userEmail: string, status: "online" | "offline" | "away" | "busy") => {
  return axios.patch(`${currentApiUrl}/friends/status`, { userEmail, status });
};

export const getOnlineFriends = (userEmail: string) => {
  return axios.get(`${currentApiUrl}/friends/online`, { params: { userEmail } });
};
