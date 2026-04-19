import express from "express";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { User, Session, Feedback } from "./models/Models";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const apiRouter = express.Router();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
console.log("Starting server with MONGODB_URI:", MONGODB_URI ? "Defined" : "Undefined");
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => {
      console.error("MongoDB connection error:", err.message);
    });
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working directly on app" });
});

// Database Connection Check Middleware
const checkDbConnection = (req: any, res: any, next: any) => {
  if (mongoose.connection.readyState !== 1) {
    console.log(`❌ DB not connected for ${req.method} ${req.url}`);
    return res.status(503).json({ 
      message: "Database not connected. Please check your MONGODB_URI in the Settings menu.",
      tip: "If you haven't set up MongoDB yet, you'll need a MongoDB Atlas URI or similar."
    });
  }
  next();
};

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

apiRouter.get("/health-check", (req, res) => {
  res.json({ status: "ok", message: "API is alive!" });
});

// Signup
apiRouter.post("/auth/signup", checkDbConnection, async (req, res) => {
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
    res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    
    const userResponse: any = user.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user: " + error.message });
  }
});

// Login
apiRouter.post("/auth/login", checkDbConnection, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });

    const userResponse: any = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in: " + error.message });
  }
});

// Logout
apiRouter.post("/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// Get Me
apiRouter.get("/auth/me", checkDbConnection, authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Update User Data (Favorites/History/Preferences)
apiRouter.put("/user/data", checkDbConnection, authenticateToken, async (req: any, res) => {
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

// Feedback
apiRouter.post("/feedback", checkDbConnection, async (req, res) => {
  try {
    const { rating, userId, visitorId, comment, recipeId, recipeTitle } = req.body;
    console.log(`[FEEDBACK] Received: rating=${rating}, userId=${userId}, recipe=${recipeTitle}`);
    
    const feedback = new Feedback({
      rating,
      comment,
      recipeId,
      recipeTitle,
      userId: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null,
      visitorId
    });
    
    await feedback.save();
    console.log(`[FEEDBACK] Saved successfully: ${feedback._id}`);
    res.status(201).json({ message: "Feedback saved successfully", id: feedback._id });
  } catch (error: any) {
    console.error("[FEEDBACK] Error saving feedback:", error);
    res.status(500).json({ message: "Error saving feedback: " + error.message });
  }
});

// --- Analytics Routes ---

// Start Session
apiRouter.post("/analytics/session/start", checkDbConnection, async (req, res) => {
  try {
    const { visitorId, userId } = req.body;
    
    // If we have a userId, try to find an active session for this user and end it
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      await Session.updateMany(
        { userId, endTime: { $exists: false } },
        { $set: { endTime: new Date(), duration: 0 } }
      );
    }

    const sessionData: any = { visitorId };
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      sessionData.userId = userId;
    }
    const session = new Session(sessionData);
    await session.save();
    res.status(201).json({ sessionId: session._id });
  } catch (error: any) {
    console.error("Session start error:", error);
    res.status(500).json({ message: "Error starting session: " + error.message });
  }
});

// Heartbeat to keep session alive and track duration
apiRouter.post("/analytics/session/heartbeat", async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    const session = await Session.findById(sessionId);
    if (session) {
      const now = new Date();
      const duration = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
      session.endTime = now;
      session.duration = duration;
      
      // Update userId if provided and not already set
      if (userId && !session.userId && mongoose.Types.ObjectId.isValid(userId)) {
        session.userId = userId;
      }
      
      await session.save();
      res.json({ message: "Heartbeat received", duration });
    } else {
      res.status(404).json({ message: "Session not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating heartbeat" });
  }
});

// End Session
apiRouter.post("/analytics/session/end", async (req, res) => {
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
apiRouter.get("/analytics", authenticateToken, isAdmin, async (req, res) => {
  try {
    const sessions: any[] = await Session.find();
    
    const totalVisits = sessions.length;
    
    // Unique Visitors: Count unique UserIDs, and unique VisitorIDs that don't have a UserID
    const userIds = new Set(sessions.filter(s => s.userId).map(s => s.userId.toString()));
    const visitorIdsWithoutUser = new Set(sessions.filter(s => !s.userId).map(s => s.visitorId));
    const uniqueVisitors = userIds.size + visitorIdsWithoutUser.size;

    const sessionsWithDuration = sessions.filter(s => s.duration !== undefined && s.duration > 0);
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

    const recentFeedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'username email');

    res.json({
      totalVisitors: uniqueVisitors,
      totalVisits: totalVisits,
      avgTimeSpent: avgDuration,
      visitsPerDay,
      recentFeedback
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics" });
  }
});

// Catch-all for unhandled API routes
apiRouter.all("*", (req, res) => {
  console.log(`[API DEBUG] Unhandled API request: ${req.method} ${req.url}`);
  console.log(`[API DEBUG] Full path: ${req.baseUrl}${req.url}`);
  res.status(404).json({ 
    message: `API route not found: ${req.method} ${req.url}`,
    baseUrl: req.baseUrl,
    path: req.url
  });
});

app.use("/api", apiRouter);

async function startServer() {
  // Vite Middleware for Development
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
  console.error("💥 Failed to start server:", err);
});
