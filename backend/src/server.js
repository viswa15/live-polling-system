// src/server.js
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import connectDB from './config/db.js';
import configurePassport from './config/passport.js';
import authRoutes from './routes/auth.js';
import { initSocket } from './socket.js';

dotenv.config();
connectDB();
configurePassport(passport);

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session Middleware (must come BEFORE Passport)
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
});
app.use(sessionMiddleware);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Initialize Socket.IO and pass it the session middleware
initSocket(server, sessionMiddleware);

// Routes
app.get('/', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));