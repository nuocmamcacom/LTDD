// backend/src/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  if (req.url !== '/health') { // Don't log health check requests
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

// ✅ CORS
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
  /^http:\/\/10\.0\.2\.2:\d+$/
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const ok =
    !origin ||
    allowedOrigins.some((o) =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );

  if (ok) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    return next();
  }
  console.warn("❌ CORS blocked:", origin);
  return res.status(403).json({ error: "CORS blocked" });
});

app.use(express.json());

// Health check endpoint for auto-detection
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    server: "chess-online-backend",
    version: "1.0.0",
    ip: req.ip
  });
});

// ✅ Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/puzzles", require("./routes/puzzleRoutes"));
app.use("/api/friends", require("./routes/friendRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api", require("./routes/sessionRoutes"));

// ✅ Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/, /^http:\/\/192\.168\.\d+\.\d+$/],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinRoom", ({ roomId, email }) => {
    socket.join(roomId);
    socket.to(roomId).emit("system", { type: "join", email });
  });

  socket.on("leaveRoom", ({ roomId, email }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("system", { type: "leave", email });
  });

  socket.on("move", ({ roomId, san, fen, email }) => {
    socket.to(roomId).emit("move", { san, fen, email, at: Date.now() });
  });

  socket.on("roomDeleted", ({ roomId, deletedBy }) => {
    socket.to(roomId).emit("roomDeleted", { roomId, deletedBy });
  });

  // Player ready handler
  socket.on("playerReady", ({ roomId, email }) => {
    console.log(`✅ Player ${email} is ready in room ${roomId}`);
    // Broadcast to all players in the room (including sender)
    io.to(roomId).emit("playerReady", { email, roomId, timestamp: Date.now() });
  });

  // Test message handler
  socket.on("test_message", (data) => {
    socket.to(data.roomId).emit("test_response", { from: "server", to: data.from, message: "Test received!" });
  });

  // Friends & Social events
  socket.on("join_user_room", (userEmail) => {
    socket.join(`user_${userEmail}`);
    // Update user online status
    socket.userEmail = userEmail;
  });

  socket.on("update_online_status", async ({ userEmail, status }) => {
    try {
      // Update user status in database
      const User = require("./models/User");
      await User.findOneAndUpdate(
        { email: userEmail },
        { 
          onlineStatus: status,
          lastSeen: new Date()
        }
      );
      
      // Notify friends about status change
      const Friendship = require("./models/Friendship");
      const friends = await Friendship.getUserFriends(userEmail);
      
      friends.forEach(friend => {
        socket.to(`user_${friend.email}`).emit("friend_online_status_update", {
          friendEmail: userEmail,
          status: status,
          lastSeen: new Date()
        });
      });
      
    } catch (error) {
      console.error("❌ [ERROR UPDATE STATUS]", error);
    }
  });

  socket.on("disconnect", (reason) => {
    // Update user to offline status
    if (socket.userEmail) {
      const User = require("./models/User");
      User.findOneAndUpdate(
        { email: socket.userEmail },
        { 
          onlineStatus: "offline",
          lastSeen: new Date()
        }
      ).catch(err => console.error("Error updating offline status:", err));
    }
  });
});

// ✅ Server listen
const PORT = process.env.PORT || 5000;
server.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running on http://0.0.0.0:5000");
});
