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
    console.log("➡️ Setting API URL:", url);
    currentApiUrl = url;
  } catch (e) {
    console.error("❌ Invalid API URL:", url);
  }
}

export const getRooms = async () => {
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/rooms`);
  return axios.get(`${currentApiUrl}/rooms`);
};

export const getRoom = async (roomId: string) => {
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/rooms/${roomId}`);
  return axios.get(`${currentApiUrl}/rooms/${roomId}`);
};

export const createRoom = async (roomId: string, hostEmail: string, timeControlMinutes: number = 10) => {
  console.log("➡️ AXIOS: POST", `${currentApiUrl}/rooms`, { roomId, hostEmail, timeControlMinutes });
  return axios.post(`${currentApiUrl}/rooms`, { roomId, hostEmail, timeControlMinutes });
};

export const joinRoom = async (roomId: string, email: string) => {
  console.log("➡️ AXIOS: PATCH", `${currentApiUrl}/rooms/${roomId}/join`, { email });
  return axios.patch(`${currentApiUrl}/rooms/${roomId}/join`, { email });
};

export const deleteRoom = async (roomId: string, email: string) => {
  console.log("➡️ AXIOS: DELETE", `${currentApiUrl}/rooms/${roomId}`, { email });
  return axios.delete(`${currentApiUrl}/rooms/${roomId}`, { data: { email } });
};

export const getUserByEmail = (email: string) => {
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/users/${email}`);
  return axios.get(`${currentApiUrl}/users/${encodeURIComponent(email)}`);
};

export const createUser = (email: string, name: string) => {
  console.log("➡️ AXIOS: POST", `${currentApiUrl}/users`, { email, name });
  return axios.post(`${currentApiUrl}/users`, { email, name });
};

export const updateUserName = (email: string, name: string) => {
  console.log("➡️ AXIOS: PATCH", `${currentApiUrl}/users/${email}`, { name });
  return axios.patch(`${currentApiUrl}/users/${encodeURIComponent(email)}`, { name });
};

// ✅ Match API endpoints
export const createMatch = (matchData: any) => {
  console.log("➡️ AXIOS: POST", `${currentApiUrl}/matches`, matchData);
  return axios.post(`${currentApiUrl}/matches`, matchData);
};

export const finishMatch = (matchId: string, result: any) => {
  console.log("➡️ AXIOS: PATCH", `${currentApiUrl}/matches/${matchId}/finish`, result);
  return axios.patch(`${currentApiUrl}/matches/${matchId}/finish`, result);
};

export const addMoveToMatch = (matchId: string, move: { san: string, fen: string }) => {
  console.log("➡️ AXIOS: PATCH", `${currentApiUrl}/matches/${matchId}/move`, move);
  return axios.patch(`${currentApiUrl}/matches/${matchId}/move`, move);
};

export const getUserMatches = (email: string) => {
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/matches/user/${email}`);
  return axios.get(`${currentApiUrl}/matches/user/${encodeURIComponent(email)}`);
};

export const getAllMatches = () => {
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/matches`);
  return axios.get(`${currentApiUrl}/matches`);
};

// ✅ Session API endpoints
export const startSession = (email: string, deviceInfo: string) => {
  console.log("➡️ AXIOS: POST", `${currentApiUrl}/session/start`, { email, deviceInfo });
  return axios.post(`${currentApiUrl}/session/start`, { email, deviceInfo });
};

export const validateSession = (email: string, sessionId: string) => {
  console.log("➡️ AXIOS: POST", `${currentApiUrl}/session/validate`, { email, sessionId });
  return axios.post(`${currentApiUrl}/session/validate`, { email, sessionId });
};

export const endSession = (email: string, sessionId: string) => {
  console.log("➡️ AXIOS: POST", `${currentApiUrl}/session/end`, { email, sessionId });
  return axios.post(`${currentApiUrl}/session/end`, { email, sessionId });
};

// ✅ Puzzle API endpoints
export const getRandomPuzzle = (userEmail: string, difficulty?: string, theme?: string) => {
  const params = new URLSearchParams({ userEmail });
  if (difficulty) params.append('difficulty', difficulty);
  if (theme) params.append('theme', theme);
  
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/puzzles/random?${params.toString()}`);
  return axios.get(`${currentApiUrl}/puzzles/random?${params.toString()}`);
};

export const getPuzzleById = (puzzleId: string) => {
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/puzzles/${puzzleId}`);
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
  console.log("➡️ AXIOS: POST", `${currentApiUrl}/puzzles/attempt`, attemptData);
  return axios.post(`${currentApiUrl}/puzzles/attempt`, attemptData);
};

export const getUserPuzzleStats = (userEmail: string) => {
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/puzzles/stats/${userEmail}`);
  return axios.get(`${currentApiUrl}/puzzles/stats/${encodeURIComponent(userEmail)}`);
};

export const getPuzzleThemes = () => {
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/puzzles/meta/themes`);
  return axios.get(`${currentApiUrl}/puzzles/meta/themes`);
};

// ✅ Friends API endpoints
export const getFriends = (userEmail: string) => {
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/friends`, { userEmail });
  return axios.get(`${currentApiUrl}/friends`, { params: { userEmail } });
};

export const searchUsers = (query: string, userEmail: string, limit = 20) => {
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/friends/search`, { query, userEmail, limit });
  return axios.get(`${currentApiUrl}/friends/search`, { 
    params: { query, userEmail, limit } 
  });
};

export const sendFriendRequest = (senderEmail: string, receiverEmail: string, message?: string) => {
  console.log("➡️ AXIOS: POST", `${currentApiUrl}/friends/request`, { senderEmail, receiverEmail, message });
  return axios.post(`${currentApiUrl}/friends/request`, { senderEmail, receiverEmail, message });
};

export const getFriendRequests = (userEmail: string, type: "received" | "sent" = "received") => {
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/friends/requests`, { userEmail, type });
  return axios.get(`${currentApiUrl}/friends/requests`, { params: { userEmail, type } });
};

export const respondToFriendRequest = (requestId: string, action: "accept" | "decline", userEmail: string) => {
  console.log("➡️ AXIOS: PATCH", `${currentApiUrl}/friends/request/${requestId}`, { action, userEmail });
  return axios.patch(`${currentApiUrl}/friends/request/${requestId}`, { action, userEmail });
};

export const removeFriend = (userEmail: string, friendEmail: string) => {
  console.log("➡️ AXIOS: DELETE", `${currentApiUrl}/friends/${friendEmail}`, { userEmail });
  return axios.delete(`${currentApiUrl}/friends/${friendEmail}`, { data: { userEmail } });
};

export const cancelFriendRequest = (requestId: string, userEmail: string) => {
  console.log("➡️ AXIOS: DELETE", `${currentApiUrl}/friends/request/${requestId}`, { userEmail });
  return axios.delete(`${currentApiUrl}/friends/request/${requestId}`, { data: { userEmail } });
};

export const updateOnlineStatus = (userEmail: string, status: "online" | "offline" | "away" | "busy") => {
  console.log("➡️ AXIOS: PATCH", `${currentApiUrl}/friends/status`, { userEmail, status });
  return axios.patch(`${currentApiUrl}/friends/status`, { userEmail, status });
};

export const getOnlineFriends = (userEmail: string) => {
  console.log("➡️ AXIOS: GET", `${currentApiUrl}/friends/online`, { userEmail });
  return axios.get(`${currentApiUrl}/friends/online`, { params: { userEmail } });
};
