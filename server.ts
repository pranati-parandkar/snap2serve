import express from "express";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { User, Session } from "./models/Models.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => {
      console.error("MongoDB connection error:", err.message);
      console.log("TIP: Make sure your MONGODB_URI is correct and accessible.");
    });
} else {
  console.warn("WARNING: MONGODB_URI is not defined in environment variables.");
  console.log("TIP: Add MONGODB_URI to your environment variables in the Settings menu.");
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

// Admin Middleware
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: "Admin access required" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- API Routes ---

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password, dob } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      dob,
      role: (email === 'pranati.parandkar@gmail.com' || email === 'abc@hotmail.com') ? 'admin' : 'user'
    });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    const userResponse: any = user.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userResponse: any = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// Get Me
app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Update User Data (Favorites/History/Preferences)
app.put("/api/user/data", authenticateToken, async (req: any, res) => {
  try {
    const { favorites, history, preferences } = req.body;
    const update: any = {};
    if (favorites) update.favorites = favorites;
    if (history) update.history = history;
    if (preferences) update.preferences = preferences;

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user data" });
  }
});

// --- Analytics Routes ---

// Start Session
app.post("/api/analytics/session/start", async (req, res) => {
  try {
    const { visitorId, userId } = req.body;
    const sessionData: any = { visitorId };
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      sessionData.userId = userId;
    }
    const session = new Session(sessionData);
    await session.save();
    res.status(201).json({ sessionId: session._id });
  } catch (error) {
    res.status(500).json({ message: "Error starting session" });
  }
});

// End Session
app.post("/api/analytics/session/end", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (session) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
      session.endTime = endTime;
      session.duration = duration;
      await session.save();
      res.json({ message: "Session ended", duration });
    } else {
      res.status(404).json({ message: "Session not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error ending session" });
  }
});

// Get Analytics (Admin Only)
app.get("/api/analytics", authenticateToken, isAdmin, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ startTime: -1 });
    
    const totalVisits = sessions.length;
    const uniqueVisitors = new Set(sessions.map(s => s.visitorId)).size;
    const sessionsWithDuration = sessions.filter(s => s.duration !== undefined);
    const totalDuration = sessionsWithDuration.reduce((acc, s) => acc + (s.duration || 0), 0);
    const avgDuration = sessionsWithDuration.length > 0 ? totalDuration / sessionsWithDuration.length : 0;

    const visitsByDay: Record<string, number> = {};
    sessions.forEach(s => {
      const date = new Date(s.startTime).toLocaleDateString();
      visitsByDay[date] = (visitsByDay[date] || 0) + 1;
    });
    const visitsPerDay = Object.entries(visitsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json({
      totalVisitors: uniqueVisitors,
      totalVisits: totalVisits,
      avgTimeSpent: avgDuration,
      visitsPerDay
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics" });
  }
});

// Vite Middleware for Development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
