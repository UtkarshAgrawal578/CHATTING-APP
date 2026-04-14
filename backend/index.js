const express = require("express");
require("dotenv").config();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Message = require("./models/Message");

// Routes
const authRoutes = require("./routes/authRoutes");


const app = express();
connectDB();

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

// ✅ Use Routes
app.use("/api/auth", authRoutes);


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// Socket logic
// 🔥 Store online users
let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ============================
  // ✅ REGISTER USER (ONLINE USERS)
  // ============================
  socket.on("register_user", (username) => {
    onlineUsers[username] = socket.id;

    console.log("Online Users:", onlineUsers);

    // Send updated user list to all clients
    io.emit("online_users", Object.keys(onlineUsers));
  });

  // ============================
  // ✅ JOIN PRIVATE ROOM
  // ============================
  socket.on("join_private_chat", ({ user1, user2 }) => {
    const roomId = [user1, user2].sort().join("_");

    socket.join(roomId);
    console.log(`${user1} joined room: ${roomId}`);
  });

  // ============================
  // ✅ LOAD PRIVATE MESSAGES
  // ============================
  socket.on("load_private_messages", async ({ user1, user2 }) => {
    try {
      const messages = await Message.find({
        $or: [
          { user: user1, receiver: user2 },
          { user: user2, receiver: user1 },
        ],
      }).sort({ time: 1 });

      socket.emit("private_messages", messages);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  });

  // ============================
  // ✅ SEND PRIVATE MESSAGE
  // ============================
  socket.on("send_private_message", async (data) => {
    try {
      const { user1, user2, text } = data;

      const roomId = [user1, user2].sort().join("_");

      console.log(`Message from ${user1} to ${user2} in ${roomId}`);

      const message = new Message({
        user: user1,
        receiver: user2,
        text,
        time: new Date(),
      });

      await message.save();

      // Send to both users in room
      io.to(roomId).emit("receive_private_message", message);

    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  // ============================
  // ❌ DISCONNECT
  // ============================
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove user from online list
    for (let user in onlineUsers) {
      if (onlineUsers[user] === socket.id) {
        delete onlineUsers[user];
        break;
      }
    }

    // Update all clients
    io.emit("online_users", Object.keys(onlineUsers));
  });
});
// Start server
server.listen(5000, () => {
  console.log("Server running on port 5000");
});