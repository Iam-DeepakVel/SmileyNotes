import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { noteRoutes } from "./routes/notes.routes";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import { userRoutes } from "./routes/user.routes";
import session from "express-session";
import env from "./util/validateEnv";
import MongoStore from "connect-mongo";
import { requireAuth } from "./middleware/auth";

const app = express();

// Morgan
app.use(morgan("dev"));

// Express now accepts json
app.use(express.json());

// Session Configuration
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
    },
    rolling: true,
    store: MongoStore.create({
      mongoUrl: env.MONGO_URI,
    }),
  })
);

// Routes
app.use("/api/v1/notes", requireAuth, noteRoutes);
app.use("/api/v1/users", userRoutes);

// Route Not Found
app.use((req: Request, res: Response, next) => {
  next(createHttpError(404, "Endpoint not Found"));
});

// Error handler Middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  let errorMessage = "An unknown Error Occured";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
});

export default app;
