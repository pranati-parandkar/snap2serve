import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: String },
  role: { type: String, default: 'user' },
  favorites: { type: Array, default: [] },
  history: { type: Array, default: [] },
  preferences: { type: Object, default: { dietaryRestrictions: [], allergies: [], maxTime: 45 } },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);

const sessionSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number }, // in seconds
  createdAt: { type: Date, default: Date.now }
});

export const Session = mongoose.model('Session', sessionSchema);

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  visitorId: { type: String, required: true },
  recipeId: { type: String },
  recipeTitle: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Feedback = mongoose.model('Feedback', feedbackSchema);
