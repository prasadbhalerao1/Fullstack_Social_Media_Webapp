import "dotenv/config";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import reelRouter from "./routes/reel.routes.js";
import storyRouter from "./routes/story.routes.js";
import messageRouter from "./routes/message.routes.js";

import connectDB from "./config/db.js";
import { initSocket } from "./socket/socket.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];

const corsInstance = cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
});

app.use(corsInstance);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/reel", reelRouter);
app.use("/api/v1/story", storyRouter);
app.use("/api/v1/message", messageRouter);

app.get("/", (_req, res) => res.send("API is running..."));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Use http.createServer so Socket.IO can share the same port as Express
const httpServer = createServer(app);
initSocket(httpServer);

connectDB();

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`[mailer] Active SMTP Host: ${process.env.SMTP_HOST || "none (Ethereal Fallback)"}`);
});

